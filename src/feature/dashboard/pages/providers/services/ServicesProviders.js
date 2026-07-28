const API_URL = "http://localhost:4000/api/providers";

export const ServicesProviders = {

    // OBTENER TODOS LOS PROVEEDORES
    async get() {
        try {
            const response = await fetch(API_URL);
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al obtener proveedores");
            return resJson.data || resJson;
        } catch (error) {
            console.error("Error en el servicio getProviders:", error);
            throw error;
        }
    },

    // OBTENER UN PROVEEDOR POR SU ID
    async getById(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al obtener el proveedor");
            return resJson.data || resJson;
        } catch (error) {
            console.error(`Error en el servicio getProviderById (${id}):`, error);
            throw error;
        }
    },

    // CREAR UN PROVEEDOR
    async create(providerData) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(providerData)
            });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al crear el proveedor");
            return resJson.data;
        } catch (error) {
            console.error("Error en el servicio createProvider:", error);
            throw error;
        }
    },

    // VALIDAR SI UN CAMPO YA EXISTE
    async checkUnique(data) {
        try {
            const response = await fetch(`${API_URL}/check-unique`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.error || "Error al validar");
            }
            return resJson;
        } catch (error) {
            console.error("Error en checkUnique:", error);
            throw error;
        }
    },

    // MODIFICAR UN PROVEEDOR
    async update(id, providerData) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(providerData)
            });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al actualizar el proveedor");
            return resJson.data;
        } catch (error) {
            console.error("Error en el servicio updateProvider:", error);
            throw error;
        }
    },

    // ELIMINAR UN PROVEEDOR
    async delete(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al eliminar el proveedor");
            return resJson.data;
        } catch (error) {
            console.error("Error en el servicio deleteProvider:", error);
            throw error;
        }
    },

    // CAMBIAR EL ESTADO (PATCH)
    async toggleStatus(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.error || "Error al cambiar el estado");
            return resJson.data;
        } catch (error) {
            console.error("Error en el servicio toggleStatus:", error);
            throw error;
        }
    },

    // OBTENER LOS TIPOS DE DOCUMENTO PARA EL SELECT
    getDocumentTypes: async () => {
        try {
            const response = await fetch("http://localhost:4000/api/documentTypes");
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error("Error en ServicesProviders.getDocumentTypes:", error);
            return [];
        }
    },

    // OBTENER LAS CATEGORÍAS PARA EL SELECT
    getCategories: async () => {
        try {
            const response = await fetch("http://localhost:4000/api/productCategory");
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error("Error en ServicesProviders.getCategories:", error);
            return [];
        }
    }
};