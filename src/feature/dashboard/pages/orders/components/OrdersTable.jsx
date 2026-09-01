import { Ban, CircleCheck, Eye, Pencil } from "lucide-react";
import CancellationInfoTooltip from "../../../components/ui/CancellationInfoTooltip";
import { Restricted } from "../../../components/ui/Restricted";

// COMPONENTE PARA RENDERIZAR LA TABLA DE PEDIDOS
export default function OrdersTable({
    data,
    loading = false,
    onDetails,
    onCancel,
    onProcess,
    onEdit,
    currentPage = 1,
    recordsPerPage = 6
}) {

    // FUNCIÓN PARA FORMATEAR FECHA DESDE EL FORMATO ISO DEL BACKEND
    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const [year, month, day] = isoString.split("T")[0].split("-");
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="p-0.5 rounded-2xl bg-yellow-200">
            <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">
                <table className="min-w-full w-full text-sm table-fixed">
                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-3 py-2 w-8 font-semibold">#</th>
                            <th className="px-4 py-2 w-32 font-semibold">Nombre cliente</th>
                            <th className="px-4 py-2 w-40 font-semibold">Creación / Vencimiento</th>
                            <th className="px-4 py-2 w-20 font-semibold">Total</th>
                            <th className="px-4 py-2 w-24 font-semibold">Forma Pago</th>
                            <th className="px-4 py-2 w-28 font-semibold text-center">Estado</th>
                            <th className="px-4 py-2 w-32 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">

                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                        Cargando pedidos...
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        ) : (
                            data.map((order, index) => {
                                // FÓRMULA PARA CALCULAR EL ID CONSECUTIVO EN BASE A LA PAGINACIÓN
                                const consecutivo = (currentPage - 1) * recordsPerPage + index + 1;
                                const idFormateado = String(consecutivo).padStart(2, "0");

                                // NOMBRE DEL CLIENTE (NOMBRES + APELLIDOS)
                                const clientName = order.client
                                    ? `${order.client.firstName || order.client.name || ""} ${order.client.lastName || ""}`.trim()
                                    : "Sin nombre";

                                // TIPO Y NÚMERO DE DOCUMENTO DEL CLIENTE
                                const docType = order.client?.documentType?.abbreviation || "";
                                const docNumber = order.client?.documentNumber || order.documentNumber || "";

                                return (
                                    <tr key={order._id} className="border-b border-gray-200">

                                        {/* ID CONSECUTIVO */}
                                        <td className="px-3 py-2 text-center">{idFormateado}</td>

                                        {/* CLIENTE (NOMBRE Y DOCUMENTO) */}
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium capitalize text-gray-900">
                                                    {clientName}
                                                </span>
                                                <span className="text-xs text-gray-500 mt-0.5">
                                                    {docType} {docNumber}
                                                </span>
                                            </div>
                                        </td>

                                        {/* FECHA CREACIÓN / VENCIMIENTO */}
                                        <td className="px-4 py-2">
                                            <span className="text-gray-700">{formatDate(order.orderDate)}</span>
                                            <span className="text-gray-900 mx-1 font-bold">/</span>
                                            <span className="text-gray-700">{formatDate(order.dueDate)}</span>
                                        </td>

                                        {/* TOTAL */}
                                        <td className="px-4 py-2">${order.total?.toLocaleString() || "0"}</td>

                                        {/* FORMA PAGO */}
                                        <td className="px-4 py-2">{order.paymentMethod || "-"}</td>

                                        {/* ESTADO */}
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.status === "Por procesar"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-red-100 text-red-600"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-2">
                                            <div className="flex justify-center gap-2">

                                                {/* VER DETALLE */}
                                                <Restricted scope="Pedidos" action="Ver">
                                                    <button
                                                        onClick={() => onDetails(order)}
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>
                                                </Restricted>

                                                <Restricted scope="Pedidos" action="Editar">
                                                    <button
                                                        onClick={() => onEdit(order)}
                                                        disabled={order.status === "Anulado"}
                                                        className={`p-2 rounded-lg transition ${order.status === "Anulado" ? "bg-gray-100 cursor-not-allowed" : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"}`}
                                                        title={order.status === "Anulado" ? "No disponible (pedido anulado)" : "Editar pedido"}
                                                    >
                                                        <Pencil size={18} className={order.status === "Anulado" ? "text-gray-400" : "text-yellow-600"} />
                                                    </button>
                                                </Restricted>

                                                {/* PROCESAR VENTA (DESHABILITADO SI EL PEDIDO ESTÁ ANULADO) */}
                                                <Restricted scope="Pedidos" action="procesar">
                                                    <button
                                                        onClick={() => onProcess(order)}
                                                        disabled={order.status === "Anulado"}
                                                        className={`p-2 rounded-lg transition
                                                        ${order.status === "Anulado"
                                                                ? "bg-gray-100 cursor-not-allowed"
                                                                : "bg-green-100 hover:bg-green-200 cursor-pointer"
                                                            }`}
                                                        title={
                                                            order.status === "Anulado"
                                                                ? "No disponible (pedido anulado)"
                                                                : "Procesar venta"
                                                        }
                                                    >
                                                        <CircleCheck
                                                            size={18}
                                                            className={order.status === "Anulado"
                                                                ? "text-gray-400"
                                                                : "text-green-600"}
                                                        />
                                                    </button>
                                                </Restricted>

                                                {/* BOTÓN DE ANULAR O TOOLTIP DE INFO SI YA ESTÁ ANULADO */}
                                                {order.status !== "Anulado" ? (
                                                    <Restricted scope="Pedidos" action="anular">
                                                        <button
                                                            onClick={() => onCancel(order, idFormateado)}
                                                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                            title="Anular pedido"
                                                        >
                                                            <Ban size={18} className="text-red-600" />
                                                        </button>
                                                    </Restricted>
                                                ) : (
                                                    <CancellationInfoTooltip
                                                        cancelInfo={{
                                                            fechaAnulacion: order.canceledAt || order.updatedAt,
                                                            motivo: order.cancelReason || "Sin motivo especificado"
                                                        }}
                                                    />
                                                )}
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