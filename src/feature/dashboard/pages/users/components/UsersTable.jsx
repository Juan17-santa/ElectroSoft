import { Trash, Pencil, Eye } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

export default function UsersTable({
    data = [],
    loading = false,
    startIndex = 0, // ← índice base recibido desde Users.jsx
    onDetails,
    onEdit,
    onToggleEstado,
    onDelete,
}) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">

                <table className="min-w-230 w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-3 py-2 font-semibold w-12">ID</th>
                            <th className="px-3 py-2 font-semibold w-28">Documento</th>
                            <th className="px-3 py-2 font-semibold w-44">Nombre</th>
                            <th className="px-3 py-2 font-semibold w-44">Email</th>
                            <th className="px-3 py-2 font-semibold w-32">Teléfono</th>
                            <th className="px-3 py-2 font-semibold w-22">Rol</th>
                            <th className="px-3 py-2 font-semibold w-28 text-center">Estado</th>
                            <th className="px-3 py-2 font-semibold w-40 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">

                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4 text-yellow-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />
                                        </svg>
                                        Cargando usuarios...
                                    </div>
                                </td>
                            </tr>

                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    No se encontraron usuarios.
                                </td>
                            </tr>

                        ) : (
                            data.map((user, index) => (
                                <tr key={user.id} className="border-b border-gray-300">

                                    <td className="px-3 py-2">
                                        {startIndex + index + 1} {/* ← número continuo entre páginas */}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {user.tipoDocLabel || "-"} <br />
                                        {user.documento || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {user.nombre || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {user.email || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {user.telefono || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {user.rolLabel || "-"}
                                    </td>

                                    <td className="px-3 py-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <div
                                                    onClick={() => onToggleEstado(user.id)}
                                                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300
                                                        ${user.estado ? "bg-green-500" : "bg-red-500"}`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-all duration-300
                                                        ${user.estado ? "translate-x-5" : "translate-x-0"}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold
                                                    ${user.estado ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {user.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </td>

                                    <td className="px-1 py-1">
                                        <div className="flex justify-center gap-2">

                                            <button
                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                onClick={() => onDetails(user)}
                                            >
                                                <Eye size={18} className="text-blue-600" />
                                            </button>

                                            <Restricted scope="Usuarios" action="Editar">
                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => onEdit(user)}
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>
                                            </Restricted>

                                        
                                            <Restricted scope="Usuarios" action="Eliminar">
                                                <button
                                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                    onClick={() => onDelete(user.id)}
                                                >
                                                    <Trash size={18} className="text-red-600" />
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
    );
}