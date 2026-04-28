import { Trash, Pencil, Eye } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

export default function UsersTable({
    data,
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
                            <th className="px-3 py-2 font-semibold w-28">Estado</th>
                            <th className="px-3 py-2 font-semibold w-40">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        ) : (
                            data.map((user, index) => (
                                <tr key={user.id} className="border-b border-gray-300">

                                    {/* ID */}
                                    <td className="px-3 py-2">
                                        {index + 1}
                                    </td>

                                    {/* DOCUMENTO */}
                                    <td className="px-3 py-2 truncate">
                                        {user.tipoDoc || "-"}<br />
                                        {user.documento || "-"}
                                    </td>

                                    {/* NOMBRE */}
                                    <td className="px-3 py-2 truncate">
                                        {user.nombre || "-"}
                                    </td>

                                    {/* EMAIL */}
                                    <td className="px-3 py-2 truncate">
                                        {user.email || "-"}
                                    </td>

                                    {/* TELEFONO */}
                                    <td className="px-3 py-2 truncate">
                                        {user.telefono || "-"}
                                    </td>

                                    {/* ROL */}
                                    <td className="px-3 py-2">
                                        {user.rol || "-"}
                                    </td>

                                    {/* ESTADO */}
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full 
                                ${user.estado ? "bg-green-500" : "bg-red-500"}`}
                                            ></span>
                                            <span>
                                                {user.estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="px-1 py-1">
                                        <div className="flex justify-center gap-2">

                                            {/* BOTON DE VER DETALLE */}
                                            <button
                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                onClick={() => onDetails(user)}
                                            >
                                                <Eye size={18} className="text-blue-600" />
                                            </button>

                                            {/* BOTON EDITAR */}
                                            <Restricted scope="Usuarios" action="Editar">
                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => onEdit(user)}
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>
                                            </Restricted>

                                            {/* TOGGLE ESTADO */}
                                            <Restricted scope="Usuarios" action="Editar">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div
                                                        onClick={() => onToggleEstado(user.id)}
                                                        className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                            ${user.estado ? "bg-green-500" : "bg-red-500"}`}
                                                    >
                                                        <div
                                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                                ${user.estado ? "translate-x-4" : "translate-x-0"}`}
                                                        >
                                                        </div>
                                                    </div>
                                                </div>
                                            </Restricted>

                                            {/* BOTON ELIMINAR */}
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