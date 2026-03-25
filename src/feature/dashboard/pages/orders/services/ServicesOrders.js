import { SalesService } from "../../SalesManagement/services/SalesService";
const KEY = "orders";

export const ServicesOrders = {

    get() {
        const data = localStorage.getItem(KEY);
        const orders = data ? JSON.parse(data) : [];
        return orders.sort((a, b) => b.id - a.id);
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
    },

    cancel(orderToCancel, motivo, fechaAnulacion) {
        const storedOrders = this.get();
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];

        // DEVOLVER STOCK
        const updatedProducts = storedProducts.map(product => {
            const productInOrder = orderToCancel.productos.find(p => p.id === product.id);

            if (productInOrder) {
                return {
                    ...product,
                    stock: product.stock + productInOrder.cantidad
                };
            }

            return product;
        });

        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // ACTUALIZAR PEDIDO
        const updatedOrders = storedOrders.map(order =>
            order.id === orderToCancel.id
                ? {
                    ...order,
                    estado: "Anulado",
                    cancelInfo: {
                        motivo,
                        fechaAnulacion
                    }
                }
                : order
        );

        localStorage.setItem(KEY, JSON.stringify(updatedOrders));
    },

    processToSale(order) {
        const storedOrders = this.get();
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];

        // DEVOLVER STOCK DEL PEDIDO YA QUE VENTAS SE ENCARGA DE RESTARLO
        const restoredProducts = storedProducts.map(product => {
            const productInOrder = order.productos.find(p => p.id === product.id);

            if (productInOrder) {
                return {
                    ...product,
                    stock: product.stock + productInOrder.cantidad
                };
            }

            return product;
        });

        localStorage.setItem("products", JSON.stringify(restoredProducts));

        // CREAR LA VENTA (AQUÍ SE VUELVE A DESCONTAR CORRECTAMENTE)
        const saleData = {
            numeroDocumento: order.documento,
            tipoVenta: order.formaPago,
            fecha: new Date().toISOString().split('T')[0],
            estado: order.formaPago === "Contado" ? "Finalizado" : "Vigente",
            productos: order.productos.map(p => ({
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad
            }))
        };

        SalesService.create(saleData);

        // ELIMINAR REGISTRO DE PEDIDOS Y AÑADIRLO A VENTAS
        const updatedOrders = storedOrders.filter(o => o.id !== order.id);
        localStorage.setItem(KEY, JSON.stringify(updatedOrders));
    }
};