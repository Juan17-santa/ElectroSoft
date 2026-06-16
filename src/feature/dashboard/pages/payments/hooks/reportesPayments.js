import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import * as XLSX from "xlsx";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

const hoy = () => new Date().toISOString().split("T")[0];

/**
 * Reporte general — todos los clientes con cupo de crédito
 * Una hoja por cliente con sus ventas y abonos detallados
 * + una hoja resumen general
 * 
 * @param {Array}  clientes   - Array de clientes con cupo (desde getClientesConCupo)
 * @param {string} fechaInicio - Fecha ISO inicio del filtro (YYYY-MM-DD), opcional
 * @param {string} fechaFin   - Fecha ISO fin del filtro (YYYY-MM-DD), opcional
 */
export const generarReporteGeneral = (clientes, fechaInicio, fechaFin) => {
    const workbook = XLSX.utils.book_new();

    // ── Aplicar filtro de fechas a ventas de cada cliente ───────────
    const clientesFiltrados = clientes
        .map(c => {
            // Si no se proporcionan fechas, usar todas las ventas
            if (!fechaInicio && !fechaFin) return c;

            const ventasFiltradas = (c.ventas || []).filter(v => {
                const fechaVenta = v.fecha || "";
                const dentroDeInicio = !fechaInicio || fechaVenta >= fechaInicio;
                const dentroDeFin    = !fechaFin    || fechaVenta <= fechaFin;
                return dentroDeInicio && dentroDeFin;
            });

            // Recalcular cupo ocupado solo con ventas filtradas
            const cupoOcupado = ventasFiltradas.reduce((acc, v) => acc + (v.montoPorPagar || 0), 0);

            return {
                ...c,
                ventas: ventasFiltradas,
                totalVentas: ventasFiltradas.length,
                cupoOcupado,
                cupoDisponible: Math.max(c.cupoCredito - cupoOcupado, 0),
            };
        })
        .filter(c => !fechaInicio && !fechaFin ? true : c.ventas.length > 0); // Si hay filtro, excluir clientes sin ventas en rango

    const periodoLabel = fechaInicio || fechaFin
        ? `${fechaInicio || "inicio"} — ${fechaFin || "hoy"}`
        : "Todos los períodos";

    // ── HOJA 1: Resumen general ──────────────────────────────────────
    const totalCupoAsignado   = clientesFiltrados.reduce((acc, c) => acc + c.cupoCredito,    0);
    const totalCupoOcupado    = clientesFiltrados.reduce((acc, c) => acc + c.cupoOcupado,    0);
    const totalCupoDisponible = clientesFiltrados.reduce((acc, c) => acc + c.cupoDisponible, 0);
    const clientesSuspendidos = clientesFiltrados.filter(c => c.estado === false).length;

    const resumenData = [
        ["REPORTE GENERAL DE CRÉDITOS Y ABONOS"],
        [`Generado: ${hoy()}`],
        [`Período: ${periodoLabel}`],
        [],
        ["RESUMEN EJECUTIVO"],
        ["Total clientes con cupo",  clientesFiltrados.length],
        ["Clientes activos",         clientesFiltrados.length - clientesSuspendidos],
        ["Clientes suspendidos",     clientesSuspendidos],
        ["Cupo total asignado",      fmt(totalCupoAsignado)],
        ["Cupo total ocupado",       fmt(totalCupoOcupado)],
        ["Cupo total disponible",    fmt(totalCupoDisponible)],
        [],
        ["DETALLE POR CLIENTE"],
        [
            "Cliente",
            "Tipo Doc",
            "Documento",
            "Email",
            "Teléfono",
            "Estado cliente",
            "Estado pago",
            "Cupo total",
            "Cupo ocupado",
            "Cupo disponible",
            "Ventas pendientes",
        ],
        ...clientesFiltrados.map(c => {
            const estadoPago = c.estado === false
                ? "Suspendido"
                : c.cupoOcupado > 0 ? "Por pagar" : "Al día";
            return [
                `${c.nombres} ${c.apellidos}`,
                c.tipoDocumento,
                c.documento,
                c.email    || "—",
                c.telefono || "—",
                c.estado === false ? "Suspendido" : "Activo",
                estadoPago,
                fmt(c.cupoCredito),
                fmt(c.cupoOcupado),
                fmt(c.cupoDisponible),
                c.totalVentas,
            ];
        }),
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen["!cols"] = [
        { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 28 },
        { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 18 },
        { wch: 18 }, { wch: 18 }, { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsResumen, "Resumen general");

    // ── HOJA POR CLIENTE: ventas + abonos ───────────────────────────
    clientesFiltrados.forEach(c => {
        const rows = [];

        // Encabezado cliente
        rows.push([`ESTADO DE CUENTA — ${c.nombres} ${c.apellidos}`]);
        rows.push([`Documento: ${c.tipoDocumento} ${c.documento}`]);
        rows.push([`Email: ${c.email || "—"}   Teléfono: ${c.telefono || "—"}`]);
        rows.push([`Estado: ${c.estado === false ? "Suspendido" : "Activo"}`]);
        rows.push([`Período filtrado: ${periodoLabel}`]);
        rows.push([]);
        rows.push(["Cupo total", fmt(c.cupoCredito), "Cupo ocupado", fmt(c.cupoOcupado), "Cupo disponible", fmt(c.cupoDisponible)]);
        rows.push([]);

        if (!c.ventas || c.ventas.length === 0) {
            rows.push(["Sin ventas a crédito en el período seleccionado."]);
        } else {
            c.ventas.forEach((v, vi) => {
                const estadoVenta = v.estado === "Anulada" || v.estado === "Anulado"
                    ? "Vencida"
                    : v.estado === "Finalizado" ? "Finalizado" : "Pendiente";

                // Cabecera venta
                rows.push([`VENTA ${vi + 1} — ${v.numeroVenta || `V-${v.id}`}`]);
                rows.push(["Fuente",         v.fuente === "pedido" ? "Pedido" : "Venta"]);
                rows.push(["Fecha",          v.fecha       || "—"]);
                rows.push(["Fecha límite",   v.fechaLimite || "—"]);
                rows.push(["Total venta",    fmt(v.total)]);
                rows.push(["Total pagado",   fmt(v.montoPagado || 0)]);
                rows.push(["Saldo pendiente",fmt(v.montoPorPagar)]);
                rows.push(["Estado",         estadoVenta]);
                rows.push([]);

                // Abonos de esta venta
                const abonos = (v.abonos || []);
                if (abonos.length === 0) {
                    rows.push(["  Sin abonos registrados."]);
                } else {
                    rows.push(["  ABONOS"]);
                    rows.push(["  #", "Fecha", "Método de pago", "Monto", "Estado abono"]);
                    abonos.forEach((a, ai) => {
                        rows.push([
                            ai + 1,
                            a.fecha       || "—",
                            a.metodoPago  || "—",
                            fmt(a.monto),
                            a.anulado ? "Anulado" : "Válido",
                        ]);
                    });

                    // Subtotal abonos válidos
                    const totalAbonosValidos = abonos
                        .filter(a => !a.anulado)
                        .reduce((acc, a) => acc + Number(a.monto), 0);
                    rows.push(["  Total abonado", "", "", fmt(totalAbonosValidos), ""]);
                }
                rows.push([]);
                rows.push(["─────────────────────────────────────────────"]);
                rows.push([]);
            });
        }

        const wsCliente = XLSX.utils.aoa_to_sheet(rows);
        wsCliente["!cols"] = [
            { wch: 22 }, { wch: 18 }, { wch: 20 },
            { wch: 18 }, { wch: 14 },
        ];

        // Nombre de hoja: máx 31 chars, sin caracteres especiales
        const nombreHoja = `${c.nombres} ${c.apellidos}`
            .substring(0, 28)
            .replace(/[:\\/?*[\]]/g, "");

        XLSX.utils.book_append_sheet(workbook, wsCliente, nombreHoja);
    });

    const sufijo = fechaInicio || fechaFin ? `_${fechaInicio || ""}_${fechaFin || ""}` : "";
    XLSX.writeFile(workbook, `reporte_creditos${sufijo}_${hoy()}.xlsx`);
};


/**
 * Reporte individual — estado de cuenta de un cliente
 * Una sola hoja con sus ventas y el detalle de abonos de cada una
 */
export const generarReporteCliente = (resumen, ventas) => {
    const rows = [];

    // ── Encabezado ──────────────────────────────────────────────────
    rows.push([`ESTADO DE CUENTA — ${resumen.nombres} ${resumen.apellidos}`]);
    rows.push([`Generado: ${hoy()}`]);
    rows.push([]);
    rows.push(["DATOS DEL CLIENTE"]);
    rows.push(["Nombre",    `${resumen.nombres} ${resumen.apellidos}`]);
    rows.push(["Documento", `${resumen.tipoDocumento} ${resumen.documento}`]);
    rows.push(["Email",     resumen.email    || "—"]);
    rows.push(["Teléfono",  resumen.telefono || "—"]);
    rows.push(["Estado",    resumen.estado === false ? "Suspendido" : "Activo"]);
    rows.push([]);
    rows.push(["RESUMEN DE CRÉDITO"]);
    rows.push(["Cupo total asignado",  fmt(resumen.cupoCredito)]);
    rows.push(["Cupo ocupado",         fmt(resumen.cupoOcupado)]);
    rows.push(["Cupo disponible",      fmt(resumen.cupoDisponible)]);
    rows.push(["Ventas pendientes",    resumen.totalVentas]);
    rows.push([]);

    // ── Ventas + abonos ─────────────────────────────────────────────
    if (ventas.length === 0) {
        rows.push(["Sin ventas a crédito registradas."]);
    } else {
        const totalPagado    = ventas.reduce((acc, v) => acc + (v.montoPagado || 0), 0);
        const totalPendiente = ventas.reduce((acc, v) => acc + v.montoPorPagar,      0);

        rows.push(["VENTAS A CRÉDITO"]);
        rows.push([
            "N° Venta", "Tipo", "Fecha", "Fecha límite",
            "Total", "Pagado", "Saldo pendiente", "Estado",
        ]);
        ventas.forEach(v => {
            const estadoVenta = v.estado === "Anulada" || v.estado === "Anulado"
                ? "Vencida"
                : v.estado === "Finalizado" ? "Finalizado" : "Pendiente";
            rows.push([
                v.numeroVenta || `V-${v.id}`,
                v.fuente === "pedido" ? "Pedido" : "Venta",
                v.fecha       || "—",
                v.fechaLimite || "—",
                fmt(v.total),
                fmt(v.montoPagado || 0),
                fmt(v.montoPorPagar),
                estadoVenta,
            ]);
        });
        rows.push(["", "", "", "", "TOTALES", fmt(totalPagado), fmt(totalPendiente), ""]);
        rows.push([]);

        // ── Detalle de abonos por venta ──────────────────────────────
        rows.push(["DETALLE DE ABONOS POR VENTA"]);
        rows.push([]);

        ventas.forEach(v => {
            const abonos = (v.abonos || []);
            rows.push([`${v.numeroVenta || `V-${v.id}`} — ${v.fuente === "pedido" ? "Pedido" : "Venta"}`]);

            if (abonos.length === 0) {
                rows.push(["  Sin abonos registrados."]);
            } else {
                rows.push(["  #", "Fecha", "Método de pago", "Monto", "Estado abono"]);
                abonos.forEach((a, i) => {
                    rows.push([
                        i + 1,
                        a.fecha      || "—",
                        a.metodoPago || "—",
                        fmt(a.monto),
                        a.anulado ? "Anulado" : "Válido",
                    ]);
                });
                const totalValidos = abonos
                    .filter(a => !a.anulado)
                    .reduce((acc, a) => acc + Number(a.monto), 0);
                rows.push(["  Total abonado", "", "", fmt(totalValidos), ""]);
            }
            rows.push([]);
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [
        { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estado de cuenta");
    XLSX.writeFile(wb, `estado_cuenta_${resumen.documento}_${hoy()}.xlsx`);
};

/**
 * Reporte detalle de una sola venta con historial de abonos
 */
export const generarReporteVenta = (venta, abonosTable) => {
    const montoPagado = (venta.abonos || [])
        .filter(a => !a.anulado)
        .reduce((acc, a) => acc + Number(a.monto), 0);

    const rows = [];

    rows.push([`DETALLE DE VENTA — ${venta.numeroVenta || `V-${venta.id}`}`]);
    rows.push([`Generado: ${hoy()}`]);
    rows.push([]);
    rows.push(["DATOS DE LA VENTA"]);
    rows.push(["N° Venta",       venta.numeroVenta || `V-${venta.id}`]);
    rows.push(["Cliente",        venta.cliente     || "—"]);
    rows.push(["Fecha de venta", venta.fecha       || "—"]);
    rows.push(["Fecha límite",   venta.fechaLimite || "—"]);
    rows.push(["Estado",
        venta.estado === "Anulada" || venta.estado === "Anulado" ? "Vencida" :
        venta.estado === "Finalizado" ? "Finalizado" : "Pendiente"
    ]);
    rows.push([]);
    rows.push(["RESUMEN FINANCIERO"]);
    rows.push(["Total venta",    fmt(venta.total)]);
    rows.push(["Total pagado",   fmt(montoPagado)]);
    rows.push(["Saldo pendiente",fmt(venta.montoPorPagar)]);
    rows.push([]);
    rows.push(["HISTORIAL DE ABONOS"]);
    rows.push(["Fecha", "Método de pago", "Movimiento", "Saldo pendiente", "Tipo"]);

    abonosTable.forEach(row => {
        rows.push([
            row.fecha      || "—",
            row.metodoPago || "—",
            row.abono === 0     ? "$0"
                : row.abono < 0 ? `-${fmt(Math.abs(row.abono))}`
                                : `+${fmt(row.abono)}`,
            fmt(row.saldoPendiente),
            row.tipo === "inicio"  ? "Deuda inicial" :
            row.tipo === "anulado" ? "Anulado"       :
            row.tipo === "ultimo"  ? "Saldo final"   : "Abono",
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [
        { wch: 16 }, { wch: 20 }, { wch: 18 },
        { wch: 18 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle venta");
    XLSX.writeFile(wb, `detalle_venta_${venta.numeroVenta || venta.id}_${hoy()}.xlsx`);
};