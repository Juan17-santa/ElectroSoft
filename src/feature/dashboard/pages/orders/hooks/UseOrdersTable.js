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

        // Convertimos el total a string para poder buscar (ej: "50000")
        const totalStr = order.total?.toString() || "";

        // Formateamos Fecha de Creación (ej: "10/03/2026")
        const fechaCreacionStr = order.fechaCreacion
            ? new Date(order.fechaCreacion).toLocaleDateString('es-CO')
            : "";

        // Formateamos Fecha de Vencimiento (ej: "20/03/2026")
        const fechaVencimientoStr = order.fechaVencimiento
            ? new Date(order.fechaVencimiento).toLocaleDateString('es-CO')
            : "";

        return (
            order.nombreCliente?.toLowerCase().includes(query) ||
            order.tipoDocumento?.toLowerCase().includes(query) ||
            order.documento?.toLowerCase().includes(query) ||
            order.formaPago?.toLowerCase().includes(query) ||
            order.estado?.toLowerCase().includes(query) ||
            totalStr.includes(query) ||
            fechaCreacionStr.includes(query) ||
            fechaVencimientoStr.includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);

    // FUNCION PARA DEVOLVER UN PEDIDO
    const cancelOrder = (orderToCancel, motivo, fechaAnulacion) => {

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

        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        // ACTUALIZAR ESTADO LOCAL
        setOrders(prev =>
            prev.map(order =>
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
            )
        );
    };

    // FUNCION PARA PROCESAR UNA VENTA
    const processOrderToSale = (order) => {
        const storedSales = JSON.parse(localStorage.getItem("sales")) || [];
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];

        // Definir estado según la forma de pago
        const nuevoEstado = order.formaPago === "Contado" ? "Finalizado" : "Vigente";

        const newSale = {
            id: Date.now(),
            numeroDocumento: order.documento,
            cliente: order.nombreCliente,
            fecha: new Date().toISOString().split('T')[0],
            tipoVenta: order.formaPago,
            total: order.total,
            montoPagado: order.formaPago === "Contado" ? order.total : 0,
            montoPorPagar: order.formaPago === "Contado" ? 0 : order.total,
            estado: nuevoEstado,
            productos: order.productos,
            iva: order.iva,
            subtotal: order.subtotal,
            abonos: []
        };

        // 1. Guardar en ventas
        localStorage.setItem("sales", JSON.stringify([...storedSales, newSale]));

        // 2. Eliminar de pedidos (para que desaparezca de la tabla)
        const updatedOrders = storedOrders.filter(o => o.id !== order.id);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        // 3. Actualizar el estado local en el Hook
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    return {
        data: currentRecords,
        totalPages,
        cancelOrder,
        processOrderToSale
    };
}