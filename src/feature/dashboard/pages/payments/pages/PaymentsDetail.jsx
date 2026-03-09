import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FileText, X, Plus } from "lucide-react";
import paymentsService from "../services/PaymentsService";

const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

export default function PaymentDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [venta, setVenta] = useState(location.state?.payment || null);

    useEffect(() => {
        const found = paymentsService.getById(id);
        if (found) setVenta(found);
    }, [id]);

    if (!venta) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">No hay información para mostrar.</p>
            </div>
        );
    }

    const esPendiente = venta.estado === true;
    const estadoLabel = esPendiente ? "Pendiente" : "Finalizado";
    const montoPagado = (venta.abonos || []).reduce((acc, a) => acc + Number(a.amount), 0);
    const abonosTable = paymentsService.buildAbonosTable(venta);

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            {/* Card principal con fondo */}
            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* Título */}
                    <div className="flex items-center gap-2">
                        <FileText size={22} />
                        <h2 className="text-xl font-semibold">Detalles del Crédito</h2>
                    </div>

                    {/* Card interior */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">

                        {/* Header: nombre + estado */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">
                                    Información del Crédito
                                </h3>
                                <p className="text-lg font-semibold text-gray-800">{venta.cliente}</p>
                            </div>
                            <div
                                className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md ${
                                    esPendiente
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                }`}
                            >
                                {estadoLabel}
                            </div>
                        </div>

                        {/* Datos del crédito */}
                        <div className="grid grid-cols-2 gap-5 mb-8">
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Número de venta</p>
                                <p className="text-base font-semibold text-gray-800">{venta.numeroVenta}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Monto Total</p>
                                <p className="text-base font-semibold text-gray-800">${fmt(venta.total)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Fecha de venta</p>
                                <p className="text-base font-semibold text-gray-800">{venta.fecha}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Fecha límite</p>
                                <p className="text-base font-semibold text-gray-800">{venta.fechaLimite || "—"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Monto Pagado</p>
                                <p className="text-base font-semibold text-gray-800">${fmt(montoPagado)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Saldo Pendiente</p>
                                <p className={`text-base font-semibold ${esPendiente ? "text-red-500" : "text-green-600"}`}>
                                    ${fmt(venta.saldoPendiente)}
                                </p>
                            </div>
                        </div>

                        {/* Historial de abonos */}
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                            Historial de Abonos
                        </h3>

                        <div className="rounded-xl overflow-hidden border border-gray-100">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Fecha</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Abono</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Saldo pendiente</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonosTable.map((row, i) => {
                                        const isRojo = row.tipo === "inicio" && (venta.abonos || []).length > 0;
                                        const isAzul = row.tipo === "ultimo";
                                        return (
                                            <tr
                                                key={i}
                                                className={`border-t border-gray-50 ${
                                                    isRojo
                                                        ? "text-red-500 font-medium"
                                                        : isAzul
                                                        ? "text-blue-500 font-medium"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <td className="px-5 py-2.5">{row.fecha}</td>
                                                <td className="px-5 py-2.5">
                                                    {row.abono === 0
                                                        ? "0"
                                                        : row.abono < 0
                                                        ? `-${fmt(Math.abs(row.abono))}`
                                                        : `+${fmt(row.abono)}`}
                                                </td>
                                                <td className="px-5 py-2.5">{fmt(row.saldoPendiente)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>

            {/* Botones inferiores */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => navigate("/dashboard/payments")}
                    className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <X size={16} className="inline-block mr-2" />
                    Volver
                </button>
            </div>
        </div>
    );
}