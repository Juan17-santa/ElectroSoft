import { useEffect, useState } from "react";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

export default function useProductCategoryTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // FUNCION ASÍNCRONA PARA CARGAR LAS CATEGORIAS DESDE EL BACKEND
    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await ServiceProductCategory.get();
            setCategories(data);
        } catch (error) {
            console.error(error);
            showAlert("error", "No se pudieron cargar las categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

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

    // FILTRAR LAS CATEGORIAS
    const filteredCategories = categories.filter(cat => {
        const query = searchTerm.toLowerCase();

        let matchesStatus = false;
        if (query === "activo") {
            matchesStatus = cat.status === true;
        } else if (query === "inactivo") {
            matchesStatus = cat.status === false;
        } else {
            matchesStatus = (cat.status ? "activo" : "inactivo").includes(query);
        }

        return (
            cat.name?.toLowerCase().includes(query) ||
            cat.description?.toLowerCase().includes(query) ||
            matchesStatus
        );
    });

    // LOGICA DE PAGINACION
    const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredCategories.slice(firstIndex, lastIndex);

    return {
        data: currentRecords,
        totalPages,
        deleteCategory,
        toggleEstado,
        loadCategories,
        loading
    };
}