import { ServicesProviders } from "../services/ServicesProviders";
import { useState, useEffect } from "react";

export default function useProvidersTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);

    // FUNCION ASÍNCRONA PARA CARGAR LOS PROVEEDORES DESDE EL BACKEND
    const loadProviders = async () => {
        setLoading(true);
        try {
            const data = await ServicesProviders.get();
            setProviders(data);
        } catch (error) {
            console.error(error);
            showAlert("error", "No se pudieron cargar los proveedores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviders();
    }, [])

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

    // FILTRADO DEL BUSCADOR
    const filteredProviders = providers.filter(pro => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;

        // CONVERTIR TELEFONO Y DOCUMENTO A STRING PARA EVITAR ERRORES DE TIPO
        const contactPhone = pro.contactPhone ? String(pro.contactPhone) : "";
        const providerPhone = pro.providerPhone ? String(pro.providerPhone) : "";
        const documentStr = pro.document ? String(pro.document).toLowerCase() : "";

        // EXTRAER ABREVIATURA DEL TIPO DE DOCUMENTO 
        const docTypeAbbreviation = pro.documentType?.abbreviation ? String(pro.documentType.abbreviation).toLowerCase() : "";

        const providerType = pro.providerType?.toLowerCase() || "";
        const providerEmail = pro.providerEmail?.toLowerCase() || "";

        const matchesDocTypeAbbreviation = docTypeAbbreviation === query;

        let matchesStatus = false;
        if (query === "activo") {
            matchesStatus = pro.status === true;
        } else if (query === "inactivo") {
            matchesStatus = pro.status === false;
        } else {
            matchesStatus = (pro.status ? "activo" : "inactivo").includes(query);
        }

        return (
            pro.providerName?.toLowerCase().includes(query) ||
            documentStr.includes(query) ||
            matchesDocTypeAbbreviation ||
            providerType.includes(query) ||
            providerEmail.includes(query) ||
            contactPhone.includes(query) ||
            providerPhone.includes(query) ||
            matchesStatus
        );
    });

    // LOGICA DE PAGINACION
    const totalPages = Math.ceil(filteredProviders.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredProviders.slice(firstIndex, lastIndex);

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: currentRecords,
        totalPages,
        deleteProvider,
        toggleEstado,
        loadProviders,
        loading
    };
}