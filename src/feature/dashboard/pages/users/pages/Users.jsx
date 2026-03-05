import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../services/usersService";

import Pagination from "../../../components/ui/Pagination";
import SearchInput from "../../../components/ui/SearchInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/Alert";
import UsersTable from "../components/UsersTable";
import { useUsersTable } from "../hooks/useUsersTable";

export default function Users() {

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

    // FILTRO
    const filteredUsers = users.filter(user => {
        const query = search.toLowerCase();

        return (
            user.nombre?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.rol?.toLowerCase().includes(query) ||
            (user.estado ? "activo" : "inactivo").includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredUsers.slice(firstIndex, lastIndex);

    // NAVEGACIÓN
    // En Users.jsx
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

                <p className="text-xl font-semibold">Gestión de usuarios</p>

                <div className="flex justify-between">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar usuarios..."
                        className="w-4/5"
                    />

                    <PrimaryButton
                        onClick={() => navigate("/dashboard/users/createUser")}
                        icon={Plus}
                    >
                        Crear usuario
                    </PrimaryButton>
                </div>

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