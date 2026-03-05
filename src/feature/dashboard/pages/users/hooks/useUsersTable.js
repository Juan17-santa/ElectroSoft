import { usersService } from "../services/usersService";

export function useUsersTable({
    setUsers,
    setConfirmData,
    showAlert,
}) {

    // ELIMINAR USUARIO
    const deleteUser = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar usuario",
            message: "¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.",
            onConfirm: () => {
                try {
                    const updated = usersService.delete(id);

                    setUsers(updated);
                    setConfirmData(null);

                    showAlert("success", "Usuario eliminado con éxito");
                } catch (error) {
                    console.error(error);
                    showAlert("error", "Error al eliminar usuario");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // CAMBIAR ESTADO
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del usuario",
            message: "¿Seguro que deseas cambiar el estado de este usuario?",
            onConfirm: () => {
                try {
                    const updated = usersService.toggleEstado(id);

                    setUsers(updated);
                    setConfirmData(null);

                    showAlert("success", "Estado actualizado con éxito");
                } catch (error) {
                    console.error(error);
                    showAlert("error", "Error al actualizar estado");
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    return {
        deleteUser,
        toggleEstado,
    };
}