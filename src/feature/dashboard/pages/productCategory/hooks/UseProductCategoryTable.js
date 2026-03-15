import { useEffect, useState } from "react";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

// HOOK PERSONALIZADO PARA GESTIONAR LA LOGICA DE LA TABLA DE CATEGORIAS 
export default function useProductCategoryTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {

    // ESTADO PARA OBTENER LAS CATEGORIAS DE PRODUCTOS
    const [categories, setCategories] = useState([]);

    // FUNCION PARA CARGAR LAS CATEGORIAS 
    const loadCategories = () => {
        const storedCategories = ServiceProductCategory.get();
        setCategories(storedCategories);
    };

    // AL CARGAR EL COMPONENTE CARGAR LAS CATEGORIAS
    useEffect(() => {
        loadCategories();
    }, []);

    // FUNCION PARA ELIMINAR UNA CATEGORIA DE PRODUCTO
    const deleteCategory = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar categoría de producto",
            message: "¿Seguro que deseas eliminar esta categoría de producto? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServiceProductCategory.delete(id);

                setCategories(updated);
                setConfirmData(null);

                showAlert("success", "Categoría de producto eliminada con éxito");
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
            onConfirm: () => {
                const updated = ServiceProductCategory.toggleEstado(id);

                setCategories(updated);
                setConfirmData(null);

                showAlert(
                    "success",
                    "Estado de la categoria actualizada con exito"
                );
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FILTRAR LAS CATEGORIAS
    const filteredCategories = categories.filter(cat => {
        const query = searchTerm.toLowerCase();

        return (
            cat.nombre?.toLowerCase().includes(query) ||
            cat.descripcion?.toLowerCase().includes(query) ||
            (cat.estado ? "activo" : "inactivo").includes(query)
        );
    });

    // LOGICA DE PAGINACION
    const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredCategories.slice(firstIndex, lastIndex);

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: currentRecords,
        totalPages,
        deleteCategory,
        toggleEstado,
        loadCategories
    };
}