import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchSales() {
    const response = await fetch(`${API_BASE}/sales`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || body.message || "No se pudieron cargar las ventas");
    return Array.isArray(body.data) ? body.data.map(normalizeSale) : [];
}

function normalizeSale(sale) {
    return {
        ...sale,
        id: sale._id || sale.id,
        numeroVenta: sale.numeroVenta || sale.numeroFactura,
        numeroDocumento: sale.numeroDocumento || sale.clienteId?.documentNumber,
        cliente:
            sale.cliente ||
            [sale.clienteId?.firstName, sale.clienteId?.lastName].filter(Boolean).join(" "),
        fecha: sale.fecha || sale.fechaVenta || sale.fechaCreacion?.slice?.(0, 10),
        estado: sale.estado === "ANULADA" ? "Anulado" : sale.estado,
        productos: (sale.productos || []).map((producto) => ({
            ...producto,
            nombre: producto.nombre || producto.producto?.name || producto.name,
            precio: producto.precio || producto.precioUnitario || producto.producto?.price || 0,
        })),
    };
}

const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

function calcularMonto(devolucion, venta) {
    if (!venta) return 0;

    const productoVenta = (venta.productos || []).find(
        (producto) => producto.nombre === devolucion.producto,
    );

    if (!productoVenta) return 0;

    return Number(devolucion.cantidad || 0) * Number(productoVenta.precio || 0);
}

function getFechaRegistro(devolucion) {
    return devolucion.fechaDevolucion ?? devolucion.fechaEstado ?? devolucion.creadoEn ?? "";
}

function formatFechaDisplay(fechaISO) {
    if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return fechaISO || "-";
    const [y, m, d] = fechaISO.split("-");
    return `${d}/${m}/${y}`;
}

export function useDevolutionsReport(devolucionesFiltradas, setAlert) {
    const exportReport = async (fechaInicio, fechaFin) => {
        let ventas = [];
        try {
            ventas = await fetchSales();
        } catch (err) {
            setAlert({ type: "error", message: err.message });
            return;
        }

        const filtradas = devolucionesFiltradas.filter((devolucion) => {
            const fecha = devolucion.fechaDevolucion ?? devolucion.fechaEstado ?? "";
            return fecha >= fechaInicio && fecha <= fechaFin;
        });

        if (filtradas.length === 0) {
            setAlert({ type: "error", message: "No hay devoluciones en el rango de fechas seleccionado." });
            return;
        }

        const gruposMap = {};

        filtradas.forEach((devolucion) => {
            const key = String(devolucion.idVenta || "sin-venta");
            if (!gruposMap[key]) gruposMap[key] = [];
            gruposMap[key].push(devolucion);
        });

        const grupos = Object.values(gruposMap).sort((grupoA, grupoB) => {
            const fechaA = grupoA.reduce((max, devolucion) => {
                const fecha = getFechaRegistro(devolucion);
                return fecha > max ? fecha : max;
            }, "");
            const fechaB = grupoB.reduce((max, devolucion) => {
                const fecha = getFechaRegistro(devolucion);
                return fecha > max ? fecha : max;
            }, "");

            return fechaB.localeCompare(fechaA);
        });

        const excelData = [];
        let contadorGrupo = 0;

        grupos.forEach((grupo) => {
            const idVenta = grupo[0].idVenta;
            const venta = ventas.find((item) => String(item.id) === String(idVenta));
            contadorGrupo += 1;

            const referenciaVenta = venta?.numeroVenta != null
                ? `Venta #${String(venta.numeroVenta).padStart(2, "0")}`
                : `Grupo #${String(contadorGrupo).padStart(2, "0")}`;

            excelData.push([
                "VENTA",
                referenciaVenta,
                venta?.cliente || venta?.numeroDocumento || "-",
                venta?.fecha || "-",
                "",
                "",
                "",
                "",
                venta?.estado || "-",
            ]);

            grupo
                .slice()
                .sort((a, b) => getFechaRegistro(b).localeCompare(getFechaRegistro(a)))
                .forEach((devolucion) => {
                    excelData.push([
                        "DEVOLUCION",
                        "",
                        devolucion.producto || "-",
                        formatFechaDisplay(devolucion.fechaDevolucion),
                        String(devolucion.cantidad ?? "-"),
                        fmt(calcularMonto(devolucion, venta)),
                        devolucion.motivo || "-",
                        devolucion.gestion || "-",
                        devolucion.estadoResolucion || "-",
                    ]);
                });

            excelData.push(["", "", "", "", "", "", "", "", ""]);
        });

        generateExcelReport({
            title: "REPORTE GENERAL DE GESTION DE DEVOLUCIONES",
            fileName: `Reporte_Devoluciones_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [
                "TIPO",
                "REFERENCIA",
                "CLIENTE / PRODUCTO",
                "FECHA",
                "CANTIDAD",
                "VALOR",
                "MOTIVO",
                "GESTION",
                "ESTADO",
            ],
            data: excelData,
        });

        setAlert({ type: "success", message: "Reporte de devoluciones generado correctamente." });
    };

    return { exportReport };
}
