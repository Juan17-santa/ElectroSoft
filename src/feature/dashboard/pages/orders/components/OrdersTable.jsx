import { Ban, CircleCheck, Eye } from "lucide-react";
import CancellationInfoTooltip from "../../../components/ui/CancellationInfoTooltip";
import { Restricted } from "../../../components/ui/Restricted";

// COMPONENTE PARA RENDERIZAR LA TABLA DE PEDIDOS
export default function OrdersTable({
    data,
    loading = false,
    onDetails,
    onCancel,
    onProcess,
    currentPage = 1,
    recordsPerPage = 6
}) {

    // FUNCIÓN PARA FORMATEAR FECHA DESDE EL FORMATO ISO DEL BACKEND
    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const fecha = new Date(isoString);
        return fecha.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white ">
            <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">
                <table className="min-w-270 w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 w-14 font-semibold">ID</th>
                            <th className="px-4 py-2 w-52 font-semibold">Nombre cliente</th>
                            <th className="px-4 py-2 w-32 font-semibold">Fecha creación</th>
                            <th className="px-4 py-2 w-28 font-semibold">Total</th>
                            <th className="px-4 py-2 w-32 font-semibold">Fecha vencimiento</th>
                            <th className="px-4 py-2 w-24 font-semibold">Forma Pago</th>
                            <th className="px-4 py-2 w-28 font-semibold text-center">Estado</th>
                            <th className="px-4 py-2 font-semibold w-36 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">

                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    Cargando pedidos...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        ) : (
                            data.map((order, index) => {
                                // FÓRMULA PARA CALCULAR EL ID CONSECUTIVO EN BASE A LA PAGINACIÓN
                                const consecutivo = (currentPage - 1) * recordsPerPage + index + 1;
                                const idFormateado = String(consecutivo).padStart(2, "0");

                                // 🛠️ CORRECCIÓN 1: Unificar nombre completo (Validando si viene plano o separado)
                                const clientName = order.client
                                    ? `${order.client.firstName || order.client.name || ""} ${order.client.lastName || ""}`.trim()
                                    : "Sin nombre";

                                // 🛠️ CORRECCIÓN 2: Obtener la abreviatura del tipo de documento correctamente
                                const docType = order.client?.documentType?.abbreviation || "";

                                // 🛠️ CORRECCIÓN 3: El número de documento vive dentro del objeto 'client'
                                const docNumber = order.client?.documentNumber || order.documentNumber || "";

                                return (
                                    <tr key={order._id} className="border-b border-gray-200">

                                        {/* ID CONSECUTIVO */}
                                        <td className="px-4 py-2">{idFormateado}</td>

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

                                        {/* FECHA CREACION (orderDate) */}
                                        <td className="px-4 py-2">{formatDate(order.orderDate)}</td>

                                        {/* TOTAL */}
                                        <td className="px-4 py-2">${order.total?.toLocaleString() || "0"}</td>

                                        {/* FECHA VENCIMIENTO (dueDate) */}
                                        <td className="px-4 py-2">{formatDate(order.dueDate)}</td>

                                        {/* FORMA PAGO (paymentMethod) */}
                                        <td className="px-4 py-2">{order.paymentMethod || "-"}</td>

                                        {/* ESTADO (status) */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2 justify-center">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full
                                                        ${order.status === "Pendiente"
                                                            ? "bg-yellow-400"
                                                            : "bg-red-500"
                                                        }`}
                                                ></span>
                                                <span>{order.status}</span>
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-2">
                                            <div className="flex justify-center gap-2">

                                                {/* PROCESAR VENTA (DESHABILITADO SI EL PEDIDO ESTÁ ANULADO) */}
                                                <Restricted scope="Pedidos" action="Editar">
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

                                                {/* VER DETALLE */}
                                                <button
                                                    onClick={() => onDetails(order)}
                                                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                    title="Ver detalle"
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>

                                                {/* BOTÓN DE ANULAR O TOOLTIP DE INFO SI YA ESTÁ ANULADO */}
                                                {order.status !== "Anulado" ? (
                                                    <Restricted scope="Pedidos" action="Eliminar">
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