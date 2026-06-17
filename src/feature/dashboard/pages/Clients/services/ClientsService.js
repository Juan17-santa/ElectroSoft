import api from "../../../../../utils/api.js";

// Mapea el modelo del backend al modelo del frontend
const mapClientToFrontend = (client) => {
    return {
        id: client._id,
        tipoDocumento: client.documentType?.name || client.documentType,
        abreviacion: client.documentType?.abbreviation || client.abbreviation,
        documentTypeId: client.documentType?._id || client.documentType,
        documento: client.documentNumber,
        nombres: client.firstName,
        apellidos: client.lastName,
        email: client.email,
        telefono: client.phone,
        estado: client.estado !== undefined ? client.estado : true,
        totalCompras: Math.max(0, client.totalCompras || 0),
        cupoActivo: client.cupoActivo || false,
        cupoTotal: client.cupoTotal || 0,
        fechaCreacion: client.createdAt ? new Date(client.createdAt).toISOString().split('T')[0] : "",
    };
};

export const ClientsService = {
    async get() {
        try {
            const response = await api.get('/clients');
            const data = response.data;
            const clients = Array.isArray(data) ? data : (data.data || []);
            return clients.map(mapClientToFrontend);
        } catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/clients/${id}`);
            const data = response.data.data || response.data;
            return mapClientToFrontend(data);
        } catch (error) {
            console.error("Error fetching client by ID:", error);
            throw error;
        }
    },

    async getByDocument(documento) {
        try {
            const response = await api.get(
                `/clients/document/${documento}`
            );

            const data = response.data;
            return mapClientToFrontend(data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async create({ tipoDocumento, documento, nombres, apellidos, email, telefono }) {
        try {
            const payload = {
                documentType: tipoDocumento,
                documentNumber: documento,
                firstName: nombres,
                lastName: apellidos,
                email,
                phone: telefono
            };
            const response = await api.post('/clients', payload);
            const data = response.data.data || response.data.client || response.data;
            return mapClientToFrontend(data);
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    },

    async update(clientActualizado) {
        try {
            const payload = {
                documentType: clientActualizado.documentTypeId || clientActualizado.tipoDocumento,
                documentNumber: clientActualizado.documento,
                firstName: clientActualizado.nombres,
                lastName: clientActualizado.apellidos,
                email: clientActualizado.email,
                phone: clientActualizado.telefono
            };
            const response = await api.put(`/clients/${clientActualizado.id}`, payload);
            const data = response.data.data || response.data.client || response.data;
            return mapClientToFrontend(data);
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    },

    // Actualiza SOLO cupo y/o estado en el backend
    async updateCupo(id, { cupoTotal, cupoActivo, estado }) {
        try {
            const payload = {};
            if (cupoTotal !== undefined) payload.cupoTotal = Number(cupoTotal);
            if (cupoActivo !== undefined) payload.cupoActivo = Boolean(cupoActivo);
            if (estado !== undefined) payload.estado = Boolean(estado);

            const response = await api.patch(`/clients/${id}/cupo`, payload);
            const data = response.data.client || response.data;
            return mapClientToFrontend(data);
        } catch (error) {
            console.error("Error updating cupo/estado:", error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await api.delete(`/clients/${id}`);
            return true;
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    },

    async getDocumentTypes() {
        try {
            const response = await api.get('/documentTypes');
            return response.data.data || [];
        } catch (error) {
            console.error("Error obteniendo tipos de documento:", error);
            return [];
        }
    }
};
