import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";
import * as XLSX from "xlsx-js-style";

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
    // ── Aplicar filtro de fechas a ventas de cada cliente ───────────
    const clientesFiltrados = clientes
        .map(c => {
            if (!fechaInicio && !fechaFin) return c;
            const ventasFiltradas = (c.ventas || []).filter(v => {
                const fechaVenta = v.fecha || "";
                return (!fechaInicio || fechaVenta >= fechaInicio) && (!fechaFin || fechaVenta <= fechaFin);
            });
            const cupoOcupado = ventasFiltradas.reduce((acc, v) => acc + (v.montoPorPagar || 0), 0);
            return {
                ...c,
                ventas: ventasFiltradas,
                totalVentas: ventasFiltradas.length,
                cupoOcupado,
                cupoDisponible: Math.max(c.cupoCredito - cupoOcupado, 0),
            };
        })
        .filter(c => !fechaInicio && !fechaFin ? true : c.ventas.length > 0);

    const periodoLabel = fechaInicio || fechaFin
        ? `${fechaInicio || "inicio"} — ${fechaFin || "hoy"}`
        : "Todos los períodos";

    const totalCupoAsignado   = clientesFiltrados.reduce((acc, c) => acc + c.cupoCredito,    0);
    const totalCupoOcupado    = clientesFiltrados.reduce((acc, c) => acc + c.cupoOcupado,    0);
    const totalCupoDisponible = clientesFiltrados.reduce((acc, c) => acc + c.cupoDisponible, 0);
    const clientesSuspendidos = clientesFiltrados.filter(c => c.estado === false).length;

    const resumenData = [
        ["Período de análisis:", periodoLabel],
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
        [],
        ["RESUMEN EJECUTIVO"],
        ["Total clientes con cupo",  clientesFiltrados.length],
        ["Clientes activos",         clientesFiltrados.length - clientesSuspendidos],
        ["Clientes suspendidos",     clientesSuspendidos],
        ["Cupo total asignado",      fmt(totalCupoAsignado)],
        ["Cupo total ocupado",       fmt(totalCupoOcupado)],
        ["Cupo total disponible",    fmt(totalCupoDisponible)],
    ];

    const sufijo = fechaInicio || fechaFin ? `_${fechaInicio || ""}_${fechaFin || ""}` : "";
    generateExcelReport({
        title: "Reporte General de Créditos y Abonos",
        fileName: `reporte_creditos${sufijo}_${hoy()}.xlsx`,
        columns: [],
        data: resumenData
    });
};


/**
 * Reporte individual — estado de cuenta de un cliente
 * Una sola hoja con sus ventas y el detalle de abonos de cada una
 */
export const generarReporteCliente = (resumen, ventas) => {
    const rows = [];

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
    rows.push(["Ventas pendientes",    String(resumen.totalVentas)]);
    rows.push([]);

    // ── Ventas + abonos ─────────────────────────────────────────────
    if (ventas.length === 0) {
        rows.push(["Sin ventas a crédito registradas.", ""]);
    } else {
        const totalVenta     = ventas.reduce((acc, v) => acc + (v.total || 0),       0);
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
        rows.push(["", "", "", "TOTALES", fmt(totalVenta), fmt(totalPagado), fmt(totalPendiente), ""]);
        rows.push([]);

        // ── Detalle de abonos por venta ──────────────────────────────
        rows.push(["DETALLE DE ABONOS POR VENTA"]);
        rows.push([]);

        ventas.forEach(v => {
            const abonos = (v.abonos || []);
            rows.push([`${v.numeroVenta || `V-${v.id}`} — ${v.fuente === "pedido" ? "Pedido" : "Venta"}`]);

            if (abonos.length === 0) {
                rows.push(["  Sin abonos registrados.", ""]);
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
                
                // KPI de total abonado, marcado con un identificador especial para los bordes
                rows.push(["Total abonado", "", "", fmt(totalValidos), "_FOOTER_"]);
            }
            rows.push([]);
        });
    }

    generateExcelReport({
        title: `Estado de Cuenta — ${resumen.nombres} ${resumen.apellidos}`,
        fileName: `estado_cuenta_${resumen.documento}_${hoy()}.xlsx`,
        columns: [],
        data: rows
    });
};

