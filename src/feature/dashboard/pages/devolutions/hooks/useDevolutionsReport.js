import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import { fetchSalesByIds } from "../services/fetchSales";

const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

function calcularMonto(devolucion, venta) {
    if (!venta) return 0;

    const productoVenta = (venta.productos || []).find(
        (producto) =>
            (producto.productoId?._id && String(producto.productoId._id) === String(devolucion.productoId)) ||
            producto.nombre === devolucion.producto,
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

export function useDevolutionsReport(notify) {
    const exportReport = async (fechaInicio, fechaFin) => {
        let filtradas = [];
        try {
            // Se descarga por lotes hasta agotar las páginas del rango.
            const limit = 5000;
            let page = 1;
            let totalPages = 1;
            do {
                const result = await ServicesDevolutions.exportReport({
                    from: fechaInicio,
                    to: fechaFin,
                    page,
                    limit,
                });
                filtradas = filtradas.concat(result.data);
                totalPages = result.pagination?.totalPages ?? 1;
                page += 1;
                if (page > 500) break;
            } while (page <= totalPages);
        } catch (err) {
            notify("error", err.message);
            return;
        }

        if (filtradas.length === 0) {
            notify("error", "No hay devoluciones en el rango de fechas seleccionado.");
            return;
        }

        // Solo las ventas involucradas en el rango (evita descargar todo el histórico).
        let ventas = [];
        try {
            const idsVentas = [...new Set(filtradas.map((d) => String(d.idVenta || "")).filter(Boolean))];
            ventas = await fetchSalesByIds(idsVentas);
        } catch (err) {
            notify("error", err.message);
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

        // ─── KPIs ───────────────────────────────────────────
        const totalDevoluciones = filtradas.length;
        const totalProductosDevueltos = filtradas.reduce(
            (acc, d) => acc + Number(d.cantidad || 0), 0
        );
        const resueltas = filtradas.filter(d => d.estadoResolucion === "RESUELTO").length;
        const pendientes = filtradas.filter(d =>
            d.estadoResolucion !== "RESUELTO" && d.estadoResolucion !== "Anulada"
        ).length;
        const anuladas = filtradas.filter(d => d.estadoResolucion === "Anulada").length;
        const pctResueltas = totalDevoluciones ? ((resueltas / totalDevoluciones) * 100).toFixed(1) : "0.0";
        const pctPendientes = totalDevoluciones ? ((pendientes / totalDevoluciones) * 100).toFixed(1) : "0.0";

        // ─── RESUMEN GENERAL ─────────────────────────────────
        excelData.push(["RESUMEN GENERAL"]);
        excelData.push(["Rango", `${formatFechaDisplay(fechaInicio)} - ${formatFechaDisplay(fechaFin)}`]);
        excelData.push(["Total devoluciones", totalDevoluciones]);
        excelData.push(["Productos devueltos", totalProductosDevueltos]);
        excelData.push(["Resueltas", `${resueltas} (${pctResueltas}%)`]);
        excelData.push(["Pendientes", `${pendientes} (${pctPendientes}%)`]);
        excelData.push(["Anuladas", anuladas]);
        excelData.push([]);
        excelData.push([]);

        // ─── LISTADO ─────────────────────────────────────────
         excelData.push(["TIPO", "REFERENCIA", "CLIENTE / PRODUCTO", "FECHA INICIO", "ULTIMA ACTUALIZACION", "CANTIDAD", "VALOR", "MONTO REEMBOLSADO", "MOTIVO", "GESTION", "ESTADO"]);

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
                 "",
                 "",
                 "",
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
                         formatFechaDisplay(devolucion.fechaEstado),
                         String(devolucion.cantidad ?? "-"),
                         fmt(calcularMonto(devolucion, venta)),
                         devolucion.gestion === "REEMBOLSO_TOTAL" || devolucion.gestion === "REEMBOLSO_PARCIAL"
                             ? (Number(devolucion.montoReembolso) > 0 ? fmt(devolucion.montoReembolso) : "N/A")
                             : "N/A",
                         devolucion.motivo || "-",
                        devolucion.gestion || "-",
                        devolucion.estadoResolucion || "-",
                    ]);
                });

            excelData.push([]);
        });

        generateExcelReport({
            title: "REPORTE GENERAL DE GESTION DE DEVOLUCIONES",
            fileName: `Reporte_Devoluciones_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [],
            data: excelData,
        });

        notify("success", "Reporte de devoluciones generado correctamente.");
    };

    return { exportReport };
}
