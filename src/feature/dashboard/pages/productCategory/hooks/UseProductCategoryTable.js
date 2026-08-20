import { useEffect, useRef, useState } from "react";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

export default function useProductCategoryTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);
    const searchTimerRef = useRef(null);

    // FUNCION ASÍNCRONA PARA CARGAR LAS CATEGORIAS DESDE EL BACKEND
    const loadCategories = async () => {
        setLoading(true);
        try {
            const requestId = ++requestIdRef.current;
            const result = await ServiceProductCategory.getPage({ page: currentPage, limit: recordsPerPage, search: searchTerm });
            if (requestId !== requestIdRef.current) return;
            setCategories(result.data);
            setTotalPages(result.totalPages);
        } catch (error) {
            if (requestIdRef.current) showAlert("error", error.message || "No se pudieron cargar las categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(loadCategories, 300);
        return () => {
            clearTimeout(searchTimerRef.current);
            requestIdRef.current += 1;
        };
    }, [searchTerm, currentPage, recordsPerPage]);

    // FUNCION PARA ELIMINAR UNA CATEGORIA DE PRODUCTO
    const deleteCategory = (id) => {
        const categoryToDelete = categories.find(cat => cat.id === id);

        if (!categoryToDelete) {
            showAlert("error", "Categoría no encontrada");
            return;
        }

        setConfirmData({
            type: "delete",
            title: "Eliminar categoría",
            message: `¿Seguro que deseas eliminar la categoría "${categoryToDelete.name}"? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    await ServiceProductCategory.delete(id);

                    await loadCategories();
                    setConfirmData(null);
                    showAlert("success", "Categoría eliminada con éxito");
                } catch (error) {
                    setConfirmData(null);
                    showAlert("error", error.message || "No se pudo eliminar la categoría");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UNA CATEGORIA DE PRODUCTO
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado de la categoria",
            message: "¿Seguro que deseas cambiar el estado de esta categoria?",
            onConfirm: async () => {
                try {
                    await ServiceProductCategory.toggleEstado(id);
                    await loadCategories();
                    setConfirmData(null);
                    showAlert("success", "Estado de la categoría actualizado con éxito");
                } catch (error) {
                    console.error(error);
                    setConfirmData(null);
                    showAlert("error", "No se pudo cambiar el estado");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    return {
        data: categories,
        totalPages,
        deleteCategory,
        toggleEstado,
        loadCategories,
        loading
    };
}