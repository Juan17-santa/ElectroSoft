import api from "../../../../../utils/api.js";

const API_URL = "/products";

const getApiError = (error, fallback) => {
    const apiError = new Error(error.response?.data?.error || error.response?.data?.message || error.message || fallback);
    apiError.status = error.response?.status;
    return apiError;
};

// Función auxiliar para mapear un producto de API (backend) al formato del frontend
const mapProductFromAPI = (apiProduct) => {
    if (!apiProduct) return null;
    
    // Mapear características de backend (name, unit, value) a frontend (nombre, medida, valor)
    const mappedCharacteristics = (apiProduct.characteristics || []).map(car => ({
        id: car._id || car.id,
        nombre: car.name,
        medida: car.unit || "-",
        valor: car.value || "",
        visible: car.visible !== undefined ? car.visible : true
    }));

    return {
        id: apiProduct._id || apiProduct.id,
        nombre: apiProduct.name,
        categoriaId: apiProduct.categoryId ? apiProduct.categoryId._id || apiProduct.categoryId : null,
        precio: apiProduct.price,
        stock: apiProduct.stock,
        tipoStock: apiProduct.typeStock,
        serial: apiProduct.serial,
        garantia: apiProduct.warranty,
        caracteristicas: mappedCharacteristics,
        estado: apiProduct.status !== undefined ? apiProduct.status : true,
        canDelete: apiProduct.canDelete !== undefined ? apiProduct.canDelete : true,
        createdAt: apiProduct.createdAt,
        updatedAt: apiProduct.updatedAt
    };
};

export const ServicesProducts = {
    /** Mantiene compatibilidad con reportes y validaciones legacy recorriendo páginas de 100. */
    async get({ search = "" } = {}) {
        try {
            const firstParams = { page: "1", limit: "100" };
            if (search.trim()) firstParams.search = search.trim();
            const firstPayload = (await api.get(API_URL, { params: firstParams })).data;
            const products = [...(firstPayload.data || firstPayload.items || [])];
            for (let page = 2; page <= (firstPayload.totalPages || 1); page += 1) {
                const params = { page: String(page), limit: "100" };
                if (search.trim()) params.search = search.trim();
                const payload = (await api.get(API_URL, { params })).data;
                products.push(...(payload.data || payload.items || []));
            }
            return products.map(mapProductFromAPI);
        } catch (error) {
            throw getApiError(error, "Error al obtener los productos");
        }
    },

    async getPage({ page = 1, limit = 15, search = "" } = {}) {
        try {
            const params = { page: String(page), limit: String(Math.min(limit, 100)) };
            if (search.trim()) params.search = search.trim();
            const payload = (await api.get(API_URL, { params })).data;
            const data = (payload.data || payload.items || []).map(mapProductFromAPI);
            return {
                data,
                page: payload.page ?? page,
                limit: payload.limit ?? limit,
                total: payload.total ?? data.length,
                totalPages: payload.totalPages ?? 1,
            };
        } catch (error) {
            throw getApiError(error, "Error al obtener los productos");
        }
    },

    /**
     * Obtener producto por ID
     */
    async getById(id) {
        try {
            const payload = (await api.get(`${API_URL}/${id}`)).data;
            return mapProductFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al obtener el producto");
        }
    },

    /**
     * Crear producto
     * @param {Object} producto - Datos del producto
     * @param {string} producto.nombre - Nombre del producto
     * @param {string} producto.categoryId - ID de la categoría
     * @param {number} producto.precio - Precio
     * @param {number} producto.stock - Stock
     * @param {string} producto.typeStock - Tipo de stock (unidad/metros)
     * @param {string} producto.serial - Serial del producto
     * @param {string} producto.warranty - Garantía
     * @param {Array} producto.characteristics - Características del producto
     */
    async create(producto) {
        try {
            // Mapear características de frontend (nombre, medida, valor) a backend (name, unit, value)
            const mappedCharacteristics = (producto.caracteristicas || []).map(car => ({
                name: car.nombre || car.name,
                unit: car.medida || car.unit || "-",
                value: car.valor || car.value || "",
                visible: car.visible !== undefined ? car.visible : true
            }));

            // Mapear los nombres de campos del frontend al backend
            const productData = {
                name: producto.nombre,
                categoryId: producto.categoriaId,
                price: Number(producto.precio),
                stock: Number(producto.stock),
                typeStock: producto.tipoStock,
                serial: producto.serial,
                warranty: producto.garantia,
                characteristics: mappedCharacteristics
            };

            const payload = (await api.post(API_URL, productData)).data;
            return mapProductFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al crear el producto");
        }
    },

    /**
     * Actualizar producto
     */
    async update(id, productoActualizado) {
        try {
            // Mapear características de frontend (nombre, medida, valor) a backend (name, unit, value)
            const mappedCharacteristics = (productoActualizado.caracteristicas || []).map(car => ({
                name: car.nombre || car.name,
                unit: car.medida || car.unit || "-",
                value: car.valor || car.value || "",
                visible: car.visible !== undefined ? car.visible : true
            }));

            // Mapear los nombres de campos del frontend al backend
            const productData = {
                name: productoActualizado.nombre,
                categoryId: productoActualizado.categoriaId,
                price: Number(productoActualizado.precio),
                stock: Number(productoActualizado.stock),
                typeStock: productoActualizado.tipoStock,
                serial: productoActualizado.serial,
                warranty: productoActualizado.garantia,
                status: productoActualizado.estado,
                characteristics: mappedCharacteristics
            };

            const payload = (await api.put(`${API_URL}/${id}`, productData)).data;
            return mapProductFromAPI(payload.data);
        } catch (error) {
            throw getApiError(error, "Error al actualizar el producto");
        }
    },

    /**
     * Eliminar producto
     */
    async delete(id) {
        try {
            return (await api.delete(`${API_URL}/${id}`)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al eliminar el producto");
        }
    },

    /**
     * Cambiar estado del producto (activo/inactivo)
     */
    async toggleEstado(id) {
        try {
            return (await api.patch(`${API_URL}/${id}/status`)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al cambiar el estado del producto");
        }
    },

    /**
     * Verificar si un serial ya existe (para validación de unicidad)
     * @param {string} serial - Serial a verificar
     * @param {string} excludeId - ID del producto a excluir (opcional, para edición)
     * @returns {boolean} true si el serial ya existe
     */
    async checkSerialExists(serial, excludeId = null) {
        try {
            const result = await this.getPage({ page: 1, limit: 100, search: serial });
            return result.data.some(prod =>
                prod.serial?.toLowerCase() === serial.toLowerCase() &&
                prod.id !== excludeId
            );
        } catch (error) {
            throw getApiError(error, "No se pudo validar el serial");
        }
    }
};