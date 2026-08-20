import api from "../../../../../utils/api.js";

const API_URL = "/productCategory";

const getApiError = (error, fallback) => {
    const apiError = new Error(error.response?.data?.error || error.response?.data?.message || error.message || fallback);
    apiError.status = error.response?.status;
    return apiError;
};

// FUNCION PARA MAPEAR CATEGORÍA DEL BACKEND AL FORMATO DEL FRONTEND
const mapCategoryFromAPI = (apiCategory) => {
    if (!apiCategory) return null;

    return {
        id: apiCategory._id || apiCategory.id,
        name: apiCategory.name,
        description: apiCategory.description || "",
        status: apiCategory.status !== undefined ? apiCategory.status : true,
        createdAt: apiCategory.createdAt,
        updatedAt: apiCategory.updatedAt,

        productsCount: apiCategory.productsCount ?? 0,
        providersCount: apiCategory.providersCount ?? 0,
        canDelete: apiCategory.canDelete ?? true,
        deleteReason: apiCategory.deleteReason ?? null
    };
};

export const ServiceProductCategory = {
    async get() {
        try {
            const firstPayload = (await api.get(API_URL, { params: { page: "1", limit: "100" } })).data;
            const categories = [...(firstPayload.data || firstPayload.items || [])];
            for (let page = 2; page <= (firstPayload.totalPages || 1); page += 1) {
                const payload = (await api.get(API_URL, { params: { page: String(page), limit: "100" } })).data;
                categories.push(...(payload.data || payload.items || []));
            }
            return categories.map(mapCategoryFromAPI);
        } catch (error) {
            throw getApiError(error, "Error al obtener las categorías");
        }
    },

    async getPage({ page = 1, limit = 15, search = "" } = {}) {
        try {
            const params = { page: String(page), limit: String(Math.min(limit, 100)) };
            if (search.trim()) params.search = search.trim();
            const payload = (await api.get(API_URL, { params })).data;
            const data = (payload.data || payload.items || []).map(mapCategoryFromAPI);
            return { data, page: payload.page ?? page, limit: payload.limit ?? limit, total: payload.total ?? data.length, totalPages: payload.totalPages ?? 1 };
        } catch (error) {
            throw getApiError(error, "Error al obtener las categorías");
        }
    },

    async create({ name, description }) {
        try {
            const payload = (await api.post(API_URL, { name, description })).data;
            return mapCategoryFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al crear la categoría");
        }
    },

    async update(id, { name, description, status }) {
        try {
            const payload = (await api.put(`${API_URL}/${id}`, { name, description, status })).data;
            return mapCategoryFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al actualizar la categoría");
        }
    },

    async toggleEstado(id) {
        try {
            const payload = (await api.patch(`${API_URL}/${id}/status`)).data;
            return mapCategoryFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al cambiar el estado");
        }
    },

    async delete(id) {
        try {
            const payload = (await api.delete(`${API_URL}/${id}`)).data;
            return mapCategoryFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al eliminar la categoría");
        }
    }
};