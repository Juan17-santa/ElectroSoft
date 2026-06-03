const API_URL = "http://localhost:4000/api/products";

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
        createdAt: apiProduct.createdAt,
        updatedAt: apiProduct.updatedAt
    };
};

export const ServicesProducts = {
    /**
     * Obtener todos los productos
     */
    async get() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error al obtener los productos");
            const resJson = await response.json();
            // Mapear todos los productos al formato del frontend
            return (resJson.data || []).map(mapProductFromAPI);
        } catch (error) {
            console.error("Error en get:", error);
            throw error;
        }
    },

    /**
     * Obtener producto por ID
     */
    async getById(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) throw new Error("Error al obtener el producto");
            const resJson = await response.json();
            // Mapear el producto al formato del frontend
            return mapProductFromAPI(resJson.data);
        } catch (error) {
            console.error("Error en getById:", error);
            throw error;
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

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al crear el producto");
            }
            // Mapear el producto al formato del frontend
            return mapProductFromAPI(resJson.data);
        } catch (error) {
            console.error("Error en create:", error);
            throw error;
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

            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al actualizar el producto");
            }
            // Mapear el producto al formato del frontend
            return mapProductFromAPI(resJson.data);
        } catch (error) {
            console.error("Error en update:", error);
            throw error;
        }
    },

    /**
     * Eliminar producto
     */
    async delete(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al eliminar el producto");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en delete:", error);
            throw error;
        }
    },

    /**
     * Cambiar estado del producto (activo/inactivo)
     */
    async toggleEstado(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });

            const resJson = await response.json();
            if (!response.ok) {
                throw new Error(resJson.error || "Error al cambiar el estado del producto");
            }
            return resJson.data;
        } catch (error) {
            console.error("Error en toggleEstado:", error);
            throw error;
        }
    }
};