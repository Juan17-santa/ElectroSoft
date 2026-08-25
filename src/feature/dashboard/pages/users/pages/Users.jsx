import { useEffect, useState } from "react";
import { usersService } from "../services/usersService";

import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import UsersTable from "../components/UsersTable";
import { useUsersTable } from "../hooks/useUsersTable";
import SearchBar from "../../../components/ui/Searchbar";
import CreateUser from "./CreateUser";
import UpdateUser from "./UpdateUser";
import UserDetail from "./UserDetail";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { useToast } from "../../../../../context/ToastContext";

export default function Users() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToView, setUserToView] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

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
                avatar: u.avatar,
                avatarLetter: u.avatarLetter,
                avatarColor: u.avatarColor,
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
        setUserToEdit(user);
    };

    const handleDetailsNavigation = (user) => {
        setUserToView(user);
    };

    const { deleteUser, toggleEstado } = useUsersTable({
        setUsers,
        setConfirmData,
        showAlert: showToast,
    });

    return (
        <>
            <div className="bg-white p-6 flex flex-col gap-6 w-full h-full">
                <p className="text-xl font-semibold">Control de usuarios</p>

                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario ..."
                    onCreateClick={() => setIsCreateModalOpen(true)}
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

            <CreateUser
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    getUsers();
                    setCurrentPage(1);
                }}
            />

            <UpdateUser
                isOpen={!!userToEdit}
                onClose={() => setUserToEdit(null)}
                onSuccess={getUsers}
                userToEdit={userToEdit}
            />

            <UserDetail
                isOpen={!!userToView}
                onClose={() => setUserToView(null)}
                user={userToView}
            />
        </>
    );
}