import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";

export function useOrdersReport(data, setAlert) {

    const exportReport = (fechaInicio, fechaFin) => {

        const filtrados = data.filter(order => {
            const fecha = new Date(order.fechaPedido);

            return (
                fecha >= new Date(fechaInicio + "T00:00:00") &&
                fecha <= new Date(fechaFin + "T23:59:59")
            );
        });

        if (filtrados.length === 0) {
            setAlert({
                type: "error",
                message: "No hay pedidos en el rango de fechas seleccionado."
            });
            return;
        }

        const excelData = filtrados.map((order, index) => [
            String(index + 1),
            String(order.nombreCliente || "Sin nombre"),
            String(`${order.tipoDocumento || ""} ${order.documento || ""}`),
            String(order.fechaPedido),
            String(order.total),
            String(order.fechaVencimiento || "-"),
            String(order.formaPago || "-"),
            String(order.estado)
        ]);

        generateExcelReport({
            title: "➤ REPORTE GENERAL DE CONTROL DE PEDIDOS",
            fileName: `Reporte_Pedidos_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [
                "ID",
                "CLIENTE",
                "DOCUMENTO",
                "FECHA",
                "TOTAL",
                "VENCIMIENTO",
                "PAGO",
                "ESTADO"
            ],
            data: excelData
        });

        setAlert({
            type: "success",
            message: "Reporte generado correctamente"
        });
    };

    return { exportReport };
}