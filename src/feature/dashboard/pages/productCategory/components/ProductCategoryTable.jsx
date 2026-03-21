import { Trash, Pencil } from "lucide-react";

// COMPONENTE QUE MUESTRA LA TABLA DE CATGEORIAS DE PRODUCTOS
export default function ProductCategoryTable({
    data,
    onEdit,
    onToggleEstado,
    onDelete
}) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">

                <table className="w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 font-semibold w-12">ID</th>
                            <th className="px-4 py-2 font-semibold w-56">Nombre</th>
                            <th className="px-4 py-2 font-semibold">Descripción</th>
                            <th className="px-4 py-2 font-semibold w-28">Estado</th>
                            <th className="px-4 py-2 font-semibold text-center w-48">Acciones</th>
                        </tr>
                    </thead>

                    {/* SI NO HAY CATEGORIAS SE MJUESTRA UN MENSAJE */}
                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No se encontraron categorias de productos.
                                </td>
                            </tr>
                        ) : (
                            data.map((category, index) => (
                                <tr key={category.id} className="border-b border-gray-300">
                                    <td className="px-4 py-1">{index + 1}</td>
                                    <td className="px-4 py-1">{category.nombre}</td>
                                    <td className="px-4 py-1 max-w-md">
                                        {category.descripcion.length === 0 ? (
                                            <span className="text-gray-400 italic">Sin descripción</span>
                                        ) : (category.descripcion)
                                        }
                                    </td>
                                    <td className="px-4 py-1 w-28">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full 
                                                    ${category.estado ? "bg-green-500" : "bg-red-500"}`}
                                            ></span>
                                            <span>
                                                {category.estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="px-4 py-1">
                                        <div className="flex justify-center gap-3">

                                            {/* BOTON EDITAR */}
                                            <button
                                                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                onClick={() => onEdit(category)}
                                            >
                                                <Pencil size={18} className="text-yellow-600" />
                                            </button>

                                            {/* SWITCH CAMBIAR ESTADO */}
                                            <div className="flex justify-center items-center gap-2">
                                                <div
                                                    onClick={() => onToggleEstado(category.id)}
                                                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                        ${category.estado ? "bg-green-500" : "bg-red-500"}`}
                                                >
                                                    <div
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                            ${category.estado ? "translate-x-4" : "translate-x-0"}`}
                                                    >
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BOTON ELIMINAR */}
                                            <button
                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                onClick={() => onDelete(category.id)}
                                            >
                                                <Trash size={18} className="text-red-600" />
                                            </button>

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
