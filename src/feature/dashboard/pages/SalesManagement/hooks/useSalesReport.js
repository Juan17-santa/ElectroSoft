import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";

export function useSalesReport(data, notify) {

    const exportReport = (fechaInicio, fechaFin) => {

        const filtrados = data.filter(sale => {
            const fecha = new Date(sale.fecha);

            return (
                fecha >= new Date(fechaInicio + "T00:00:00") &&
                fecha <= new Date(fechaFin + "T23:59:59")
            );
        });

        if (filtrados.length === 0) {
            notify("error", "No hay ventas en el rango de fechas seleccionado.");
            return;
        }

        const excelData = [];
        const formatCurrency = (val) => val.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

        filtrados.forEach((sale, index) => {
            const productos = sale.productos || [];
            
            productos.forEach((prod, i) => {
                excelData.push([
                    i === 0 ? String(sale.numeroVenta || index + 1).padStart(2, '0') : "",
                    i === 0 ? String(sale.cliente || "-") : "",
                    i === 0 ? String(sale.numeroDocumento || "-") : "",
                    i === 0 ? String(sale.fecha) : "",

                    prod.nombre,
                    prod.cantidad,
                    formatCurrency(prod.precio),
                    formatCurrency(prod.cantidad * prod.precio),

                    i === 0 ? formatCurrency(sale.total) : "",
                    i === 0 ? (sale.tipoVenta || "-") : "",
                    i === 0 ? ((sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito" || sale.tipoVenta === "Mixto") ? `${sale.diasPlazo || 0} días` : "-") : "",
                    i === 0 ? ((sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito" || sale.tipoVenta === "Mixto") ? (() => {
                        const d = new Date(sale.fecha + "T00:00:00");
                        d.setDate(d.getDate() + Number(sale.diasPlazo || 0));
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })() : "-") : "",
                    i === 0 ? sale.estado : ""
                ]);
            });
            excelData.push([]); // Espacio entre ventas
        });

        generateExcelReport({
            title: "REPORTE GENERAL DE VENTAS",
            fileName: `Reporte_Ventas_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [
                "# VENTA",
                "CLIENTE",
                "DOCUMENTO",
                "FECHA",

                "PRODUCTO",
                "CANTIDAD",
                "PRECIO UNIT",
                "SUBTOTAL",

                "TOTAL VENTA",
                "TIPO",
                "PLAZO (CRÉDITO)",
                "FECHA LÍMITE",
                "ESTADO"
            ],
            data: excelData
        });

        notify("success", "Reporte de ventas generado correctamente");
    };

    return { exportReport };
}
