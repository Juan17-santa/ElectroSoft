import api from "../../../../../utils/api.js";

const API_URL = "/providers";

const getApiError = (error, fallback) => {
    const apiError = new Error(error.response?.data?.error || error.response?.data?.message || error.message || fallback);
    apiError.status = error.response?.status;
    return apiError;
};

const matchesUnsupportedSearch = (provider, search) => {
    const query = search.trim().toLowerCase();
    const providerPhone = String(provider.providerPhone || "").toLowerCase();
    const contactPhone = String(provider.contactPhone || "").toLowerCase();
    const documentType = String(provider.documentType?.abbreviation || "").toLowerCase();

    return documentType.includes(query) || providerPhone.includes(query) || contactPhone.includes(query);
};

export const ServicesProviders = {

    // OBTENER TODOS LOS PROVEEDORES
    async get() {
        try {
            const firstPayload = (await api.get(API_URL, { params: { page: "1", limit: "100" } })).data;
            const providers = [...(firstPayload.data || firstPayload.items || [])];
            for (let page = 2; page <= (firstPayload.totalPages || 1); page += 1) {
                const payload = (await api.get(API_URL, { params: { page: String(page), limit: "100" } })).data;
                providers.push(...(payload.data || payload.items || []));
            }
            return providers;
        } catch (error) {
            throw getApiError(error, "Error al obtener proveedores");
        }
    },

    async getPage({ page = 1, limit = 15, search = "" } = {}) {
        try {
            const params = { page: String(page), limit: String(Math.min(limit, 100)) };
            if (search.trim()) params.search = search.trim();
            const payload = (await api.get(API_URL, { params })).data;
            const data = payload.data || payload.items || [];

            const normalizedSearch = search.trim().toLowerCase();
            const phoneSearch = /^[\d\s()+-]{7,}$/.test(normalizedSearch);
            if (search.trim() && (!data.length || normalizedSearch === "nit" || phoneSearch)) {
                const allProviders = await this.get();
                const matchingProviders = allProviders.filter(provider => matchesUnsupportedSearch(provider, search));
                if (phoneSearch && matchingProviders.length === 0 && data.length > 0) {
                    return { data, page: payload.page ?? page, limit: payload.limit ?? limit, total: payload.total ?? data.length, totalPages: payload.totalPages ?? 1 };
                }
                const safeLimit = Math.min(limit, 100);
                const start = (page - 1) * safeLimit;

                return {
                    data: matchingProviders.slice(start, start + safeLimit),
                    page,
                    limit: safeLimit,
                    total: matchingProviders.length,
                    totalPages: Math.max(1, Math.ceil(matchingProviders.length / safeLimit)),
                };
            }

            return { data, page: payload.page ?? page, limit: payload.limit ?? limit, total: payload.total ?? data.length, totalPages: payload.totalPages ?? 1 };
        } catch (error) {
            throw getApiError(error, "Error al obtener proveedores");
        }
    },

    // OBTENER UN PROVEEDOR POR SU ID
    async getById(id) {
        try {
            const payload = (await api.get(`${API_URL}/${id}`)).data;
            return payload.data || payload;
        } catch (error) {
            throw getApiError(error, "Error al obtener el proveedor");
        }
    },

    // CREAR UN PROVEEDOR
    async create(providerData) {
        try {
            return (await api.post(API_URL, providerData)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al crear el proveedor");
        }
    },

    // VALIDAR SI UN CAMPO YA EXISTE
    async checkUnique(data) {
        try {
            return (await api.post(`${API_URL}/check-unique`, data)).data;
        } catch (error) {
            throw getApiError(error, "Error al validar");
        }
    },

    // MODIFICAR UN PROVEEDOR
    async update(id, providerData) {
        try {
            return (await api.put(`${API_URL}/${id}`, providerData)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al actualizar el proveedor");
        }
    },

    // ELIMINAR UN PROVEEDOR
    async delete(id) {
        try {
            return (await api.delete(`${API_URL}/${id}`)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al eliminar el proveedor");
        }
    },

    // CAMBIAR EL ESTADO (PATCH)
    async toggleStatus(id) {
        try {
            return (await api.patch(`${API_URL}/${id}/status`)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al cambiar el estado");
        }
    },

    // OBTENER LOS TIPOS DE DOCUMENTO PARA EL SELECT
    getDocumentTypes: async () => {
        try {
            const result = (await api.get("/documentTypes")).data;
            return result.data || [];
        } catch (error) {
            throw getApiError(error, "Error al obtener los tipos de documento");
        }
    },

    // OBTENER LAS CATEGORÍAS PARA EL SELECT
    getCategories: async () => {
        try {
            const result = (await api.get("/productCategory")).data;
            return result.data || [];
        } catch (error) {
            throw getApiError(error, "Error al obtener las categorías");
        }
    }
};