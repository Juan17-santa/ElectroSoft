import { Eye } from "lucide-react";

export default function PaymentsTable({
    data,
    onDetails,
}) {
    return (

        <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
            <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">

                <table className="w-full text-sm table-fixed">

                    <thead className="bg-gray-200">
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-3 py-2 font-semibold w-12">ID</th>
                            <th className="px-3 py-2 font-semibold w-32">Número Venta</th>
                            <th className="px-3 py-2 font-semibold w-32">Fecha</th>
                            <th className="px-3 py-2 font-semibold w-32">Fecha Límite</th>
                            <th className="px-3 py-2 font-semibold w-40">Cliente</th>
                            <th className="px-3 py-2 font-semibold w-28">Total</th>
                            <th className="px-3 py-2 font-semibold w-28">Saldo Pendiente</th>
                            <th className="px-3 py-2 font-semibold w-28">Estado</th>
                            <th className="px-3 py-2 font-semibold w-24 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4 text-gray-500">
                                    No se encontraron ventas.
                                </td>
                            </tr>
                        ) : (
                            data.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-300">

                                    <td className="px-3 py-2">
                                        {payment.id}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {payment.numeroVenta || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {payment.fecha || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {payment.fechaLimite || "-"}
                                    </td>

                                    <td className="px-3 py-2 truncate">
                                        {payment.cliente || "-"}
                                    </td>

                                    <td className="px-3 py-2">
                                        ${payment.total?.toLocaleString() || "0"}
                                    </td>

                                    <td className="px-3 py-2">
                                        ${payment.saldoPendiente?.toLocaleString() || "0"}
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full 
                                                ${payment.estado ? "bg-yellow-500" : "bg-green-500"}`}
                                            ></span>
                                            <span>
                                                {payment.estado ? "Pendiente" : "Finalizado"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-3 py-2 text-center">
                                        <button
                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                            onClick={() => onDetails(payment)}
                                        >
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
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