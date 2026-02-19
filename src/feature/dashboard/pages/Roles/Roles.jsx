import { Trash, Pencil, Plus, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "./services/RolesService";

export default function Roles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");

    const filteredRoles = roles.filter(role =>
        role.nombre.toLowerCase().includes(search.toLowerCase())
    );

    // PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const PresentRecords = filteredRoles.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredRoles.length / recordsPerPage);

    const nextPage = () => {
        if (presentPage < totalPages) setPresentPage(presentPage + 1);
    };

    const prevPage = () => {
        if (presentPage > 1) setPresentPage(presentPage - 1);
    };

    useEffect(() => {
        getRoles();
    }, [])

    const getRoles = () => {
        try {
            const response = RolesService.get();
            setRoles(response)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("¿Esta seguro de eliminar rol?");
        if (!confirmDelete) return;
        const newData = RolesService.delete(id);
        setRoles(newData);
        alert("Rol eliminado correctamente");
    };

    const handleEditNavigation = (role) => {
        localStorage.setItem("roleToEdit", JSON.stringify(role));
        navigate("/dashboard/roles/update");
    };

    const handleViewDetails = (role) => {
        localStorage.setItem("roleToView", JSON.stringify(role));
        navigate("/dashboard/roles/details");
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (presentPage > 3) pages.push("...");
            for (let i = Math.max(2, presentPage - 1); i <= Math.min(totalPages - 1, presentPage + 1); i++) {
                pages.push(i);
            }
            if (presentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
            {/* TITULO */}
            <p className="text-xl font-semibold">Gestión de roles</p>

            {/* BUSCADOR Y BOTON CREAR */}
            <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 bg-white">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar Rol..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none text-md placeholder-gray-400 bg-transparent"
                        />
                    </div>
                </div>
                <button
                    onClick={() => navigate("/dashboard/roles/create")}
                    className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md hover:shadow-lg transition h-fit"
                >
                    <Plus size={18} />
                    Nuevo Rol
                </button>
            </div>

            {/* TABLA ESTILO SALES MANAGEMENT */}
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
                            {PresentRecords.map((role, index) => (
                                <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-3 py-3 font-medium text-gray-500">
                                        {(firstIndex + index + 1).toString().padStart(2, '0')}
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
                                            {/* VER DETALLES */}
                                            <button
                                                onClick={() => handleViewDetails(role)}
                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} className="text-blue-600" />
                                            </button>

                                            {/* EDITAR */}
                                            <button
                                                onClick={() => handleEditNavigation(role)}
                                                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                title="Editar"
                                            >
                                                <Pencil size={18} className="text-yellow-600" />
                                            </button>

                                            {/* ELIMINAR */}
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash size={18} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINADOR */}
            <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">
                    <button
                        onClick={prevPage}
                        className="p-2 rounded-lg hover:bg-gray-300 transition"
                        disabled={presentPage === 1}
                    >
                        ←
                    </button>

                    {getPageNumbers().map((page, i) => (
                        page === "..." ? (
                            <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => setPresentPage(page)}
                                className={`px-3 py-1 rounded-md transition
                                    ${presentPage === page
                                        ? "bg-yellow-400 text-black font-medium shadow-sm"
                                        : "hover:bg-gray-300"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}

                    <button
                        onClick={nextPage}
                        className="p-2 rounded-lg hover:bg-gray-300 transition"
                        disabled={presentPage === totalPages || totalPages === 0}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    )
}