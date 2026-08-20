import { ServicesProviders } from "../services/ServicesProviders";
import { useState, useEffect, useRef } from "react";

export default function useProvidersTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {

    const [providers, setProviders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);
    const searchTimerRef = useRef(null);

    // FUNCION ASÍNCRONA PARA CARGAR LOS PROVEEDORES DESDE EL BACKEND
    const loadProviders = async () => {
        setLoading(true);
        try {
            const requestId = ++requestIdRef.current;
            const result = await ServicesProviders.getPage({ page: currentPage, limit: recordsPerPage, search: searchTerm });
            if (requestId !== requestIdRef.current) return;
            setProviders(result.data);
            setTotalPages(result.totalPages);
        } catch (error) {
            if (requestIdRef.current) showAlert("error", error.message || "No se pudieron cargar los proveedores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(loadProviders, 300);
        return () => {
            clearTimeout(searchTimerRef.current);
            requestIdRef.current += 1;
        };
    }, [searchTerm, currentPage, recordsPerPage]);

    // FUNCION PARA ELIMINAR UN PROVEEDOR
    const deleteProvider = (id) => {
        const providerToDelete = providers.find(p => p._id === id);

        if (!providerToDelete) {
            showAlert("error", "Proveedor no encontrado");
            return;
        }

        setConfirmData({
            type: "delete",
            title: "Eliminar proveedor",
            message: `¿Seguro que deseas eliminar el proveedor "${providerToDelete.providerName}"? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    await ServicesProviders.delete(id);

                    await loadProviders();
                    setConfirmData(null);
                    showAlert("success", "Proveedor eliminado con éxito");
                } catch (error) {
                    setConfirmData(null);

                    showAlert(
                        "error",
                        error.message || "No se pudo eliminar el proveedor"
                    );
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UN PROVEEDOR
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del proveedor",
            message: "¿Seguro que deseas cambiar el estado de este proveedor?",
            onConfirm: async () => {
                try {
                    await ServicesProviders.toggleStatus(id);
                    await loadProviders();
                    setConfirmData(null);
                    showAlert("success", "Estado del proveedor actualizado con éxito");
                } catch (error) {
                    console.error(error);
                    setConfirmData(null);
                    showAlert("error", "No se pudo cambiar el estado");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: providers,
        totalPages,
        deleteProvider,
        toggleEstado,
        loadProviders,
        loading
    };
}