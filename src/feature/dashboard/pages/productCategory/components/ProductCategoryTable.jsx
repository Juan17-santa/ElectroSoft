import { Trash, Pencil } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

export default function ProductCategoryTable({
    data,
    loading = false,
    onEdit,
    onToggleEstado,
    onDelete,
    currentPage = 1,
    recordsPerPage = 6
}) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">
                <table className="min-w-175 w-full text-sm table-fixed">
                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 font-semibold w-12">#</th>
                            <th className="px-4 py-2 font-semibold w-56">Nombre</th>
                            <th className="px-4 py-2 font-semibold">Descripción</th>
                            <th className="px-4 py-2 font-semibold w-28 text-center">Estado</th>
                            <th className="px-4 py-2 font-semibold text-center w-48">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                        Cargando categorías...
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No se encontraron categorias de productos.
                                </td>
                            </tr>
                        ) : (
                            data.map((category, index) => {
                                // FÓRMULA PARA CALCULAR EL ID CONSECUTIVO EN BASE A LA PAGINACIÓN
                                const consecutivo = (currentPage - 1) * recordsPerPage + index + 1;
                                const idFormateado = String(consecutivo).padStart(2, '0');

                                return (
                                    <tr key={category.id} className="border-b border-gray-300">
                                        <td className="px-4 py-1">{idFormateado}</td>
                                        <td className="px-4 py-1">{category.name}</td>
                                        <td className="px-4 py-1 max-w-md">
                                            {!category.description || category.description.length === 0 ? (
                                                <span className="text-gray-400 italic">Sin descripción</span>
                                            ) : (
                                                category.description
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Restricted scope="Categoria de productos" action="Estado">
                                                    <div
                                                        onClick={() => onToggleEstado(category.id)}
                                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300
                                                        ${category.status ? "bg-green-500" : "bg-red-500"}`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-all duration-300
                                                        ${category.status ? "translate-x-5" : "translate-x-0"}`}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold
                                                    ${category.status ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                        {category.status ? "Activo" : "Inactivo"}
                                                    </span>
                                                </Restricted>
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-1">
                                            <div className="flex justify-center gap-3">
                                                {/* BOTON EDITAR */}
                                                <Restricted scope="Categoria de productos" action="Editar">
                                                    <button
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                        onClick={() => onEdit(category)}
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>


                                                </Restricted>

                                                {/* BOTON ELIMINAR */}
                                                <Restricted scope="Categoria de productos" action="Eliminar">
                                                    <button
                                                        className={`p-2 rounded-lg transition ${category.canDelete
                                                            ? "bg-red-100 hover:bg-red-200"
                                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            }`}
                                                        onClick={() => onDelete(category.id)}
                                                        disabled={!category.canDelete}
                                                        title={
                                                            category.canDelete
                                                                ? "Eliminar categoría"
                                                                : category.deleteReason || "No se puede eliminar esta categoría"
                                                        }
                                                    >
                                                        <Trash
                                                            size={18}
                                                            className={
                                                                category.canDelete
                                                                    ? "text-red-600"
                                                                    : "text-gray-400"
                                                            }
                                                        />
                                                    </button>
                                                </Restricted>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}