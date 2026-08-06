const API_URL = "http://localhost:4000/api/orders";

export const ServicesOrders = {

    // OBTENER TODOS LOS PEDIDOS
    async getAllOrders() {
        try {
            const response = await fetch(API_URL);
            const resJson = await response.json();

            if (!response.ok) throw new Error(resJson.error || "Error al obtener los pedidos");

            return resJson.data || resJson;
        } catch (error) {
            console.error("Error en getAllOrders:", error);
            throw error;
        }
    },

    // OBTENER PEDIDO POR ID
    async getOrderById(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const resJson = await response.json();

            if (!response.ok) throw new Error(resJson.error || "Error al obtener el pedido");

            return resJson.data || resJson;
        } catch (error) {
            console.error(`Error en getOrderById (ID: ${id}):`, error);
            throw error;
        }
    },

    // CREAR PEDIDO
    async createOrder(orderData) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });
            const resJson = await response.json();

            if (!response.ok) throw new Error(resJson.error || "Error al crear el pedido");

            return resJson.data;
        } catch (error) {
            console.error("Error en el servicio createOrder: ", error);
            throw error;
        }
    },

    async cancelOrder(id, cancelReason) {
        try {
            const response = await fetch(`${API_URL}/${id}/cancel`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cancelReason })
            });
            const resJson = await response.json();

            if (!response.ok) throw new Error(resJson.error || "Error al cancelar el pedido");

            return resJson.data;
        } catch (error) {
            console.error(`Error en el servicio cancelOrder (ID: ${id}):`, error);
            throw error;
        }
    },

    // CONFIRMAR PEDIDO Y CONVERTIRLO EN VENTA
    async confirmOrder(id, confirmationData = {}) {
        try {
            const response = await fetch(`${API_URL}/${id}/confirm`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(confirmationData)
            });
            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(
                    resJson.error ||
                    "Error al confirmar el pedido"
                );
            }
            return resJson.data;
        } catch (error) {
            console.error(
                `Error en confirmOrder (${id})`,
                error
            );
            throw error;
        }
    }
};