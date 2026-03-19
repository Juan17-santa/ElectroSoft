import { generatePDFReport } from "../../../../../utils/PDFReportGenerator"; // ajusta el path

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

/**
 * Reporte general — todos los clientes con cupo de crédito
 */
export const generarReporteGeneral = (clientes) => {

    const columns = [
        "Cliente",
        "Documento",
        "Cupo total",
        "Cupo ocupado",
        "Cupo disponible",
        "Ventas pendientes",
        "Estado"
    ];

    const data = clientes.map(c => [
        `${c.nombres} ${c.apellidos}`,
        `${c.tipoDocumento} ${c.documento}`,
        fmt(c.cupoCredito),
        fmt(c.cupoOcupado),
        fmt(c.cupoDisponible),
        String(c.totalVentas),
        c.estado === false ? "Suspendido" : "Activo"
    ]);

    const totalCupoAsignado  = clientes.reduce((acc, c) => acc + c.cupoCredito,    0);
    const totalCupoOcupado   = clientes.reduce((acc, c) => acc + c.cupoOcupado,    0);
    const totalCupoDisponible = clientes.reduce((acc, c) => acc + c.cupoDisponible, 0);
    const clientesSuspendidos = clientes.filter(c => c.estado === false).length;

    generatePDFReport({
        title: "Reporte General de Créditos y Abonos",
        fileName: `reporte_creditos_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        data,
        extraInfo: [
            `Total clientes con cupo: ${clientes.length}`,
            `Clientes suspendidos: ${clientesSuspendidos}`,
            `Clientes activos: ${clientes.length - clientesSuspendidos}`,
        ],
        totals: [
            `Cupo total asignado: ${fmt(totalCupoAsignado)}`,
            `Cupo total ocupado: ${fmt(totalCupoOcupado)}`,
            `Cupo total disponible: ${fmt(totalCupoDisponible)}`,
        ],
        headColor: [234, 179, 8]
    });
};

/**
 * Reporte individual — cuenta de crédito de un cliente específico
 */
export const generarReporteCliente = (resumen, ventas) => {

    const columnsVentas = [
        "N° Venta",
        "Fecha",
        "Fecha límite",
        "Total venta",
        "Pagado",
        "Saldo pendiente",
        "Abonos",
        "Estado"
    ];

    const dataVentas = ventas.map(v => [
        v.numeroVenta || `V-${v.id}`,
        v.fecha       || "—",
        v.fechaLimite || "—",
        fmt(v.total),
        fmt(v.montoPagado || 0),
        fmt(v.montoPorPagar),
        String((v.abonos || []).length),
        v.estado === "Anulada" ? "Vencida" :
        v.estado === "Finalizado" ? "Finalizado" : "Pendiente"
    ]);

    // Tabla de abonos detallada de cada venta
    const detalleAbonos = [];
    ventas.forEach(v => {
        if ((v.abonos || []).length > 0) {
            detalleAbonos.push([
                `Abonos de ${v.numeroVenta || `V-${v.id}`}`, "", "", ""
            ]);
            v.abonos.forEach(a => {
                detalleAbonos.push([
                    a.fecha       || "—",
                    a.metodoPago  || "—",
                    fmt(a.monto),
                    ""
                ]);
            });
        }
    });

    const totalPendiente = ventas.reduce((acc, v) => acc + v.montoPorPagar,    0);
    const totalPagado    = ventas.reduce((acc, v) => acc + (v.montoPagado || 0), 0);

    generatePDFReport({
        title: `Estado de Cuenta — ${resumen.nombres} ${resumen.apellidos}`,
        fileName: `estado_cuenta_${resumen.documento}_${new Date().toISOString().split("T")[0]}.pdf`,
        columns: columnsVentas,
        data: dataVentas.length > 0 ? dataVentas : [["Sin ventas a crédito pendientes", "", "", "", "", "", "", ""]],
        extraInfo: [
            `Cliente: ${resumen.nombres} ${resumen.apellidos}`,
            `Documento: ${resumen.tipoDocumento} ${resumen.documento}`,
            `Email: ${resumen.email || "—"}`,
            `Teléfono: ${resumen.telefono || "—"}`,
            `Estado: ${resumen.estado === false ? "Suspendido" : "Activo"}`,
            ``,
            `Cupo total asignado: ${fmt(resumen.cupoCredito)}`,
            `Cupo ocupado: ${fmt(resumen.cupoOcupado)}`,
            `Cupo disponible: ${fmt(resumen.cupoDisponible)}`,
        ],
        totals: [
            `Total pagado: ${fmt(totalPagado)}`,
            `Saldo pendiente: ${fmt(totalPendiente)}`,
        ],
        headColor: [234, 179, 8]
    });
};

/**
 * Reporte detalle de una sola venta
 */
export const generarReporteVenta = (venta, abonosTable) => {

    const fmt = (val) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", minimumFractionDigits: 0
    }).format(val ?? 0);

    const montoPagado = (venta.abonos || []).reduce((acc, a) => acc + Number(a.monto), 0);

    const columnsAbonos = ["Fecha", "Método de pago", "Abono", "Saldo pendiente"];

    const dataAbonos = abonosTable.map(row => [
        row.fecha || "—",
        row.metodoPago || "—",
        row.abono === 0 ? "$0"
            : row.abono < 0 ? `-${fmt(Math.abs(row.abono))}`
            : `+${fmt(row.abono)}`,
        fmt(row.saldoPendiente)
    ]);

    generatePDFReport({
        title: `Detalle de Venta — ${venta.numeroVenta || `V-${venta.id}`}`,
        fileName: `detalle_venta_${venta.numeroVenta || venta.id}_${new Date().toISOString().split("T")[0]}.pdf`,
        columns: columnsAbonos,
        data: dataAbonos.length > 0 ? dataAbonos : [["Sin abonos registrados", "", "", ""]],
        extraInfo: [
            `Cliente: ${venta.cliente || "—"}`,
            `N° Venta: ${venta.numeroVenta || `V-${venta.id}`}`,
            `Fecha de venta: ${venta.fecha || "—"}`,
            `Fecha límite: ${venta.fechaLimite || "—"}`,
            `Estado: ${venta.estado === "Anulada" ? "Vencida" : venta.estado === "Finalizado" ? "Finalizado" : "Pendiente"}`,
            ``,
            `Total venta: ${fmt(venta.total)}`,
            `Monto pagado: ${fmt(montoPagado)}`,
            `Saldo pendiente: ${fmt(venta.montoPorPagar)}`,
        ],
        totals: [
            `Pagado: ${fmt(montoPagado)}`,
            `Pendiente: ${fmt(venta.montoPorPagar)}`,
        ],
        headColor: [234, 179, 8]
    });
};