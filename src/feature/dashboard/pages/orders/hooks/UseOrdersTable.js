import { useEffect, useState } from "react";

export function useOrdersTable(searchTerm) {

    const [orders, setOrders] = useState([]);

    // 🔹 Cargar pedidos desde localStorage
    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const storedClients = JSON.parse(localStorage.getItem("clients")) || [];

        // 🔥 JOIN orders + clients
        const formattedOrders = storedOrders.map(order => {

            const client = storedClients.find(
                client => client.id === order.clienteId
            );

            // 🔹 Calcular total (si hay productos)
            const total = order.productos?.reduce((acc, product) => {
                return acc + (product.subtotal || 0);
            }, 0) || 0;

            return {
                ...order,
                nombreCliente: client?.nombre || "Cliente no encontrado",
                tipoDocumento: client?.tipoDocumento || "",
                total
            };
        });

        setOrders(formattedOrders);

    }, []);

    // 🔍 Filtro por búsqueda
    const filteredOrders = orders.filter(order =>
        order.nombreCliente?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
        order.documento?.includes(searchTerm || "")
    );

    return {
        data: filteredOrders
    };
}