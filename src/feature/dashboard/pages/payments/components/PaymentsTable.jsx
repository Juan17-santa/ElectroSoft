import { Eye } from "lucide-react";

const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

export default function PaymentsTable({ data, onDetails }) {
    return (
        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-4 py-2 w-8 font-semibold">ID</th>
                            <th className="px-4 py-2 w-24 font-semibold">Número</th>
                            <th className="px-4 py-2 w-24 font-semibold">Fecha</th>
                            <th className="px-4 py-2 w-24 font-semibold">Fecha límite</th>
                            <th className="px-4 py-2 w-32 font-semibold">Cliente</th>
                            <th className="px-4 py-2 w-28 font-semibold">Método de pago</th>
                            <th className="px-4 py-2 w-24 font-semibold">Último abono</th>
                            <th className="px-4 py-2 w-28 font-semibold">Saldo pendiente</th>
                            <th className="px-4 py-2 w-28 font-semibold text-center">Estado</th>
                            <th className="px-4 py-2 w-20 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4 text-gray-500">
                                    No se encontraron ventas o pedidos a crédito pendientes.
                                </td>
                            </tr>
                        ) : (
                            data.map((payment, index) => {
                                const abonos = payment.abonos || [];
                                const ultimoAbono = abonos.length > 0
                                    ? abonos[abonos.length - 1]
                                    : null;

                                const isPendiente = payment.estado === "Vigente";
                                const isVencida  = payment.estado === "Anulada"; //   nuevo
                                const esPedido   = payment.fuente === "pedido";

                                return (
                                    <tr
                                        key={payment.id}
                                        className={`border-b border-gray-200 ${
                                            isVencida ? "bg-red-50" : ""  //   fila roja si vencida
                                        }`}
                                    >

                                        {/* ID */}
                                        <td className="px-4 py-2">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        {/* NÚMERO */}
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {payment.numeroVenta || `V-${payment.id}`}
                                                </span>
                                                <span className={`text-xs font-semibold w-fit px-1.5 py-0.5 rounded-full mt-0.5
                                                    ${esPedido
                                                        ? "bg-blue-100 text-blue-600"
                                                        : "bg-yellow-100 text-yellow-600"
                                                    }`}>
                                                    {esPedido ? "Pedido" : "Venta"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* FECHA */}
                                        <td className="px-4 py-2">
                                            {payment.fecha || "—"}
                                        </td>

                                        {/* FECHA LÍMITE — rojo si vencida */}
                                        <td className={`px-4 py-2 ${isVencida ? "text-red-600 font-semibold" : ""}`}>
                                            {payment.fechaLimite || "—"}
                                        </td>

                                        {/* CLIENTE */}
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate">
                                                    {payment.cliente || "Sin nombre"}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {payment.numeroDocumento || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* MÉTODO DE PAGO */}
                                        <td className="px-4 py-2">
                                            {ultimoAbono?.metodoPago || "—"}
                                        </td>

                                        {/* ÚLTIMO ABONO */}
                                        <td className="px-4 py-2">
                                            {ultimoAbono
                                                ? `$${fmt(ultimoAbono.monto)}`
                                                : "—"
                                            }
                                        </td>

                                        {/* SALDO PENDIENTE */}
                                        <td className={`px-4 py-2 font-semibold ${
                                            isVencida ? "text-red-600" : ""
                                        }`}>
                                            ${fmt(payment.montoPorPagar)}
                                        </td>

                                        {/* ESTADO */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                    isVencida   ? "bg-red-500"    :
                                                    isPendiente ? "bg-yellow-400" :
                                                                  "bg-green-500"
                                                }`} />
                                                <span className={
                                                    isVencida ? "text-red-600 font-semibold" : ""
                                                }>
                                                    {isVencida   ? "Vencida"   :
                                                     isPendiente ? "Pendiente" :
                                                                   "Finalizado"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-2">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => onDetails(payment)}
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    title="Ver detalle"
                                                >
                                                    <Eye size={18} className="text-yellow-600" />
                                                </button>
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