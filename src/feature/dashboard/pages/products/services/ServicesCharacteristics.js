const API_URL_CHARS = "http://localhost:4000/api/productCharacteristics";
const API_URL_MEAS = "http://localhost:4000/api/productMeasures";

export const ServicesCharacteristics = {
    /**
     * Obtener todas las características predeterminadas
     */
    async getCharacteristics() {
        try {
            const response = await fetch(API_URL_CHARS);
            if (!response.ok) throw new Error("Error al obtener características");
            const resJson = await response.json();
            // Mapear el formato de API al formato del frontend
            return (resJson.data || []).map(char => ({
                id: char._id || char.id,
                nombre: char.name
            }));
        } catch (error) {
            console.error("Error en getCharacteristics:", error);
            return [];
        }
    },

    /**
     * Agregar nueva característica predeterminada
     */
    async addCharacteristic(name) {
        try {
            const response = await fetch(API_URL_CHARS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al crear la característica");
            }
            
            return {
                id: resJson.data._id || resJson.data.id,
                nombre: resJson.data.name
            };
        } catch (error) {
            console.error("Error en addCharacteristic:", error);
            throw error;
        }
    },

    /**
     * Obtener todas las medidas predeterminadas
     */
    async getMeasures() {
        try {
            const response = await fetch(API_URL_MEAS);
            if (!response.ok) throw new Error("Error al obtener medidas");
            const resJson = await response.json();
            // Mapear el formato de API al formato del frontend
            return (resJson.data || []).map(meas => ({
                id: meas._id || meas.id,
                nombre: meas.name
            }));
        } catch (error) {
            console.error("Error en getMeasures:", error);
            return [];
        }
    },

    /**
     * Agregar nueva medida predeterminada
     */
    async addMeasure(name) {
        try {
            const response = await fetch(API_URL_MEAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al crear la medida");
            }
            
            return {
                id: resJson.data._id || resJson.data.id,
                nombre: resJson.data.name
            };
        } catch (error) {
            console.error("Error en addMeasure:", error);
            throw error;
        }
    },

    /**
     * Eliminar característica predeterminada
     */
    async removeCharacteristic(id) {
        try {
            const response = await fetch(`${API_URL_CHARS}/${id}`, {
                method: "DELETE"
            });
            
            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al eliminar la característica");
            }
            
            // Recargar y devolver la lista actualizada
            return await this.getCharacteristics();
        } catch (error) {
            console.error("Error en removeCharacteristic:", error);
            throw error;
        }
    },

    /**
     * Eliminar medida predeterminada
     */
    async removeMeasure(id) {
        try {
            const response = await fetch(`${API_URL_MEAS}/${id}`, {
                method: "DELETE"
            });
            
            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al eliminar la medida");
            }
            
            // Recargar y devolver la lista actualizada
            return await this.getMeasures();
        } catch (error) {
            console.error("Error en removeMeasure:", error);
            throw error;
        }
    }
};
