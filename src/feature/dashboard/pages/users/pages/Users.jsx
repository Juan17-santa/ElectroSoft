import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../services/usersService";

import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/Alert";
import UsersTable from "../components/UsersTable";
import { useUsersTable } from "../hooks/useUsersTable";
import SearchBar from "../../../components/ui/Searchbar";
import { usePermissions } from "../../../../../hooks/usePermissions";

export default function Users() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    const showAlert = (type, message) => setAlert({ type, message });

    useEffect(() => { getUsers(); }, []);

    const getUsers = async () => {
        try {
            setLoading(true);
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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setCurrentPage(1); }, [search]);

    const filteredUsers = users.filter(user => {
        const query = search.toLowerCase().trim();
        if (!query) return true;

        // ── FIX 1: comparar estado con palabra exacta para evitar que
        //    "activo" también traiga "inactivo" ──────────────────────
        const estadoTexto = user.estado ? "activo" : "inactivo";
        const estadoMatch = estadoTexto === query;

        return (
            user.nombre?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.rolLabel?.toLowerCase().includes(query) ||
            user.documento?.toString().includes(query) ||
            user.telefono?.toString().includes(query) ||
            user.tipoDocLabel?.toLowerCase().includes(query) ||
            estadoMatch
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredUsers.slice(firstIndex, lastIndex);

    const handleEditNavigation = (user) => {
        navigate(`/dashboard/users/${user.id}/update`, { state: { user } });
    };

    const handleDetailsNavigation = (user) => {
        navigate(`/dashboard/users/${user.id}`, { state: { user } });
    };

    const { deleteUser, toggleEstado } = useUsersTable({
        setUsers,
        setConfirmData,
        showAlert,
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                <p className="text-xl font-semibold">Control de usuarios</p>

                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario ..."
                    onCreateClick={() => navigate("/dashboard/users/create")}
                    createButtonText="Nuevo usuario"
                    showCreateButton={hasPermission("Usuarios", "Crear")}
                />

                <UsersTable
                    data={currentRecords}
                    loading={loading}
                    startIndex={firstIndex}
                    onDetails={handleDetailsNavigation}
                    onEdit={handleEditNavigation}
                    onDelete={deleteUser}
                    onToggleEstado={toggleEstado}
                />

                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}
        </>
    );
}