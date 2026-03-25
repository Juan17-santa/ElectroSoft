import { useEffect, useState } from "react";
import { ServiceProductCategory } from "../services/ServicesProductCategory";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { ServicesProviders } from "../../providers/services/ServicesProviders";

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
        const categoryToDelete = categories.find(cat => cat.id === id);

        if (!categoryToDelete) {
            showAlert("error", "Categoría no encontrada");
            return;
        }

        // VERIFICAR PRODUCTOS Y PROVEEDORES
        const productosAsociados = ServicesProducts.get().filter(
            p => Number(p.categoriaId) === Number(id)
        );

        const proveedoresAsociados = ServicesProviders.get().some(prov =>
            prov.categoriasAsociadas?.some(catId => String(catId) === String(id))
        );

        // SI HAY PRODUCTOS O PROVEEDORES ASOCIADOS BLOQUEA LA ACCION DE ELIMINAR
        if (productosAsociados.length > 0 || proveedoresAsociados === true) {
            let mensaje = "No se puede eliminar: Esta categoría tiene ";
            if (productosAsociados.length > 0) mensaje += "productos";
            if (productosAsociados.length > 0 && proveedoresAsociados) mensaje += " y ";
            if (proveedoresAsociados) mensaje += "proveedores";
            mensaje += " asociados.";

            showAlert("error", mensaje);
            return;
        }

        setConfirmData({
            type: "delete",
            title: "Eliminar categoría",
            message: "¿Seguro que deseas eliminar esta categoria? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServiceProductCategory.delete(id);
                setCategories(updated);
                setConfirmData(null);
                showAlert("success", "Categoría eliminada con éxito");
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