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

        const excelData = [];

        filtrados.forEach((order, index) => {

            order.productos.forEach((prod, i) => {
                excelData.push([
                    i === 0 ? String(index + 1) : "",
                    i === 0 ? String(order.nombreCliente || "Sin nombre") : "",
                    i === 0 ? String(`${order.tipoDocumento || ""} ${order.documento || ""}`) : "",
                    i === 0 ? String(order.fechaPedido) : "",

                    prod.nombre,
                    prod.cantidad,
                    prod.precio,
                    prod.subtotal,

                    i === 0 ? order.total : "",
                    i === 0 ? (order.fechaVencimiento || "-") : "",
                    i === 0 ? (order.formaPago || "-") : "",
                    i === 0 ? order.estado : ""
                ]);
            });
            excelData.push([]);
        });

        generateExcelReport({
            title: "➤ REPORTE GENERAL DE CONTROL DE PEDIDOS",
            fileName: `Reporte_Pedidos_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [
                "ID",
                "CLIENTE",
                "DOCUMENTO",
                "FECHA",

                "PRODUCTO",
                "CANTIDAD",
                "PRECIO",
                "SUBTOTAL",

                "TOTAL",
                "VENCIMIENTO",
                "PAGO",
                "ESTADO"
            ],
            data: excelData
        });

        setAlert({
            type: "success",
            message: "Reporte de pedidos descargado con éxito."
        });
    };

    return { exportReport };
}