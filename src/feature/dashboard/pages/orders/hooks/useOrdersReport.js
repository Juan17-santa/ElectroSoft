import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersReport(data, setAlert) {

    const exportReport = async (fechaInicio, fechaFin) => {

        const pedidos = await ServicesOrders.getAllOrders();

        const filtrados = pedidos.filter(order => {
            const fecha = new Date(order.orderDate);

            return (
                fecha >= fechaInicio &&
                fecha <= fechaFin
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

            order.products.forEach((prod, i) => {
                excelData.push([
                    i === 0 ? String(index + 1) : "",
                    i === 0 ? String(`${order.client?.firstName || ""} ${order.client?.lastName || ""}`) : "",
                    i === 0 ? String(`${order.client?.documentType?.abbreviation || ""} ${order.client?.documentNumber || ""}`) : "",
                    i === 0 ? String(order.orderDate?.split("T")[0]) : "",

                    prod.name,
                    prod.quantity,
                    prod.price,
                    prod.lineTotal,

                    i === 0 ? order.total : "",
                    i === 0 ? (order.dueDate?.split("T")[0]) : "",
                    i === 0 ? (order.paymentMethod) : "",
                    i === 0 ? order.status : ""
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