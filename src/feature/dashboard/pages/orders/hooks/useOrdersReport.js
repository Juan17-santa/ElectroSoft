import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersReport(data, notify) {
    const fmt = (val) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", minimumFractionDigits: 0
    }).format(val ?? 0);

    const exportReport = async (fechaInicio, fechaFin) => {
        const pedidos = await ServicesOrders.getAllOrders();

        const filtrados = pedidos.filter(order => {
            const fecha = new Date(order.orderDate);

            return (
                fecha >= new Date(fechaInicio + "T00:00:00") &&
                fecha <= new Date(fechaFin + "T23:59:59")
            );
        });

        if (filtrados.length === 0) {
            notify("error", "No hay pedidos en el rango de fechas seleccionado.");
            return;
        }

        const excelData = [];

        filtrados.forEach((order, index) => {
            order.products.forEach((prod, i) => {
                excelData.push([
                    i === 0 ? String(index + 1) : "",
                    i === 0 ? String(`${order.client?.firstName || ""} ${order.client?.lastName || ""}`) : "",
                    i === 0 ? String(`${order.client?.documentType?.abbreviation || ""} ${order.client?.documentNumber || ""}`) : "",
                    i === 0 ? String(order.orderDate?.split("T")[0]) : "",

                    prod.name,
                    prod.quantity,
                    fmt(prod.price),
                    fmt(prod.lineTotal),

                    i === 0 ? fmt(order.total) : "",
                    i === 0 ? (order.dueDate?.split("T")[0]) : "",
                    i === 0 ? (order.paymentMethod) : "",
                    i === 0 ? order.status : ""
                ]);
            });
            excelData.push([]);
        });

        generateExcelReport({
            title: "REPORTE GENERAL DE CONTROL DE PEDIDOS",
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

        notify("success", "Reporte de pedidos descargado con éxito.");
    };

    return { exportReport };
}