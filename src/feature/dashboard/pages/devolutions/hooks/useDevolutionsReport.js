import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";

const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

/**
 * Calcula el monto de devolución:
 *   cantidad devuelta × precio unitario del producto en la venta original.
 */
function calcularMonto(devolucion, venta) {
    if (!venta) return 0;
    const prod = (venta.productos || []).find((p) => p.nombre === devolucion.producto);
    if (!prod) return 0;
    return Number(devolucion.cantidad || 0) * Number(prod.precio || 0);
}

/**
 * Hook para generar el reporte Excel de devoluciones filtrado por rango de fechas.
 *
 * Estructura del reporte — agrupado por venta:
 *
 *   ┌─ FILA VENTA  → Venta #03 | Cliente | Fecha venta | Total venta | (celdas devolución vacías)
 *   ├─ fila dev    →           | Dev #01 | Producto | Cantidad | Monto dev | Motivo | Gestión | Estado
 *   ├─ fila dev    →           | Dev #02 | ...
 *   └─ (fila vacía separadora)
 */
export function useDevolutionsReport(devolucionesFiltradas, setAlert) {

    const exportReport = (fechaInicio, fechaFin) => {

        // ── Cargar datos ───────────────────────────────────────────────────────
        const ventas = (() => {
            try { return JSON.parse(localStorage.getItem("sales") || "[]"); }
            catch { return []; }
        })();

        // Número secuencial por devolución: ordenar todas por creadoEn y asignar posición
        const todasOrdenadas = (() => {
            try {
                return JSON.parse(localStorage.getItem("devolutions") || "[]")
                    .slice()
                    .sort((a, b) => (a.creadoEn ?? "").localeCompare(b.creadoEn ?? ""));
            }
            catch { return []; }
        })();
        const numDevMap = {};
        todasOrdenadas.forEach((d, i) => { numDevMap[String(d.id)] = i + 1; });

        // ── Filtrar por rango de fechas (fechaISO YYYY-MM-DD) ─────────────────
        const filtradas = devolucionesFiltradas.filter((d) => {
            const f = d.fechaISO ?? d.fechaEstado ?? "";
            return f >= fechaInicio && f <= fechaFin;
        });

        if (filtradas.length === 0) {
            setAlert({ type: "error", message: "No hay devoluciones en el rango de fechas seleccionado." });
            return;
        }

        // ── Agrupar devoluciones filtradas por idVenta ────────────────────────
        const gruposMap = {};
        filtradas.forEach((d) => {
            const k = String(d.idVenta);
            if (!gruposMap[k]) gruposMap[k] = [];
            gruposMap[k].push(d);
        });
        // Ordenar grupos: venta más reciente primero
        const grupos = Object.values(gruposMap).sort((a, b) =>
            (b[0].creadoEn ?? "").localeCompare(a[0].creadoEn ?? "")
        );

        // ── Construir filas Excel ──────────────────────────────────────────────
        // Columnas:
        // TIPO | FACTURA VENTA | FACTURA DEVOLUCIÓN | CLIENTE / PRODUCTO |
        // FECHA | CANTIDAD | TOTAL / MONTO DEV | MOTIVO | GESTIÓN | ESTADO
        const excelData = [];
        let contadorVenta = 0;

        grupos.forEach((grupo) => {
            const idVenta = grupo[0].idVenta;
            const venta   = ventas.find((v) => String(v.id) === String(idVenta));
            contadorVenta++;

            const numVenta     = venta?.numeroVenta;
            const labelVenta   = numVenta
                ? `Venta #${String(numVenta).padStart(2, "0")}`
                : `Venta #${String(contadorVenta).padStart(2, "0")}`;
            const cliente      = venta?.cliente || venta?.numeroDocumento || "—";
            const fechaVenta   = venta?.fecha ?? "—";
            const totalVenta   = venta?.total != null ? fmt(venta.total) : "—";

            // ── Fila cabecera de la venta ──────────────────────────────────────
            // TIPO | FACTURA VENTA | — | CLIENTE | FECHA VENTA | — | TOTAL VENTA | — | — | —
            excelData.push([
                "VENTA",
                labelVenta,
                "",
                cliente,
                fechaVenta,
                "",
                totalVenta,
                "",
                "",
                "",
            ]);

            // ── Filas de cada devolución ───────────────────────────────────────
            grupo.forEach((d) => {
                const numDev      = numDevMap[String(d.id)];
                const labelDev    = numDev
                    ? `Dev #${String(numDev).padStart(2, "0")}`
                    : `Dev ID ${d.id}`;
                const monto       = calcularMonto(d, venta);
                const fechaDev    = d.fechaISO ?? d.fecha ?? "—";

                // TIPO | — | FACTURA DEV | PRODUCTO | FECHA DEV | CANTIDAD | MONTO DEV | MOTIVO | GESTIÓN | ESTADO
                excelData.push([
                    "  └ DEVOLUCIÓN",
                    "",
                    labelDev,
                    d.producto ?? "—",
                    fechaDev,
                    String(d.cantidad ?? "—"),
                    fmt(monto),
                    d.motivo ?? "—",
                    d.gestion ?? "—",
                    d.estadoResolucion ?? "—",
                ]);
            });

            // ── Fila vacía separadora entre grupos ────────────────────────────
            excelData.push(["", "", "", "", "", "", "", "", "", ""]);
        });

        generateExcelReport({
            title: "➤ REPORTE GENERAL DE GESTIÓN DE DEVOLUCIONES",
            fileName: `Reporte_Devoluciones_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [
                "TIPO",
                "FACTURA VENTA",
                "FACTURA DEVOLUCIÓN",
                "CLIENTE / PRODUCTO",
                "FECHA",
                "CANTIDAD",
                "TOTAL / MONTO DEV",
                "MOTIVO",
                "GESTIÓN",
                "ESTADO",
            ],
            data: excelData,
        });

        setAlert({ type: "success", message: "Reporte de devoluciones generado correctamente." });
    };

    return { exportReport };
}
