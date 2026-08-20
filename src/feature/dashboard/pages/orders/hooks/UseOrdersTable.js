import { useEffect, useRef, useState } from "react";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersTable(searchTerm, currentPage, recordsPerPage, showAlert) {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const requestIdRef = useRef(0);
    const searchTimerRef = useRef(null);

    // FUNCION ASINCRONICA PARA CARGAR LOS PEDIDOS DESDE EL BACKEND
    const loadOrders = async () => {
        setLoading(true);
        try {
            const requestId = ++requestIdRef.current;
            const result = await ServicesOrders.getPage({ page: currentPage, limit: recordsPerPage, search: searchTerm });
            if (requestId !== requestIdRef.current) return;
            setOrders(result.data);
            setTotalPages(result.totalPages);
        } catch (error) {
            if (requestIdRef.current) showAlert("error", error.message || "No se pudieron cargar los pedidos");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(loadOrders, 300);
        return () => {
            clearTimeout(searchTimerRef.current);
            requestIdRef.current += 1;
        };
    }, [searchTerm, currentPage, recordsPerPage]);

    // FUNCION PARA ANULAR PEDIDO (LLAMADA DESDE EL MODAL)
    const cancelOrder = async (id, motivo) => {
        try {
            await ServicesOrders.cancelOrder(id, motivo);
            await loadOrders();
        } catch (error) {
            await loadOrders();
            throw error;
        }
    };

    const processOrderToSale = async (id, confirmationData) => {
        try {
            await ServicesOrders.confirmOrder(id, confirmationData);
            await loadOrders();
        } catch (error) {
            throw error;
        }
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: orders,
        totalPages,
        cancelOrder,
        processOrderToSale,
        loadOrders,
        loading,
    };
}