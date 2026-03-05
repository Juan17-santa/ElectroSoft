import { Trash, Pencil, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "./services/RolesService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/Alert";

const ITEMS_PER_PAGE = 6;

export default function Roles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => setAlert({ type, message });

    const filteredRoles = roles.filter(role =>
        role.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));
    const pageActual = Math.min(currentPage, totalPages);
    const paginatedRoles = filteredRoles.slice(
        (pageActual - 1) * ITEMS_PER_PAGE,
        pageActual * ITEMS_PER_PAGE
    );

    useEffect(() => { getRoles(); }, []);

    const getRoles = () => {
        try {
            setRoles(RolesService.get());
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = (role) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar rol",
            message: `¿Estás seguro de que deseas eliminar el rol "${role.nombre}"?`,
            onConfirm: () => {
                const newData = RolesService.delete(role.id);
                setRoles(newData);
                showAlert("success", "Rol eliminado correctamente.");
                setConfirmData(null);
            }
        });
    };

    const handleEditNavigation = (role) => {
        localStorage.setItem("roleToEdit", JSON.stringify(role));
        navigate("/dashboard/roles/update");
    };

    const handleViewDetails = (role) => {
        localStorage.setItem("roleToView", JSON.stringify(role));
        navigate("/dashboard/roles/details");
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Gestión de roles</p>

                {/* BUSCADOR */}
                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar rol..."
                    onCreateClick={() => navigate("/dashboard/roles/create")}
                    createButtonText="Nuevo Rol"
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-white rounded-2xl border-none overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-3 font-semibold w-16">ID</th>
                                    <th className="px-3 py-3 font-semibold w-1/4">Nombre</th>
                                    <th className="px-3 py-3 font-semibold">Descripción</th>
                                    <th className="px-3 py-3 font-semibold w-32">Estado</th>
                                    <th className="px-3 py-3 font-semibold text-center w-48">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {paginatedRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                            No hay roles registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRoles.map((role, index) => (
                                        <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-3 py-3 font-medium text-gray-500">
                                                {String((pageActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                            </td>
                                            <td className="px-3 py-3 font-medium text-gray-800">{role.nombre}</td>
                                            <td className="px-3 py-3 text-gray-500">{role.descripcion}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${role.estado ? "bg-green-500" : "bg-red-500"}`}></span>
                                                    <span className="text-sm text-gray-600 font-medium">{role.estado ? "Activo" : "Inactivo"}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleViewDetails(role)}
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditNavigation(role)}
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(role)}
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        title="Eliminar"
                                                    >
                                                        <Trash size={18} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                <div className="flex justify-end mt-2">
                    <Pagination
                        currentPage={pageActual}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* MODAL DE CONFIRMACION */}
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