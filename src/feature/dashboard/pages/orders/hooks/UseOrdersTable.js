import { useEffect, useState } from "react";
import { ServicesOrders } from "../services/ServicesOrders";
import { ClientsService } from "../../Clients/services/ClientsService";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { SalesService } from "../../SalesManagement/services/SalesService";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DE LA TABLA DE PEDIDOS
export function useOrdersTable(searchTerm, currentPage, recordsPerPage) {

    // ESTADO PARA GUARDAR LA LISTA DE PEDIDOS
    const [orders, setOrders] = useState([]);

    const cargarDatos = () => {
        const storedOrders = ServicesOrders.get().sort(
            (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );

        const storedClients = ClientsService.get();

        const formattedOrders = storedOrders.map(order => {
            const client = storedClients.find(c => c.id === order.clienteId);

            const subtotal = order.productos?.reduce((acc, p) => acc + (p.subtotal || 0), 0) || 0;
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
    };

    // CARGAR PEDIDOS DEL LOCALSTORAGE Y CRUZAR DATOS 
    useEffect(() => {
        cargarDatos();
    }, []);

    // FILTRADO
    const filteredOrders = orders.filter(order => {
        const query = searchTerm?.toLowerCase() || "";

        // CONVERSIÓN DE VALORES NUMÉRICOS Y FECHAS A STRING PARA LA BÚSQUEDA
        const totalStr = order.total?.toString() || "";

        const fechaPedidoStr = order.fechaPedido
            ? new Date(order.fechaPedido).toLocaleDateString('es-CO')
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
            fechaPedidoStr.includes(query) ||
            fechaVencimientoStr.includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);

    const cancelOrder = (order, motivo, fechaAnulacion) => {
        ServicesOrders.cancel(order, motivo, fechaAnulacion);
        cargarDatos();
    };

    const processOrderToSale = (order) => {
        ServicesOrders.processToSale(order);
        cargarDatos();
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        data: currentRecords,
        totalPages,
        cancelOrder,
        processOrderToSale
    };
}