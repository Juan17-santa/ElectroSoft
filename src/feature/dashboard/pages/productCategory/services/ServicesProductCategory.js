const API_URL = "http://localhost:4000/api/productCategory";

export const ServiceProductCategory = {
    async get() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error al obtener las categorías");
            const resJson = await response.json();
            return resJson.data;
        } catch (error) {
            console.error("Error en get:", error);
            throw error;
        }
    },

    async create({ name, description }) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description })
            });

            const resJson = await response.json();
            if (!response.ok) {
                // lANZA EL MENSAJE DEL BACKEND: "Esta categoría ya se encuentra registrada"
                throw new Error(resJson.error || "Error al crear la categoría");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en create:", error);
            throw error;
        }
    },

    async update(id, { name, description, status }) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, status })
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al actualizar la categoría");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en update:", error);
            throw error;
        }
    },

    async toggleEstado(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al cambiar el estado");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en toggleEstado:", error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al eliminar la categoría");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en delete:", error);
            throw error;
        }
    }
};