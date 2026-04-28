import { Trash, Pencil, Eye } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

// COMPONENTE QUE MUESTRA LA TABLA DE PROVEEDORES
export default function ProvidersTable({
    data,
    onDetails,
    onEdit,
    onToggleEstado,
    onDelete,
}) {
    return (

        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">

                <table className="w-full text-sm">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-3 py-2 font-semibold w-12">ID</th>
                            <th className="px-3 py-2 font-semibold w-28">Documento</th>
                            <th className="px-3 py-2 font-semibold w-56">Nombre proveedor</th>
                            <th className="px-3 py-2 font-semibold w-48">Nombre contacto</th>
                            <th className="px-3 py-2 font-semibold w-32">Telefono contacto</th>
                            <th className="px-3 py-2 font-semibold w-28">Estado</th>
                            <th className="px-3 py-2 font-semibold w-48 text-center">Acciones</th>
                        </tr>
                    </thead>

                    {/* SI NO HAY PROVEEDORES SE MUESTRA UN MENSAJE */}
                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    No se encontraron proveedores.
                                </td>
                            </tr>
                        ) : (
                            data.map((provider, index) => (
                                <tr key={provider.id} className="border-b border-gray-300">
                                    <td className="px-3 py-2 ">{index + 1}</td>
                                    <td
                                        className="px-3 py-2 "
                                    >
                                        {provider.tipoDoc}<br />
                                        {provider.documento}
                                    </td>
                                    <td className="px-3 py-2">{provider.nombreProveedor}</td>
                                    <td className="px-3 py-2">{provider.nombreContacto}</td>
                                    <td className="px-3 py-2">{provider.telefonoContacto}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full 
                                                    ${provider.estado === true ? "bg-green-500" : "bg-red-500"}`}
                                            ></span>
                                            <span>
                                                {provider.estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="px-1 py-1">
                                        <div className="flex justify-center gap-2">

                                            {/* BOTON DE VER DETALLE */}
                                            <button
                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                onClick={() => onDetails(provider)}
                                            >
                                                <Eye size={18} className="text-blue-600" />
                                            </button>

                                            {/* BOTON EDITAR */}
                                            <Restricted scope="Proveedores" action="Editar">
                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => onEdit(provider)}
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>

                                                {/* SWITCH CAMBIAR ESTADO */}
                                                <div className="flex justify-center items-center gap-2">
                                                    <div
                                                        onClick={() => onToggleEstado(provider.id)}
                                                        className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                            ${provider.estado ? "bg-green-500" : "bg-red-500"}`}
                                                    >
                                                        <div
                                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                                ${provider.estado ? "translate-x-4" : "translate-x-0"}`}
                                                        >
                                                        </div>
                                                    </div>
                                                </div>
                                            </Restricted>

                                            {/* BOTON ELIMINAR */}
                                            <Restricted scope="Proveedores" action="Eliminar">
                                                <button
                                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                    onClick={() => onDelete(provider.id)}
                                                >
                                                    <Trash size={18} className="text-red-600" />
                                                </button>
                                            </Restricted>

                                        </div>
                                    </td>
                                </tr>
                            )
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}