/**
 * Reporte individual en PDF
 */
export const generarReporteClientePDF = (resumen, ventas) => {
    let data = [];
    
    if (ventas.length === 0) {
        data.push(["Sin ventas a crédito registradas.", "", "", "", "", ""]);
    } else {
        ventas.forEach(v => {
            const estadoVenta = v.estado === "Anulada" || v.estado === "Anulado"
                ? "Vencida"
                : v.estado === "Finalizado" ? "Finalizado" : "Pendiente";
                
            data.push([
                v.numeroVenta || `V-${v.id}`,
                v.fecha || "—",
                fmt(v.total),
                fmt(v.montoPagado || 0),
                fmt(v.montoPorPagar),
                estadoVenta
            ]);
            
            const abonos = (v.abonos || []);
            if (abonos.length > 0) {
                const validAbonos = abonos.filter(a => !a.anulado);
                if (validAbonos.length > 0) {
                    validAbonos.forEach((a, i) => {
                        data.push([{
                            content: `     - Abono #${i + 1}`,
                            styles: { fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 248, 248] }
                        }, {
                            content: a.fecha || '—',
                            styles: { fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 248, 248] }
                        }, {
                            content: '—',
                            styles: { fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 248, 248], halign: 'center' }
                        }, {
                            content: fmt(a.monto),
                            styles: { fontStyle: 'italic', textColor: [34, 153, 84], fillColor: [248, 248, 248], fontStyle: 'bold' }
                        }, {
                            content: '—',
                            styles: { fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 248, 248], halign: 'center' }
                        }, {
                            content: 'Aprobado',
                            styles: { fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 248, 248] }
                        }]);
                    });
                }
            }
        });
    }

    const totalPagado = ventas.reduce((acc, v) => acc + (v.montoPagado || 0), 0);
    const totalPendiente = ventas.reduce((acc, v) => acc + v.montoPorPagar, 0);

    const totals = [
        `Cupo asignado: ${fmt(resumen.cupoCredito)}`,
        `Cupo ocupado: ${fmt(resumen.cupoOcupado)}`,
        `Cupo disponible: ${fmt(resumen.cupoDisponible)}`,
        `Total abonado histórico: ${fmt(totalPagado)}`,
        `Saldo total pendiente: ${fmt(totalPendiente)}`
    ];

    generatePDFReport({
        title: `ESTADO DE CUENTA — ${resumen.nombres} ${resumen.apellidos}`,
        fileName: `estado_cuenta_${resumen.documento}_${hoy()}.pdf`,
        columns: ["N° Venta", "Fecha", "Total", "Pagado", "Pendiente", "Estado"],
        data: data,
        extraInfo: [
            `DATOS DEL CLIENTE`,
            `Nombre:      ${resumen.nombres} ${resumen.apellidos}`,
            `Documento:   ${resumen.tipoDocumento} ${resumen.documento}`,
            `Contacto:    ${resumen.email || "—"}  |  Tel: ${resumen.telefono || "—"}`,
            `Estado:      ${resumen.estado === false ? "Suspendido" : "Activo"}`
        ],
        totals: totals
    });
};

/**
 * Reporte detalle de una sola venta con historial de abonos
 */
