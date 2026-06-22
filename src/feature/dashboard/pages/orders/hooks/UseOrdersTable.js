import { useEffect, useState } from "react";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersTable(searchTerm, currentPage, recordsPerPage, showAlert) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // FUNCION ASINCRONICA PARA CARGAR LOS PEDIDOS DESDE EL BACKEND
    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await ServicesOrders.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            showAlert("error", "No se pudieron cargar los pedidos")
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadOrders();
    }, []);

    // FUNCION PARA ANULAR PEDIDO (LLAMADA DESDE EL MODAL)
    const cancelOrder = async (id, motivo) => {
        try {
            await ServicesOrders.cancelOrder(id, motivo);
            await loadOrders();
        } catch (error) {
            console.error(error);
            showAlert("error", "No se pudo anular el pedido");
        }
    };

    const processOrderToSale = async (id) => {
        try {
            await ServicesOrders.confirmOrder(id);
            await loadOrders();
        } catch (error) {
            console.error(error);
            showAlert("error", error.message || "No se pudo procesar la venta");
        }
    };

    // FILTRADO DEL BUSCADOR (DATOS DE LA TABLA)
    const filteredOrders = orders.filter(order => {
        const query = searchTerm?.toLowerCase().trim() || "";

        // 1. ARMAR NOMBRE COMPLETO DEL CLIENTE
        const firstName = order.client?.firstName || order.client?.name || "";
        const lastName = order.client?.lastName || "";
        const nombreCompletoStr = `${firstName} ${lastName}`.toLowerCase();

        // 2. DOCUMENTO Y TIPO DE DOCUMENTO
        const tipoDocStr = order.client?.documentType?.abbreviation?.toLowerCase() || "";
        const numDocStr = order.client?.documentNumber?.toString() || order.documentNumber?.toString() || "";
        // Combinamos por si el usuario busca "CC 123" todo junto
        const documentoCompletoStr = `${tipoDocStr} ${numDocStr}`;

        // 3. CONVERTIR EL TOTAL A STRING (Sin puntos ni comas para facilitar la búsqueda)
        const totalStr = order.total?.toString() || "";

        // 4. FORMATO DE FECHAS (Forzamos formato DD/MM/AAAA y DD-MM-AAAA para dar flexibilidad)
        const formatDateForSearch = (isoString) => {
            if (!isoString) return "";
            const date = new Date(isoString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year} ${day}-${month}-${year}`; // Retorna ambos formatos
        };

        const fechaPedidoStr = formatDateForSearch(order.orderDate);
        const fechaVencimientoStr = formatDateForSearch(order.dueDate);

        // 5. OTROS CAMPOS PLANOS
        const formaPagoStr = order.paymentMethod?.toLowerCase() || "";
        const estadoStr = order.status?.toLowerCase() || "";

        // RETORNO COMPROBANDO CADA CASO
        return (
            nombreCompletoStr.includes(query) ||
            numDocStr.includes(query) ||
            tipoDocStr.includes(query) ||
            documentoCompletoStr.includes(query) ||
            formaPagoStr.includes(query) ||
            estadoStr.includes(query) ||
            totalStr.includes(query) ||
            fechaPedidoStr.includes(query) ||
            fechaVencimientoStr.includes(query)
        );
    });

    // LOGICA DE PAGINACION
    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: currentRecords,
        totalPages,
        cancelOrder,
        processOrderToSale,
        loadOrders,
        loading,
    };
}