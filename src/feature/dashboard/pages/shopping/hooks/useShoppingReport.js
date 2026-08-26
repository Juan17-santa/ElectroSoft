import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import { ServicesShopping } from "../services/ServicesShopping";

const parseMoney = (value) => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    return Number(
        String(value)
            .replace(/\$/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "")
            .trim()
    ) || 0;
};

/**
 * Convierte un purchaseDate del backend (DD/MM/YYYY o YYYY-MM-DD) a un objeto Date.
 * Retorna null si no se puede parsear.
 */
function parsePurchaseDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;

    // Formato YYYY-MM-DD (del backend)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    // Formato DD/MM/YYYY
    const partes = dateStr.split("/");
    if (partes.length === 3) {
        const [day, month, year] = partes.map(Number);
        const date = new Date(year, month - 1, day);
        if (!Number.isNaN(date.getTime())) return date;
    }

    return null;
}

export function useShoppingReport(getSearchTerm, notify) {

    const exportReport = async (fechaInicio, fechaFin) => {
        let comprasFiltradas = [];

        // El backend filtra por fecha de factura (purchaseDate) y la búsqueda actual.
        // Se descarga por lotes hasta agotar las páginas del rango.
        try {
            const search = (typeof getSearchTerm === "function" ? getSearchTerm() : "") || "";
            const limit = 5000;
            let page = 1;
            let totalPages = 1;
            do {
                const result = await ServicesShopping.exportReport({
                    from: fechaInicio,
                    to: fechaFin,
                    search,
                    page,
                    limit,
                });
                comprasFiltradas = comprasFiltradas.concat(result.data);
                totalPages = result.pagination?.totalPages ?? 1;
                page += 1;
                if (page > 500) break;
            } while (page <= totalPages);
        } catch {
            notify("error", "No se pudieron cargar las compras para el reporte.");
            return;
        }

        // ─── FILTRO POR FECHA ────────────────────────────────
        const filtradas = comprasFiltradas.filter((compra) => {
            const fecha = parsePurchaseDate(compra.fechaCompra);
            if (!fecha) return false;

            return (
                fecha >= new Date(fechaInicio + "T00:00:00") &&
                fecha <= new Date(fechaFin + "T23:59:59")
            );
        });

        if (filtradas.length === 0) {
            notify("error", "No hay compras en el rango de fechas seleccionado.");
            return;
        }

        // ─── KPIs ───────────────────────────────────────────
        const totalCompras = filtradas.reduce(
            (acc, c) => acc + parseMoney(c.total),
            0
        );

        const cantidadCompras = filtradas.length;
        const promedioCompra = totalCompras / cantidadCompras;

        const totalProductos = filtradas.reduce((acc, c) => {
            return acc + (c.productos || []).reduce(
                (a, p) => a + Number(p.cantidad || 0),
                0
            );
        }, 0);

        const anuladas = filtradas.filter(c => c.estado === "Anulada").length;
        const porcentajeAnuladas = ((anuladas / cantidadCompras) * 100).toFixed(1);

        // ─── AGRUPAR POR PROVEEDOR ──────────────────────────
        const proveedores = {};

        filtradas.forEach(c => {
            const total = parseMoney(c.total);

            if (!proveedores[c.proveedor]) {
                proveedores[c.proveedor] = { total: 0, cantidad: 0 };
            }

            proveedores[c.proveedor].total += total;
            proveedores[c.proveedor].cantidad += 1;
        });

        const proveedoresOrdenados = Object.entries(proveedores)
            .map(([nombre, data]) => ({
                nombre,
                total: data.total,
                cantidad: data.cantidad,
                porcentaje: ((data.total / totalCompras) * 100).toFixed(1)
            }))
            .sort((a, b) => b.total - a.total);

        // ─── DATA EXCEL ─────────────────────────────────────
        const excelData = [];

        // ─── RESUMEN ────────────────────────────────────────
        excelData.push(["RESUMEN GENERAL"]);
        excelData.push(["Rango", `${fechaInicio} - ${fechaFin}`]);
        excelData.push(["Total invertido", `$${totalCompras.toLocaleString("es-CO")}`]);
        excelData.push(["Número de compras", cantidadCompras]);
        excelData.push(["Promedio por compra", `$${Math.round(promedioCompra).toLocaleString("es-CO")}`]);
        excelData.push(["Productos comprados", totalProductos]);
        excelData.push(["Compras anuladas", `${anuladas} (${porcentajeAnuladas}%)`]);

        if (proveedoresOrdenados[0]) {
            excelData.push([
                "Proveedor principal",
                `${proveedoresOrdenados[0].nombre} (${proveedoresOrdenados[0].porcentaje}%)`
            ]);
        }

        excelData.push([]);
        excelData.push([]);

        // ─── ANÁLISIS POR PROVEEDOR ─────────────────────────
        excelData.push(["ANÁLISIS POR PROVEEDOR"]);
        excelData.push(["Proveedor", "Total", "Compras", "% Participación"]);

        proveedoresOrdenados.forEach(p => {
            excelData.push([
                p.nombre,
                `$${p.total.toLocaleString("es-CO")}`,
                p.cantidad,
                `${p.porcentaje}%`
            ]);
        });

        excelData.push([]);
        excelData.push([]);

        // ─── HEADERS MANUALES (CLAVE) ───────────────────────
        excelData.push([
            "N° FACTURA",
            "FECHA COMPRA",
            "PROVEEDOR",
            "PRODUCTO",
            "CANTIDAD",
            "COSTE UNITARIO",
            "SUBTOTAL",
            "TOTAL",
            "ESTADO",
        ]);

        // ─── DETALLE ────────────────────────────────────────
        filtradas.forEach((compra, index) => {
            const productos = compra.productos || [];

            if (productos.length === 0) {
                excelData.push([
                    compra.numeroFactura,
                    compra.fechaCompra,
                    compra.proveedor,
                    "", "", "", "",
                    `$${parseMoney(compra.total).toLocaleString("es-CO")}`,
                    compra.estado,
                ]);
            } else {
                productos.forEach((prod, i) => {
                    excelData.push([
                        i === 0 ? compra.numeroFactura : "",
                        i === 0 ? compra.fechaCompra : "",
                        i === 0 ? compra.proveedor : "",
                        prod.nombre,
                        prod.cantidad,
                        `$${parseMoney(prod.costeProducto || prod.precio).toLocaleString("es-CO")}`,
                        `$${parseMoney(prod.subtotal).toLocaleString("es-CO")}`,
                        i === 0 ? `$${parseMoney(compra.total).toLocaleString("es-CO")}` : "",
                        i === 0 ? compra.estado : "",
                    ]);
                });
            }

            excelData.push([]);
        });

        // ─── GENERAR EXCEL ──────────────────────────────────
        generateExcelReport({
            title: "REPORTE GENERAL DE GESTIÓN DE COMPRAS",
            fileName: `Reporte_Compras_${fechaInicio}_${fechaFin}.xlsx`,
            columns: [], // 👈 CLAVE: evita header automático
            data: excelData,
        });

        notify("success", "Reporte generado correctamente.");
    };

    return { exportReport };
}