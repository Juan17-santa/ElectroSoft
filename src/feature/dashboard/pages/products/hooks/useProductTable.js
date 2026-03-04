/*
useProductTable

Hook personalizado encargado de gestionar las acciones interactivas asociadas a la tabla 
de productos.

Este hook centraliza la lógica relacionada con operaciones como eliminación y cambio de estado,
manteniendo el componente de la tabla completamente libre de lógica de negocio.

Responsabilidades:
✔ Gestionar la lógica de eliminación de productos
✔ Gestionar la lógica de cambio de estado (activo / inactivo)
✔ Configurar y activar cuadros de confirmación
✔ Actualizar el estado global o local de productos
✔ Disparar alertas de éxito tras operaciones completadas

Dependencias:
- ServicesProducts → Para ejecutar operaciones de eliminación y actualización
- setProducts → Para actualizar la lista renderizada en la tabla
- setConfirmData → Para controlar el modal de confirmación
- showAlert → Para mostrar notificaciones visuales
*/

import { ServicesProducts } from "../services/ServicesProducts";

// HOOK PERSONALIZADO PARA MANEJAR LAS ACCIONES DE LA TABLA DE PRODUCTOS
export default function useProductTable({
    setProducts,
    setConfirmData,
    showAlert,
}) {

    // FUNCION PARA ELIMINAR UN PRODUCTO
    const deleteProduct = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar producto",
            message: "¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServicesProducts.delete(id);

                setProducts(updated);
                setConfirmData(null);

                showAlert("success", "Producto eliminado con éxito");
            },
            oncancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UN PRODUCTO
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del producto",
            message: "¿Seguro que deseas cambiar el estado de este producto?",
            onConfirm: () => {
                const updated = ServicesProducts.toggleEstado(id);

                setProducts(updated);
                setConfirmData(null);

                showAlert(
                    "success",
                    "Estado del producto actualizado con éxito"
                );
            },
            oncancel: () => setConfirmData(null),
        });
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        deleteProduct,
        toggleEstado,
    };
}
