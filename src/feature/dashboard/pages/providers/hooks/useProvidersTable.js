import { ServicesProviders } from "../services/ServicesProviders";

export function useProvidersTable({
    setProviders,
    setConfirmData,
    showAlert,
}) {

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

    return {
        deleteProvider,
        toggleEstado,
    };
}