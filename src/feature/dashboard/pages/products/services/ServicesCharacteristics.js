import api from "../../../../../utils/api.js";

const API_URL_CHARS = "/productCharacteristics";
const API_URL_MEAS = "/productMeasures";

const getApiError = (error, fallback) => {
    const apiError = new Error(error.response?.data?.error || error.response?.data?.message || error.message || fallback);
    apiError.status = error.response?.status;
    return apiError;
};

export const ServicesCharacteristics = {
    /**
     * Obtener todas las características predeterminadas
     */
    async getCharacteristics() {
        try {
            const resJson = (await api.get(API_URL_CHARS)).data;
            // Mapear el formato de API al formato del frontend
            return (resJson.data || []).map(char => ({
                id: char._id || char.id,
                nombre: char.name
            }));
        } catch (error) {
            throw getApiError(error, "Error al obtener características");
        }
    },

    /**
     * Agregar nueva característica predeterminada
     */
    async addCharacteristic(name) {
        try {
            const resJson = (await api.post(API_URL_CHARS, { name })).data;
            
            return {
                id: resJson.data._id || resJson.data.id,
                nombre: resJson.data.name
            };
        } catch (error) {
            throw getApiError(error, "Error al crear la característica");
        }
    },

    /**
     * Obtener todas las medidas predeterminadas
     */
    async getMeasures() {
        try {
            const resJson = (await api.get(API_URL_MEAS)).data;
            // Mapear el formato de API al formato del frontend
            return (resJson.data || []).map(meas => ({
                id: meas._id || meas.id,
                nombre: meas.name
            }));
        } catch (error) {
            throw getApiError(error, "Error al obtener medidas");
        }
    },

    /**
     * Agregar nueva medida predeterminada
     */
    async addMeasure(name) {
        try {
            const resJson = (await api.post(API_URL_MEAS, { name })).data;
            
            return {
                id: resJson.data._id || resJson.data.id,
                nombre: resJson.data.name
            };
        } catch (error) {
            throw getApiError(error, "Error al crear la medida");
        }
    },

    /**
     * Eliminar característica predeterminada
     */
    async removeCharacteristic(id) {
        try {
            await api.delete(`${API_URL_CHARS}/${id}`);
            
            // Recargar y devolver la lista actualizada
            return await this.getCharacteristics();
        } catch (error) {
            throw getApiError(error, "Error al eliminar la característica");
        }
    },

    /**
     * Eliminar medida predeterminada
     */
    async removeMeasure(id) {
        try {
            await api.delete(`${API_URL_MEAS}/${id}`);
            
            // Recargar y devolver la lista actualizada
            return await this.getMeasures();
        } catch (error) {
            throw getApiError(error, "Error al eliminar la medida");
        }
    }
};
