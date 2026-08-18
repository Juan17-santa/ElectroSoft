import api from "../../../../../utils/api.js";

/**
 * Normaliza una venta del backend al formato que usan las pantallas de
 * devoluciones (mismo mapeo de CreateDevolution/EditDevolution).
 */
export function normalizeSale(sale) {
    return {
        ...sale,
        id: sale._id || sale.id,
        estado: sale.estado === "ANULADA" ? "Anulado" : sale.estado,
        fecha: sale.fecha || sale.fechaVenta || sale.fechaCreacion?.slice?.(0, 10),
        numeroVenta: sale.numeroVenta || sale.numeroFactura,
        numeroDocumento: sale.numeroDocumento || sale.numeroFactura || sale.clienteId?.documentNumber,
        cliente:
            sale.cliente ||
            [sale.clienteId?.firstName, sale.clienteId?.lastName].filter(Boolean).join(" "),
        productos: (sale.productos || []).map((producto) => ({
            ...producto,
            id: producto.id || producto.productoId?._id || producto.productoId || producto.producto?._id,
            productoId: producto.productoId?._id || producto.productoId || producto.id || producto.producto?._id,
            nombre: producto.nombre || producto.productoId?.name || producto.producto?.name || producto.name,
            precio: producto.precio || producto.precioUnitario || producto.productoId?.price || producto.producto?.price || 0,
            garantia: producto.garantia || producto.productoId?.warranty || 0,
        })),
    };
}

/**
 * Obtiene las ventas del backend usando el cliente compartido (token y 401 automáticos).
 * Retorna el listado crudo (sin normalizar) tal como lo entrega GET /sales.
 */
export async function fetchSales() {
    const response = await api.get("/sales");
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
}

/**
 * Obtiene solo las ventas indicadas por sus IDs (acota el tráfico frente a fetchSales).
 * Retorna el listado normalizado.
 */
export async function fetchSalesByIds(ids) {
    const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).map(String).filter(Boolean))];
    if (uniqueIds.length === 0) return [];

    const response = await api.get("/sales/by-ids", {
        params: { ids: uniqueIds.join(",") },
    });
    const data = response.data?.data ?? response.data ?? [];
    return (Array.isArray(data) ? data : []).map(normalizeSale);
}
