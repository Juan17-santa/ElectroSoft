import { Trash, Pencil, Eye } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

// COMPONENTE QUE MUESTRA LA TABLA DE PROVEEDORES
export default function ProvidersTable({
    data,
    loading = false,
    onDetails,
    onEdit,
    onToggleEstado,
    onDelete,
    currentPage = 1,
    recordsPerPage = 6
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
                            <th className="px-3 py-2 font-semibold w-28 text-center">Estado</th>
                            <th className="px-3 py-2 font-semibold w-48 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                        Cargando proveedores...
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    No se encontraron proveedores.
                                </td>
                            </tr>
                        ) : (
                            data.map((provider, index) => {
                                // FÓRMULA PARA CALCULAR EL ID CONSECUTIVO EN BASE A LA PAGINACIÓN
                                const consecutivo = (currentPage - 1) * recordsPerPage + index + 1;
                                const idFormateado = String(consecutivo).padStart(2, '0');

                                return (
                                    <tr key={provider._id} className="border-b border-gray-300">
                                        <td className="px-3 py-2 ">{idFormateado}</td>
                                        <td className="px-3 py-2 ">
                                            {provider.documentType?.abbreviation}<br />
                                            {provider.document}
                                        </td>
                                        <td className="px-3 py-2">{provider.providerName}</td>
                                        <td className="px-3 py-2">{provider.contactName}</td>
                                        <td className="px-3 py-2">{provider.contactPhone}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <div
                                                    onClick={() => onToggleEstado(provider._id)}
                                                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300
                                                        ${provider.status ? "bg-green-500" : "bg-red-500"}`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-all duration-300
                                                        ${provider.status ? "translate-x-5" : "translate-x-0"}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold
                                                    ${provider.status ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {provider.status ? "Activo" : "Inactivo"}
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
                                                </Restricted>

                                                {/* BOTON ELIMINAR */}
                                                <Restricted scope="Proveedores" action="Eliminar">
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        onClick={() => onDelete(provider._id)}
                                                    >
                                                        <Trash size={18} className="text-red-600" />
                                                    </button>
                                                </Restricted>

                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}