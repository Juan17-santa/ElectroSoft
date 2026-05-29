import { Trash, Pencil } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";

export default function ProductCategoryTable({
    data,
    loading =  false,
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
                            <th className="px-4 py-2 font-semibold w-12">ID</th>
                            <th className="px-4 py-2 font-semibold w-56">Nombre</th>
                            <th className="px-4 py-2 font-semibold">Descripción</th>
                            <th className="px-4 py-2 font-semibold w-28">Estado</th>
                            <th className="px-4 py-2 font-semibold text-center w-48">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    Cargando categorías...
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
                                    <tr key={category._id} className="border-b border-gray-300">
                                        <td className="px-4 py-1">{idFormateado}</td>
                                        <td className="px-4 py-1">{category.name}</td>
                                        <td className="px-4 py-1 max-w-md">
                                            {!category.description || category.description.length === 0 ? (
                                                <span className="text-gray-400 italic">Sin descripción</span>
                                            ) : (
                                                category.description
                                            )}
                                        </td>
                                        <td className="px-4 py-1 w-28">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full 
                                                        ${category.status ? "bg-green-500" : "bg-red-500"}`}
                                                ></span>
                                                <span>
                                                    {category.status ? "Activo" : "Inactivo"}
                                                </span>
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

                                                    {/* SWITCH CAMBIAR ESTADO */}
                                                    <div className="flex justify-center items-center gap-2">
                                                        <div
                                                            onClick={() => onToggleEstado(category._id)}
                                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                                ${category.status ? "bg-green-500" : "bg-red-500"}`}
                                                        >
                                                            <div
                                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                                    ${category.status ? "translate-x-4" : "translate-x-0"}`}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </Restricted>

                                                {/* BOTON ELIMINAR */}
                                                <Restricted scope="Categoria de productos" action="Eliminar">
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        onClick={() => onDelete(category._id)}
                                                    >
                                                        <Trash size={18} className="text-red-600" />
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