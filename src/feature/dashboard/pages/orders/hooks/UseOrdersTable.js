import { useEffect, useState } from "react";

export function useOrdersTable(searchTerm, currentPage, recordsPerPage) {

    const [orders, setOrders] = useState([]);

    // CARGAR PEDIDOS DEL LOCALSTORAGE
    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const storedClients = JSON.parse(localStorage.getItem("clients")) || [];

        // JOIN PARA UNIR CLIENTS Y ORDERS
        const formattedOrders = storedOrders.map(order => {

            const client = storedClients.find(
                client => client.id === order.clienteId
            );

            // CALCULAR TOTAL (SI HAY PRODUCTOS)
            const subtotal = order.productos?.reduce((acc, product) => {
                return acc + (product.subtotal || 0);
            }, 0) || 0;

            const iva = subtotal * 0.19; // 19%

            const total = subtotal + iva;

            return {
                ...order,
                nombreCliente: client ? `${client.nombres} ${client.apellidos}` : "Cliente no encontrado",
                tipoDocumento: client?.tipoDocumento || "",
                subtotal,
                iva,
                total
            };
        });

        setOrders(formattedOrders);

    }, []);

    // FILTRADO
    const filteredOrders = orders.filter(order => {

        const query = searchTerm?.toLowerCase() || "";

        return (
            order.nombreCliente?.toLowerCase().includes(query) ||
            order.tipoDocumento?.toLowerCase().includes(query) ||
            order.documento?.toLowerCase().includes(query) ||
            order.formaPago?.toLowerCase().includes(query) ||
            order.estado?.toLowerCase().includes(query)
        );

    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);

    // FUNCION PARA DEVOLVER UN PEDIDO
    const cancelOrder = (orderToCancel) => {

        // SI YA ESTA ANULADO NO HACER NADA
        if (orderToCancel.estado === "Anulado") {
            return;
        }

        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];

        // DEVOLVER STOCK
        const updatedProducts = storedProducts.map(product => {

            const productInOrder = orderToCancel.productos.find(
                p => p.id === product.id
            );

            if (productInOrder) {
                return {
                    ...product,
                    stock: product.stock + productInOrder.cantidad
                };
            }

            return product;
        });

        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // CAMBIAR ESTADO DEL PEDIDO
        const updatedOrders = storedOrders.map(order =>
            order.id === orderToCancel.id
                ? { ...order, estado: "Anulado" }
                : order
        );

        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        // ACTUALIZAR ESTADO LOCAL
        setOrders(prev =>
            prev.map(order =>
                order.id === orderToCancel.id
                    ? { ...order, estado: "Anulado" }
                    : order
            )
        );
    };

    return {
        data: currentRecords,
        totalPages,
        cancelOrder
    };
}