/*
useProductCategoryTable

Hook personalizado encargado de gestionar las acciones interactivas asociadas a la tabla 
de categorías de productos.

Este hook centraliza la lógica relacionada con operaciones como eliminación y cambio de estado,
manteniendo el componente de la tabla completamente libre de lógica de negocio.

Responsabilidades:
✔ Gestionar la lógica de eliminación de categorías
✔ Gestionar la lógica de cambio de estado (activo / inactivo)
✔ Configurar y activar cuadros de confirmación
✔ Actualizar el estado global o local de categorías
✔ Disparar alertas de éxito tras operaciones completadas

Dependencias:
- ServiceProductCategory → Para ejecutar operaciones de eliminación y actualización
- setCategories → Para actualizar la lista renderizada en la tabla
- setConfirmData → Para controlar el modal de confirmación
- showAlert → Para mostrar notificaciones visuales
*/

import { ServiceProductCategory } from "../services/ServicesProductCategory";

// HOOK PERSONALIZADO PARA MANEJAR LAS ACCIONES DE LA TABLA DE CATEGORIAS DE PRODUCTOS
export default function useProductCategoryTable({
    setCategories,
    setConfirmData,
    showAlert,
}) {

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
            oncancel: () => setConfirmData(null),
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
            oncancel: () => setConfirmData(null),
        });
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        deleteCategory,
        toggleEstado,
    };
}