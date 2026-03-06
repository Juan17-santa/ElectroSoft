/*
OrdersTable

Componente reutilizable que renderiza la tabla
de pedidos dentro del dashboard.

Este componente SOLO maneja la parte visual (UI).
La lógica (obtención de datos, búsqueda, navegación,
etc.) se recibe desde el componente padre mediante props.

Responsabilidades:
✔ Renderizar encabezados
✔ Mostrar listado de pedidos
✔ Mostrar mensaje cuando no existen registros
✔ Ejecutar acción de ver detalle

No contiene lógica de negocio.
No realiza llamadas a servicios.
No maneja estado.
*/

import { Ban, CircleCheck, Eye } from "lucide-react";

export default function OrdersTable({
    data,
    onDetails
}) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white ">
            <div className="bg-gray-100 rounded-2xl overflow-hidden">

                <table className="w-full text-sm table-fixed">

                    {/* ================= HEADER ================= */}
                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 w-16 font-semibold">ID</th>
                            <th className="px-4 py-2 w-60 font-semibold">Nombre cliente</th>
                            <th className="px-4 py-2 font-semibold">Fecha creación</th>
                            <th className="px-4 py-2 font-semibold">Total</th>
                            <th className="px-4 py-2 font-semibold">Fecha vencimiento</th>
                            <th className="px-4 py-2 font-semibold w-24">Forma Pago</th>
                            <th className="px-4 py-2 font-semibold text-center">Estado</th>
                            <th className="px-4 py-2 font-semibold w-36 text-center">Acciones</th>
                        </tr>
                    </thead>

                    {/* ================= BODY ================= */}
                    <tbody className="bg-white text-gray-700">

                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        ) : (
                            data.map((order, index) => (
                                <tr key={order.id} className="border-b border-gray-200">

                                    {/* ID */}
                                    <td className="px-4 py-2">
                                        {index + 1}
                                    </td>

                                    {/* CLIENTE */}
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {order.nombreCliente || "Sin nombre"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order.tipoDocumento || ""} {order.documento}
                                            </span>
                                        </div>
                                    </td>

                                    {/* FECHA CREACION */}
                                    <td className="px-4 py-2">
                                        {order.fechaCreacion
                                            ? new Date(order.fechaCreacion).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    {/* TOTAL */}
                                    <td className="px-4 py-2">
                                        ${order.total?.toLocaleString() || "0"}
                                    </td>

                                    {/* FECHA VENCIMIENTO */}
                                    <td className="px-4 py-2">
                                        {order.fechaVencimiento
                                            ? new Date(order.fechaVencimiento).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    {/* TIPO PAGO */}
                                    <td className="px-4 py-2">
                                        {order.formaPago || "-"}
                                    </td>

                                    {/* ESTADO */}
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full
                                                ${order.estado === "Pendiente"
                                                            ? "bg-yellow-400"
                                                            : "bg-red-500"
                                                    }`}
                                            ></span>
                                            <span>{order.estado}</span>
                                        </div>
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center gap-2">

                                            {/* PROCESAR VENTA */}
                                            <button
                                                // onClick={() => onProcess(order)}
                                                className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition cursor-pointer"
                                            >
                                                <CircleCheck size={18} className="text-green-600" />
                                            </button>

                                            {/* VER DETALLE */}
                                            <button
                                                onClick={() => onDetails(order)}
                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                            >
                                                <Eye size={18} className="text-blue-600" />
                                            </button>

                                            {/* ANULAR PEDIDO */}
                                            <button
                                                // onClick={() => onCancel(order)}
                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                            >
                                                <Ban size={18} className="text-red-600" />
                                            </button>

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