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
                            <th className="px-4 py-2 w-12">#</th>
                            <th className="px-4 py-2 w-40">Nombre</th>
                            <th className="px-4 py-2 w-36">Categoría</th>
                            <th className="px-4 py-2 w-24">Precio</th>
                            <th className="px-4 py-2 w-20">Stock</th>
                            <th className="px-4 py-2 w-16 text-center">Estado</th>
                            <th className="px-4 py-2 text-center w-40">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                        Cargando productos...
                                    </div>
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
                                            <div className="flex flex-col items-center gap-1">
                                                <div
                                                    onClick={() => onToggleEstado(product.id)}
                                                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300
                                                        ${product.estado ? "bg-green-500" : "bg-red-500"}`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-all duration-300
                                                        ${product.estado ? "translate-x-5" : "translate-x-0"}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold
                                                    ${product.estado ? "text-green-600" : "text-red-600"}`}
                                                >
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

                                                <button
                                                    className={`p-2 rounded-lg transition ${product.canDelete ? "bg-red-100 hover:bg-red-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                                    onClick={() => onDelete(product.id)}
                                                    disabled={!product.canDelete}
                                                    title={product.canDelete ? "Eliminar producto" : "No se puede eliminar un producto con ventas o pedidos asociados"}
                                                >
                                                    <Trash size={18} className={`${product.canDelete ? "text-red-600" : "text-gray-400"}`} />
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
