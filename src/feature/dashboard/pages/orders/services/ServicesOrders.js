const KEY = "orders";

export const ServicesOrders = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    create({ documento, clienteId, fechaPedido, fechaVencimiento, productos, formaPago }) {

        const orders = this.get();

        const nuevoPedido = {
            id: Date.now(),
            documento,
            clienteId,
            fechaPedido,
            fechaVencimiento,
            productos,
            formaPago,
            estado: "Pendiente",
            fechaCreacion: new Date().toISOString()
        };

        const nuevosPedidos = [...orders, nuevoPedido];

        localStorage.setItem(KEY, JSON.stringify(nuevosPedidos));

        return nuevoPedido;
    }
};