import api from "../../../../../utils/api.js";

const API_URL = "/orders";

const getApiError = (error, fallback) => {
    const apiError = new Error(error.response?.data?.error || error.response?.data?.message || error.message || fallback);
    apiError.status = error.response?.status;
    return apiError;
};

const normalizeSearch = (value) => String(value || "").trim().toLowerCase();

const formatDateForSearch = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}/${month}/${year} ${day}-${month}-${year} ${year}-${month}-${day}`;
};

const normalizeNumber = (value) => String(value ?? "").replace(/\D/g, "");

const matchesOrderSearch = (order, search) => {
    const query = normalizeSearch(search);
    const firstName = order.client?.firstName || order.client?.name || "";
    const lastName = order.client?.lastName || "";
    const clientName = `${firstName} ${lastName}`.toLowerCase();
    const documentType = String(order.client?.documentType?.abbreviation || "").toLowerCase();
    const documentNumber = String(order.client?.documentNumber || order.documentNumber || "").toLowerCase();
    const status = String(order.status || "").toLowerCase();
    const paymentMethod = String(order.paymentMethod || "").toLowerCase();
    const total = normalizeNumber(order.total);
    const numericQuery = normalizeNumber(query);
    const orderDate = formatDateForSearch(order.orderDate);
    const dueDate = formatDateForSearch(order.dueDate);

    return (
        clientName.includes(query) ||
        documentType.includes(query) ||
        documentNumber.includes(query) ||
        status.includes(query) ||
        paymentMethod.includes(query) ||
        (numericQuery.length > 0 && total.includes(numericQuery)) ||
        orderDate.includes(query) ||
        dueDate.includes(query)
    );
};

export const ServicesOrders = {
    // OBTENER TODOS LOS PEDIDOS
    async getAllOrders() {
        try {
            const firstPayload = (await api.get(API_URL, { params: { page: "1", limit: "100" } })).data;
            const orders = [...(firstPayload.data || firstPayload.items || [])];
            for (let page = 2; page <= (firstPayload.totalPages || 1); page += 1) {
                const payload = (await api.get(API_URL, { params: { page: String(page), limit: "100" } })).data;
                orders.push(...(payload.data || payload.items || []));
            }
            return orders;
        } catch (error) {
            throw getApiError(error, "Error al obtener los pedidos");
        }
    },

    async getPage({ page = 1, limit = 15, search = "" } = {}) {
        try {
            const params = { page: String(page), limit: String(Math.min(limit, 100)) };
            if (search.trim()) params.search = search.trim();
            const payload = (await api.get(API_URL, { params })).data;
            const data = payload.data || payload.items || [];

            if (search.trim()) {
                const query = normalizeSearch(search);
                const isDateSearch = /^(\d{4}|\d{1,4}[-/]\d{1,2}([-/]\d{1,4})?|\d{1,2})$/.test(query);
                const isDocumentTypeSearch = /^(cc|ce|ti|nit|pas|rc)$/.test(query);
                const isPaymentSearch = /^(contado|credito|crédito|mixto)$/.test(query);
                const isTotalSearch = /^[$\s\d.,]+$/.test(query) && normalizeNumber(query).length >= 3;

                if (isDateSearch || isDocumentTypeSearch || isPaymentSearch || isTotalSearch || !data.length) {
                    const allOrders = await this.getAllOrders();
                    const matchingOrders = allOrders.filter(order => matchesOrderSearch(order, search));
                    const safeLimit = Math.min(limit, 100);
                    const start = (page - 1) * safeLimit;

                    return {
                        data: matchingOrders.slice(start, start + safeLimit),
                        page,
                        limit: safeLimit,
                        total: matchingOrders.length,
                        totalPages: Math.max(1, Math.ceil(matchingOrders.length / safeLimit)),
                    };
                }
            }

            return { data, page: payload.page ?? page, limit: payload.limit ?? limit, total: payload.total ?? data.length, totalPages: payload.totalPages ?? 1 };
        } catch (error) {
            throw getApiError(error, "Error al obtener los pedidos");
        }
    },

    // OBTENER PEDIDO POR ID
    async getOrderById(id) {
        try {
            const payload = (await api.get(`${API_URL}/${id}`)).data;
            return payload.data || payload;
        } catch (error) {
            throw getApiError(error, "Error al obtener el pedido");
        }
    },

    // CREAR PEDIDO
    async createOrder(orderData) {
        try {
            return (await api.post(API_URL, orderData)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al crear el pedido");
        }
    },

    async cancelOrder(id, cancelReason) {
        try {
            return (await api.patch(`${API_URL}/${id}/cancel`, { cancelReason })).data.data;
        } catch (error) {
            throw getApiError(error, "Error al cancelar el pedido");
        }
    },

    // CONFIRMAR PEDIDO Y CONVERTIRLO EN VENTA
    async confirmOrder(id, confirmationData = {}) {
        try {
            return (await api.patch(`${API_URL}/${id}/confirm`, confirmationData)).data.data;
        } catch (error) {
            throw getApiError(error, "Error al confirmar el pedido");
        }
    }
};