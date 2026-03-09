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
                            <th className="px-4 py-2 w-20 font-semibold">Numero venta</th>
                            <th className="px-4 py-2 w-20 font-semibold">Fecha</th>
                            <th className="px-4 py-2 w-20 font-semibold">Fecha limite</th>
                            <th className="px-4 py-2 w-30 font-semibold">Cliente</th>
                            <th className="px-4 py-2 w-25 font-semibold">Metodo de pago</th>
                            <th className="px-4 py-2 w-22 font-semibold">Monto</th>
                            <th className="px-4 py-2 w-28 font-semibold">Saldo pendiente</th>
                            <th className="px-4 py-2 w-28 font-semibold text-center">Estado</th>
                            <th className="px-4 py-2 w-20 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4 text-gray-500">
                                    No se encontraron ventas a crédito pendientes.
                                </td>
                            </tr>
                        ) : (
                            data.map((payment, index) => {
                                const abonos = payment.abonos || [];
                                const ultimoAbono = abonos.length > 0 ? abonos[abonos.length - 1] : null;
                                const isPendiente = payment.estado === "Vigente";

                                return (
                                    <tr key={payment.id} className="border-b border-gray-200">

                                        <td className="px-4 py-2">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        <td className="px-4 py-2">
                                            {payment.numeroVenta || `V-${payment.id}`}
                                        </td>

                                        <td className="px-4 py-2">
                                            {payment.fecha || "—"}
                                        </td>

                                        <td className="px-4 py-2">
                                            {payment.fechaLimite || "—"}
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {payment.cliente || "Sin nombre"}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {/* ✅ numeroDocumento (SalesService) */}
                                                    C.C {payment.numeroDocumento}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ✅ metodoPago en vez de paymentMethod */}
                                        <td className="px-4 py-2">
                                            {ultimoAbono?.metodoPago || "—"}
                                        </td>

                                        {/* ✅ monto en vez de amount */}
                                        <td className="px-4 py-2">
                                            {ultimoAbono ? `$${fmt(ultimoAbono.monto)}` : "—"}
                                        </td>

                                        {/* ✅ montoPorPagar en vez de saldoPendiente */}
                                        <td className="px-4 py-2">
                                            ${fmt(payment.montoPorPagar)}
                                        </td>

                                        {/* ✅ estado es string "Vigente"/"Finalizado" */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                    isPendiente ? "bg-yellow-400" : "bg-green-500"
                                                }`} />
                                                <span>{isPendiente ? "Pendiente" : "Finalizado"}</span>
                                            </div>
                                        </td>

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