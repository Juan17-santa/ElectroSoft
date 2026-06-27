import { usersService } from "../services/usersService";

export function useUsersTable({
    setUsers,
    setConfirmData,
    showAlert,
}) {

    const refreshUsers = async () => {
        const response = await usersService.get();
        const mapped = response.map(u => ({
            id: u._id,
            nombre: u.fullName,
            email: u.email,
            telefono: u.phone,
            tipoDoc: u.documentType?._id?.toString() || "",
            tipoDocLabel: u.documentType?.abbreviation || "",
            documento: u.documentNumber,
            rol: u.role?._id?.toString() || "",
            rolLabel: u.role?.name || "",
            estado: u.isActive,
        }));
        setUsers(mapped);
    };

    const deleteUser = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar usuario",
            message: "¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                try {
                    await usersService.delete(id);
                    await refreshUsers();
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

    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del usuario",
            message: "¿Seguro que deseas cambiar el estado de este usuario?",
            onConfirm: async () => {
                try {
                    // ── FIX: el backend devuelve el nuevo isActive,
                    //    actualizamos solo ese usuario en el array local
                    //    sin hacer refetch para evitar el problema de re-render ──
                    const result = await usersService.toggleEstado(id);
                    const nuevoEstado = result.isActive; // ← viene del backend

                    setUsers(prev =>
                        prev.map(u =>
                            u.id === id ? { ...u, estado: nuevoEstado } : u
                        )
                    );
                    setConfirmData(null);
                    showAlert("success", result.message || "Estado actualizado con éxito");
                } catch (error) {
                    console.error(error);
                    showAlert("error", "Error al actualizar estado");
                    setConfirmData(null);
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    return { deleteUser, toggleEstado };
}