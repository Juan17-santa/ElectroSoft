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

    // ESTADOS
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    // ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // CARGAR USUARIOS
    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = () => {
        try {
            const response = usersService.get();
            setUsers(response);
        } catch (error) {
            console.error(error);
        }
    };

    // RESETEAR PÁGINA AL BUSCAR
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // FILTRO
    const tipoDocLabel = {
        CC: "c.c",
        CE: "c.e",
        NIT: "nit",
        Pasaporte: "pasaporte",
    };

    const filteredUsers = users.filter(user => {
        const query = search.toLowerCase().trim();
        if (!query) return true;

        return (
            user.nombre?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.rol?.toLowerCase().includes(query) ||
            user.documento?.toString().includes(query) ||
            user.telefono?.toString().includes(query) ||
            (tipoDocLabel[user.tipoDoc] || user.tipoDoc?.toLowerCase() || "").includes(query) ||
            (user.estado ? "activo" : "inactivo").includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredUsers.slice(firstIndex, lastIndex);

    // NAVEGACIÓN
    const handleEditNavigation = (user) => {
        navigate(`/dashboard/users/${user.id}/update`, {
            state: { user },
        });
    };

    const handleDetailsNavigation = (user) => {
        navigate(`/dashboard/users/${user.id}`, {
            state: { user },
        });
    };

    // HOOK
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

            {/* MODAL */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {/* ALERTA */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}