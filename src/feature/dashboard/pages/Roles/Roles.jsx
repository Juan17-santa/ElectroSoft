import { Trash, Pencil, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "./services/RolesService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Restricted } from "../../components/ui/Restricted";
import { useToast } from "../../../../context/ToastContext";

const ITEMS_PER_PAGE = 6;
const PROTECTED_ROLES = ["Administrador", "Empleado", "Super Administrador"];

export default function Roles() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        getRoles();
    }, []);

    const getRoles = async () => {
        try {
            const data = await RolesService.get();
            setRoles(data);
        } catch (error) {
            console.error(error);
            showToast("error", "Error al cargar los roles");
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const filteredRoles = roles.filter(role =>
        role.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        role.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        (role.estado ? "activo" : "inactivo").includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));
    const pageActual = Math.min(currentPage, totalPages);
    const paginatedRoles = filteredRoles.slice(
        (pageActual - 1) * ITEMS_PER_PAGE,
        pageActual * ITEMS_PER_PAGE
    );

    const handleDelete = (role) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar rol",
            message: `¿Estás seguro de que deseas eliminar el rol "${role.nombre}"?`,
            onConfirm: async () => {
                try {
                    await RolesService.delete(role.id);
                    await getRoles();
                    showToast("success", "Rol eliminado correctamente.");
                    setConfirmData(null);
                } catch (error) {
                    const message = error.response?.data?.message || "Error al eliminar el rol";
                    showToast("error", message);
                    setConfirmData(null);
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    const handleToggleEstado = (role) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del rol",
            message: `¿Seguro que deseas ${role.estado ? "desactivar" : "activar"} el rol "${role.nombre}"?`,
            onConfirm: async () => {
                try {
                    await RolesService.toggleEstado(role.id);
                    await getRoles();
                    showToast("success", "Estado actualizado correctamente.");
                    setConfirmData(null);
                } catch (error) {
                    const message = error.response?.data?.message || "Error al cambiar el estado";
                    showToast("error", message);
                    setConfirmData(null);
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    const handleEditNavigation = (role) => {
        navigate("/dashboard/roles/update", { state: { role } });
    };

    const handleViewDetails = (role) => {
        navigate("/dashboard/roles/details", { state: { role } });
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6 w-full h-full">
                <p className="text-xl font-semibold">Control de roles</p>

                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar roles..."
                    onCreateClick={() => navigate("/dashboard/roles/create")}
                    createButtonText="Nuevo Rol"
                    showCreateButton={hasPermission("Roles", "Crear")}
                />

                <div className="p-0.5 rounded-2xl bg-yellow-200">
                    <div className="rounded-2xl border-none overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-3 font-semibold w-16">#</th>
                                    <th className="px-3 py-3 font-semibold w-1/4">Nombre</th>
                                    <th className="px-3 py-3 font-semibold">Descripción</th>
                                    <th className="px-3 py-3 font-semibold w-32 text-center">Estado</th>
                                    <th className="px-3 py-3 font-semibold text-center w-48">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {paginatedRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
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
                                            <td className="px-3 py-3 max-w-xs">
                                                {!role.descripcion ? (
                                                    <span className="text-gray-400 italic">Sin descripción</span>
                                                ) : (
                                                    <span className="text-gray-500 block truncate max-w-55" title={role.descripcion}>
                                                        {role.descripcion}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Restricted scope="Roles" action="Estado">
                                                        <div
                                                            onClick={() => !PROTECTED_ROLES.includes(role.nombre) && handleToggleEstado(role)}
                                                            title={PROTECTED_ROLES.includes(role.nombre) ? "No se puede cambiar el estado de este rol" : "Cambiar estado"}
                                                            className={`w-10 h-6 flex items-center rounded-full p-1 transition
                                                                ${PROTECTED_ROLES.includes(role.nombre)
                                                                    ? "opacity-40 cursor-not-allowed"
                                                                    : "cursor-pointer"
                                                                }
                                                                ${role.estado ? "bg-green-500" : "bg-red-500"}`}
                                                        >
                                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                                ${role.estado ? "translate-x-4" : "translate-x-0"}`}
                                                            />
                                                        </div>
                                                    </Restricted>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-center gap-1.5">

                                                    {/* VER DETALLE — visible para quien tenga roles:ver */}
                                                    <Restricted scope="Roles" action="Ver">
                                                        <button
                                                            onClick={() => handleViewDetails(role)}
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>
                                                    </Restricted>

                                                    {/* EDITAR */}
                                                    <Restricted scope="Roles" action="Editar">
                                                        <button
                                                            onClick={() => handleEditNavigation(role)}
                                                            className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <Pencil size={18} className="text-yellow-600" />
                                                        </button>
                                                    </Restricted>

                                                    <Restricted scope="Roles" action="Eliminar">
                                                        <button
                                                            onClick={() => !PROTECTED_ROLES.includes(role.nombre) && handleDelete(role)}
                                                            disabled={PROTECTED_ROLES.includes(role.nombre)}
                                                            title={PROTECTED_ROLES.includes(role.nombre) ? "No se puede eliminar este rol" : "Eliminar"}
                                                            className={`p-2 rounded-lg transition
                                                                ${PROTECTED_ROLES.includes(role.nombre)
                                                                    ? "bg-gray-100 cursor-not-allowed opacity-40"
                                                                    : "bg-red-100 hover:bg-red-200 cursor-pointer"}`}
                                                        >
                                                            <Trash size={18} className={PROTECTED_ROLES.includes(role.nombre) ? "text-gray-400" : "text-red-500"} />
                                                        </button>
                                                    </Restricted>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {paginatedRoles.length > 0 && (
                    <div className="flex justify-end mt-auto">
                        <Pagination
                            currentPage={pageActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
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
        </>
    );
}