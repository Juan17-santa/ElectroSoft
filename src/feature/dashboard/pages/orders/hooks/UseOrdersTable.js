import { useEffect, useState } from "react";
import { ServicesOrders } from "../services/ServicesOrders";
import { ClientsService } from "../../Clients/services/ClientsService";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { SalesService } from "../../SalesManagement/services/SalesService";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DE LA TABLA DE PEDIDOS
export function useOrdersTable(searchTerm, currentPage, recordsPerPage) {

    // ESTADO PARA GUARDAR LA LISTA DE PEDIDOS
    const [orders, setOrders] = useState([]);

    // CARGAR PEDIDOS DEL LOCALSTORAGE Y CRUZAR DATOS 
    useEffect(() => {
        const storedOrders = ServicesOrders.get().sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        const storedClients = ClientsService.get();

        // JOIN PARA UNIR CLIENTS Y ORDERS
        const formattedOrders = storedOrders.map(order => {

            // BUSCAR EL CLIENTE RELACIONADO POR ID
            const client = storedClients.find(
                client => client.id === order.clienteId
            );

            // CÁLCULO DINÁMICO DEL SUBTOTAL BASADO EN EL ARRAY DE PRODUCTOS
            const subtotal = order.productos?.reduce((acc, product) => {
                return acc + (product.subtotal || 0);
            }, 0) || 0;

            // IMPUESTO DEL 19%
            const iva = subtotal * 0.19;

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

        // CONVERSIÓN DE VALORES NUMÉRICOS Y FECHAS A STRING PARA LA BÚSQUEDA
        const totalStr = order.total?.toString() || "";

        const fechaCreacionStr = order.fechaCreacion
            ? new Date(order.fechaCreacion).toLocaleDateString('es-CO')
            : "";

        const fechaVencimientoStr = order.fechaVencimiento
            ? new Date(order.fechaVencimiento).toLocaleDateString('es-CO')
            : "";

        // RETORNA TRUE SI CUALQUIER CAMPO COINCIDE CON LA BÚSQUEDA
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

    // FUNCION PARA ANULAR PEDIDO Y DEVOLVER STOCK
    const cancelOrder = (orderToCancel, motivo, fechaAnulacion) => {

        // SI YA ESTA ANULADO NO HACER NADA
        if (orderToCancel.estado === "Anulado") {
            return;
        }

        const storedOrders = ServicesOrders.get();
        const storedProducts = ServicesProducts.get();

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

        // ACTUALIZAR PRODUCTOS EN LOCALSTORAGE
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // ACTUALIZAR ESTADO DEL PEDIDO Y AGREGAR INFO DE CANCELACIÓN
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

        // ACTUALIZAR EL ESTADO LOCAL PARA REFLEJAR CAMBIOS EN LA UI
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

    // FUNCION PARA CONVERTIR PEDIDO EN VENTA PROCESADA
    const processOrderToSale = (order) => {
        const storedSales = SalesService.get();
        const storedOrders = ServicesOrders.get();

        // DETERMINAR ESTADO SEGÚN FORMA DE PAGO (CONTADO = FINALIZADO)
        const nuevoEstado = order.formaPago === "Contado" ? "Finalizado" : "Vigente";

        // CONSTRUCCIÓN DEL OBJETO DE VENTA
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
            abonos: [] // INICIA SIN ABONOS
        };

        // GUARDAR LA NUEVA VENTA EN VENTAS
        localStorage.setItem("sales", JSON.stringify([...storedSales, newSale]));

        // ELIMINAR EL PEDIDO (YA ES UNA VENTA)
        const updatedOrders = storedOrders.filter(o => o.id !== order.id);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        // ACTUALIZAR ESTADO LOCAL PARA REMOVER DE LA TABLA DE PEDIDOS
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        data: currentRecords,
        totalPages,
        cancelOrder,
        processOrderToSale
    };
}