/*
ProductsTable

Componente reutilizable que renderiza la tabla
de productos dentro del dashboard.

Este componente SOLO maneja la parte visual (UI).
La lógica (obtención de datos, paginación, filtros,
eliminación, navegación, etc.) se recibe desde
el componente padre mediante props.

Responsabilidades:
✔ Renderizar encabezados de la tabla
✔ Mostrar listado de productos
✔ Renderizar mensaje cuando no existen registros en data
✔ Ejecutar acciones enviadas por props (editar, eliminar, ver)
✔ Renderizar botones de acción por fila
✔ Mostrarestad con indicador visual

No contiene lógica de negocio.
No realiza llamadas a servicios.
No maneja estado global.
*/

import { Trash, Pencil, Eye } from "lucide-react";

export default function ProductsTable({
    data,
    loading = false,
    currentPage = 1,
    recordsPerPage = 6,
    onDetails,
    onEdit,
    onToggleEstado,
    onDelete
}) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl overflow-x-auto">

                <table className="min-w-250 w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 w-12">ID</th>
                            <th className="px-4 py-2 w-28">Nombre</th>
                            <th className="px-4 py-2 w-28">Categoría</th>
                            <th className="px-4 py-2 w-28">Precio</th>
                            <th className="px-4 py-2 w-24">Stock</th>
                            <th className="px-4 py-2 w-32">Estado</th>
                            <th className="px-4 py-2 text-center w-40">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    Cargando productos...
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((product, index) => {
                                const consecutivo = (currentPage - 1) * recordsPerPage + index + 1;
                                const idFormateado = String(consecutivo).padStart(2, '0');

                                return (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition">

                                        <td className="px-4 py-2">{idFormateado}</td>

                                        <td className="px-4 py-2 font-medium">{product.nombre}</td>

                                        <td className="px-4 py-2">{product.categoriaName || "Sin categoría"}</td>

                                        <td className="px-4 py-2">${product.precio?.toLocaleString()}</td>

                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span>{product.stock}</span>
                                                <span className="text-xs text-gray-400">
                                                    {product.tipoStock === "metros" ? "MTRS" : "UND"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full ${product.estado ? "bg-green-500" : "bg-red-500"}`}
                                                />
                                                <span className="text-sm">
                                                    {product.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="flex justify-center gap-3 items-center">

                                                <button
                                                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
                                                    onClick={() => onDetails(product)}
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>

                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition"
                                                    onClick={() => onEdit(product)}
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>

                                                <div
                                                    onClick={() => onToggleEstado(product.id)}
                                                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${product.estado ? "bg-green-500" : "bg-red-500"}`}
                                                >
                                                    <div
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${product.estado ? "translate-x-4" : "translate-x-0"}`}
                                                    />
                                                </div>

                                                <button
                                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                                                    onClick={() => onDelete(product.id)}
                                                >
                                                    <Trash size={18} className="text-red-600" />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-400">
                                    No se encontraron productos
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>

            </div>
        </div>
    );
}
