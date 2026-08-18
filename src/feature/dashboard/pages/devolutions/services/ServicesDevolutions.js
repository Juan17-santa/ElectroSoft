import api from "../../../../../utils/api.js";

function toDateOnly(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return new Date(value).toISOString().split("T")[0];
}

function getFirstProduct(devolution) {
    return devolution.productos?.[0] ?? {};
}

function normalizeDevolution(devolution) {
    if (!devolution) return null;

    const product = getFirstProduct(devolution);
    const createdAt = devolution.fechaCreacion || devolution.creadoEn || "";
    const updatedAt = devolution.actualizadoEn || createdAt;

    return {
        ...devolution,
        id: devolution._id || devolution.id,
        idVenta: devolution.saleId || devolution.idVenta || "",
        saleId: devolution.saleId || devolution.idVenta || "",
        productoId: product.productoId || devolution.productoId || "",
        producto: product.nombre || devolution.producto || "",
        cantidad: product.cantidad ?? devolution.cantidad ?? "",
        motivo: product.motivo || devolution.motivo || "",
        submotivo: product.submotivo || devolution.submotivo || "",
        condicionProducto: product.condicionProducto || devolution.condicionProducto || "",
        regresarAlInventario:
            product.regresarAlInventario ?? devolution.regresarAlInventario ?? true,
        gestion: product.gestion || devolution.gestion || "",
        responsable: product.responsable || devolution.responsable || "",
        garantiaProveedor:
            product.garantiaProveedor ?? devolution.garantiaProveedor ?? null,
        montoReembolso:
            product.montoReembolso ?? devolution.montoReembolso ?? null,
        descripcion: product.descripcion || devolution.descripcion || "",
        observaciones: product.observaciones || devolution.observaciones || "",
        fechaDevolucion: toDateOnly(devolution.fechaDevolucion),
        fechaEstado: toDateOnly(updatedAt || devolution.fechaDevolucion),
        estadoResolucion:
            devolution.estadoResolucion ||
            (devolution.anulada ? "Anulada" : "CREADA"),
        historialEstados: devolution.historialEstados || [],
        creadoEn: createdAt,
        actualizadoEn: updatedAt,
    };
}

function toApiPayload(data) {
    const producto = data.productos?.[0] || data;

    return {
        saleId: data.saleId || data.idVenta,
        fechaDevolucion: data.fechaDevolucion,
        estadoResolucion: data.estadoResolucion || "CREADA",
        productos: [
            {
                productoId: producto.productoId,
                nombre: producto.nombre || producto.producto,
                cantidad: Number(producto.cantidad),
                motivo: producto.motivo,
                submotivo: producto.submotivo || "",
                condicionProducto: producto.condicionProducto || "",
                regresarAlInventario:
                    producto.regresarAlInventario === undefined
                        ? true
                        : producto.regresarAlInventario,
                gestion: producto.gestion || "",
                responsable: producto.responsable || "",
                garantiaProveedor:
                    producto.garantiaProveedor === undefined
                        ? null
                        : producto.garantiaProveedor,
                descripcion: producto.descripcion || "",
                observaciones: producto.observaciones || "",
                montoReembolso:
                    producto.montoReembolso === undefined
                        ? null
                        : Number(producto.montoReembolso),
            },
        ],
    };
}

export const ServicesDevolutions = {
    /**
     * Obtiene los grupos de devoluciones paginados (una fila = una venta).
     * El backend devuelve data como arreglo de arreglos de devoluciones y la
     * paginación en `pagination` (mismo contrato que Shopping).
     */
    async getAll({ page = 1, limit = 8, search = "" } = {}) {
        const params = { page, limit };
        if (search) params.search = String(search).trim();

        const payload = (await api.get("/devolutions", { params })).data;
        const result = payload?.data ?? [];
        const groups = (Array.isArray(result) ? result : []).map((devoluciones) => {
            const items = Array.isArray(devoluciones) ? devoluciones : [devoluciones];
            return items.map(normalizeDevolution).filter(Boolean);
        });

        return {
            groups,
            total: Number(payload?.pagination?.total ?? 0),
            totalPages: Number(payload?.pagination?.totalPages ?? 1),
        };
    },

    async getById(id) {
        const payload = (await api.get(`/devolutions/${id}`)).data;
        return normalizeDevolution(payload?.data ?? payload);
    },

    async getBySaleId(saleId) {
        const payload = (await api.get(`/devolutions/sale/${saleId}`)).data;
        const devolutions = payload?.data ?? payload ?? [];
        return (Array.isArray(devolutions) ? devolutions : []).map(normalizeDevolution);
    },

    async create(data) {
        const payload = (await api.post("/devolutions", toApiPayload(data))).data;
        return normalizeDevolution(payload?.data ?? payload);
    },

    async createBatch(saleId, devoluciones) {
        const payload = (await api.post("/devolutions/batch", {
            saleId,
            devoluciones: devoluciones.map(toApiPayload),
        })).data;
        const result = payload?.data ?? payload ?? [];
        return (Array.isArray(result) ? result : []).map(normalizeDevolution);
    },

    async update(id, data) {
        const {
            idVenta: _idVenta,
            saleId: _saleId,
            productos: _productos,
            productoId: _productoId,
            producto: _producto,
            fechaCreacion: _fechaCreacion,
            creadoEn: _creadoEn,
            ...editable
        } = data;

        const payload = (await api.patch(`/devolutions/${id}`, editable)).data;
        return normalizeDevolution(payload?.data ?? payload);
    },

    async anular(id) {
        const payload = (await api.patch(`/devolutions/${id}/anular`, {})).data;
        return normalizeDevolution(payload?.data ?? payload);
    },

    async delete(id) {
        return this.anular(id);
    },

    /**
     * Exporta las devoluciones por rango de fecha de devolución (fechaDevolucion)
     * de forma paginada (el backend filtra; el cliente descarga por lotes).
     * Retorna { data, pagination }.
     */
    async exportReport({ from, to, page = 1, limit = 5000 } = {}) {
        const params = { page: String(page), limit: String(limit) };
        if (from) params.from = from;
        if (to) params.to = to;

        const payload = (await api.get("/devolutions/export", { params })).data;
        const data = payload?.data ?? [];
        return {
            data: (Array.isArray(data) ? data : []).map(normalizeDevolution),
            pagination: payload?.pagination || { page, limit, total: 0, totalPages: 1 },
        };
    },
};