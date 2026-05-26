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
                    // El backend se encarga de validar restricciones de compras
                    await ServicesProviders.delete(id);

                    // Si todo sale bien, recargamos la lista desde el servidor
                    await loadProviders();
                    setConfirmData(null);
                    showAlert("success", "Proveedor eliminado con éxito");
                } catch (error) {
                    setConfirmData(null);
                    // Aquí capturamos el mensaje exacto que configuraste en tu backend
                    showAlert("error", error.message || "No se pudo eliminar el proveedor");
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
                    setConfirmData(null);
                    showAlert("error", "No se pudo cambiar el estado");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FILTRADO DEL BUSCADOR OPTIMIZADO (INCLUYE CATEGORÍAS Y CORRIGE BUGS)
    const filteredProviders = providers.filter(pro => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true; // Si no hay búsqueda, pasan todos

        // 1. Convertir teléfonos y documentos a String seguro (Evita errores con números puros)
        const phone = pro.contactPhone ? String(pro.contactPhone) : "";
        const documentStr = pro.document ? String(pro.document).toLowerCase() : "";

        // 2. Extraer abreviatura y nombre del tipo de documento de forma segura
        const docTypeAbbreviation = pro.documentType?.abbreviation ? String(pro.documentType.abbreviation).toLowerCase() : "";
        const docTypeName = pro.documentType?.name ? String(pro.documentType.name).toLowerCase() : "";

        // 3. BUSCADOR EN CATEGORÍAS ASOCIADAS (Recorre el array buscando coincidencia en el nombre)
        const matchesCategory = pro.categoriesAssociated?.some(cat => {
            // Soporta si viene populado como objeto { name: '...' } o { nombre: '...' }
            const catName = cat.name || cat.nombre || "";
            return String(catName).toLowerCase().includes(query);
        }) || false;

        // 4. Validaciones exactas y parciales para los estados
        let matchesStatus = false;
        if (query === "activo") {
            matchesStatus = pro.status === true;
        } else if (query === "inactivo") {
            matchesStatus = pro.status === false;
        } else {
            matchesStatus = (pro.status ? "activo" : "inactivo").includes(query);
        }

        // 5. Retorno con todas las condiciones unificadas
        return (
            pro.providerName?.toLowerCase().includes(query) ||
            documentStr.includes(query) ||
            docTypeAbbreviation.includes(query) || // 👈 Busca por "CC", "NIT", etc.
            docTypeName.includes(query) ||         // 👈 Busca por "Cédula", "Nit", por si algo.
            pro.contactName?.toLowerCase().includes(query) ||
            phone.includes(query) ||
            matchesCategory ||                     // 👈 Filtra por el nombre de las categorías
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
        loadProviders
    };
}