export const generarReporteVenta = (venta, abonosTable) => {
    const montoPagado = (venta.abonos || [])
        .filter(a => !a.anulado)
        .reduce((acc, a) => acc + Number(a.monto), 0);

    const data = abonosTable.map(row => {
        const accion = row.tipo === "inicio" ? "Deuda inicial" :
                       row.tipo === "anulado" ? "Anulado" :
                       row.tipo === "ultimo" ? "Saldo final" : "Abono";
                       
        const abonoStr = row.abono === 0 ? "$0" :
                         row.abono < 0 ? `-${fmt(Math.abs(row.abono))}` : `+${fmt(row.abono)}`;
                         
        return [
            row.fecha || "—",
            row.metodoPago || "—",
            abonoStr,
            fmt(row.saldoPendiente),
            accion
        ];
    });

    const isAnulada = venta.estado === "Anulada" || venta.estado === "Anulado";
    const estadoVenta = isAnulada ? "Vencida" : (venta.estado === "Finalizado" ? "Finalizado" : "Pendiente");

    generatePDFReport({
        title: `Historial de Abonos - Venta #${venta.numeroVenta || venta.id}`,
        fileName: `historial_venta_${venta.numeroVenta || venta.id}_${hoy()}.pdf`,
        columns: ["Fecha", "Método", "Movimiento", "Saldo Pendiente", "Detalle"],
        data: data,
        emptyMessage: "No hay movimientos registrados para este crédito.",
        extraInfo: [
            `DATOS DEL CRÉDITO`,
            `Cliente:        ${venta.cliente || "—"}`,
            `Fecha de venta: ${venta.fecha || "—"}`,
            `Fecha límite:   ${venta.fechaLimite || "—"}`,
            `Estado:         ${estadoVenta}`
        ],
        totals: [
            `Total crédito: ${fmt(venta.total)}`,
            `Total pagado: ${fmt(montoPagado)}`,
            `Saldo pendiente: ${fmt(venta.montoPorPagar)}`
        ]
    });
};

/**
 * Reporte general en PDF
 */
export const generarReporteGeneralPDF = (clientes, fechaInicio, fechaFin) => {
    // Aplicar filtro de fechas
    const clientesFiltrados = clientes
        .map(c => {
            if (!fechaInicio && !fechaFin) return c;
            const ventasFiltradas = (c.ventas || []).filter(v => {
                const fechaVenta = v.fecha || "";
                return (!fechaInicio || fechaVenta >= fechaInicio) && (!fechaFin || fechaVenta <= fechaFin);
            });
            const cupoOcupado = ventasFiltradas.reduce((acc, v) => acc + (v.montoPorPagar || 0), 0);
            return {
                ...c,
                ventas: ventasFiltradas,
                totalVentas: ventasFiltradas.length,
                cupoOcupado,
                cupoDisponible: Math.max(c.cupoCredito - cupoOcupado, 0),
            };
        })
        .filter(c => !fechaInicio && !fechaFin ? true : c.ventas.length > 0);

    const periodoLabel = fechaInicio || fechaFin
        ? `${fechaInicio || "inicio"} — ${fechaFin || "hoy"}`
        : "Todos los períodos";

    const data = clientesFiltrados.map(c => {
        const estadoPago = c.estado === false
            ? "Suspendido"
            : c.cupoOcupado > 0 ? "Por pagar" : "Al día";
        return [
            `${c.nombres} ${c.apellidos}`,
            c.documento,
            c.estado === false ? "Suspendido" : "Activo",
            estadoPago,
            fmt(c.cupoCredito),
            fmt(c.cupoOcupado),
            c.totalVentas.toString()
        ];
    });

    const totalCupoAsignado = clientesFiltrados.reduce((acc, c) => acc + c.cupoCredito, 0);
    const totalCupoOcupado = clientesFiltrados.reduce((acc, c) => acc + c.cupoOcupado, 0);
    const clientesSuspendidos = clientesFiltrados.filter(c => c.estado === false).length;

    const totals = [
        `Clientes activos: ${clientesFiltrados.length - clientesSuspendidos}`,
        `Clientes suspendidos: ${clientesSuspendidos}`,
        `Cupo total asignado: ${fmt(totalCupoAsignado)}`,
        `Cupo total ocupado: ${fmt(totalCupoOcupado)}`
    ];

    generatePDFReport({
        title: "REPORTE DE CRÉDITOS Y ABONOS",
        fileName: `reporte_pagos_${hoy()}.pdf`,
        columns: ["Cliente", "Documento", "Estado Cliente", "Estado Pago", "Cupo Total", "Cupo Ocupado", "Ventas Pdt."],
        data: data,
        extraInfo: [
            `Período: ${periodoLabel}`,
            `Total clientes con cupo: ${clientesFiltrados.length}`
        ],
        totals: totals
    });
};