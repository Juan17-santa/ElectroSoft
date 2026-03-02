/*
useProviderTable

Hook personalizado encargado de gestionar las acciones interactivas asociadas a la tabla
de proveedores.

Este hook centraliza la lógica relacionada con operaciones como eliminación y cambio de estado,
manteniendo el componente de la tabla completamente libre de lógica de negocio.

Responsabilidades:
✔ Gestionar la lógica de eliminación de proveedores
✔ Gestionar la lógica de cambio de estado (activo / inactivo)
✔ Configurar y activar cuadros de confirmación
✔ Actualizar el estado global o local de proveedores
✔ Disparar alertas de éxito tras operaciones completadas

Dependencias:
- ServicesProviders → Para ejecutar operaciones de eliminación y actualización
- setProviders → Para actualizar la lista renderizada en la tabla
- setConfirmData → Para controlar el modal de confirmación
- showAlert → Para mostrar notificaciones visuales
*/

import { ServicesProviders } from "../services/ServicesProviders";

// HOOK PERSONALIZADO PARA MANEJAR LAS ACCIONES DE LA TABLA DE PROVEEDORES
export default function useProvidersTable({
    setProviders,
    setConfirmData,
    showAlert,
}) {

    // FUNCION PARA ELIMINAR UN PROVEEDOR
    const deleteProvider = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar proveedor",
            message:
                "¿Seguro que deseas eliminar este proveedor? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServicesProviders.delete(id);

                setProviders(updated);
                setConfirmData(null);

                showAlert("success", "Proveedor eliminado con éxito");
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UN PROVEEDOR
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del proveedor",
            message:
                "¿Seguro que deseas cambiar el estado de este proveedor?",
            onConfirm: () => {
                const updated = ServicesProviders.toggleEstado(id);

                setProviders(updated);
                setConfirmData(null);

                showAlert(
                    "success",
                    "Estado del proveedor actualizado con éxito"
                );
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        deleteProvider,
        toggleEstado,
    };
}