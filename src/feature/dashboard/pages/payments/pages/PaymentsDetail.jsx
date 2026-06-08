import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FileText, ArrowLeft, FileDown, Trash2 } from "lucide-react";
import paymentsService from "../services/paymentsService";
import { generarReporteVenta } from "../hooks/reportesPayments";

const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

export default function PaymentDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [venta, setVenta] = useState(location.state?.payment || null);

    useEffect(() => {
        const fetchSale = async () => {
            const found = await paymentsService.getById(id);
            if (found) setVenta(found);
        };
        fetchSale();
    }, [id]);

    if (!venta) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">No hay información para mostrar.</p>
            </div>
        );
    }

    const esPendiente = venta.estado === "Vigente";
    const isVencida = venta.estado === "Anulada";
    const estadoLabel = isVencida ? "Vencida" : esPendiente ? "Pendiente" : "Finalizado";
    const montoPagado = (venta.abonos || [])
        .filter(a => !a.anulado)
        .reduce((acc, a) => acc + Number(a.monto), 0);
    const abonosTable = paymentsService.buildAbonosTable(venta);

    // Handler anular último abono
    const handleAnularAbono = async () => {
        const resultado = await paymentsService.anularUltimoAbono(venta.id);
        if (resultado) setVenta(resultado);
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">

            <div
                className="relative bg-white rounded-3xl p-4 md:p-8 shadow-lg"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* Título + botón reporte */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText size={22} />
                            <h2 className="text-xl font-semibold">Detalles del Crédito</h2>
                        </div>
                        <button
                            onClick={() => generarReporteVenta(venta, abonosTable)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-sm font-medium text-yellow-600 shadow-sm transition cursor-pointer"
                        >
                            <FileDown size={16} />
                            <span className="hidden sm:inline">Descargar detalle</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-4 md:p-8 shadow-xl max-w-4xl w-full mx-auto">

                        {/* Header: nombre + estado */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">
                                    Información del Crédito
                                </h3>
                                <p className="text-lg font-semibold text-gray-800">{venta.cliente}</p>
                            </div>
                            <div className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md ${isVencida ? "bg-red-100 text-red-700" :
                                esPendiente ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                                }`}>
                                {estadoLabel}
                            </div>
                        </div>

                        {/* Aviso vencida */}
                        {isVencida && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6">
                                <span className="text-red-500 text-lg">⚠</span>
                                <div>
                                    <p className="text-red-600 font-semibold text-sm">Esta venta está vencida</p>
                                    <p className="text-red-500 text-xs mt-0.5">
                                        El crédito del cliente ha sido suspendido. Para reactivarlo
                                        debe pagar el total exacto de{" "}
                                        <span className="font-bold">${fmt(venta.montoPorPagar)}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Datos del crédito */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-8">
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Número de venta</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {venta.numeroVenta || `V-${venta.id}`}
                                </p>
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
                                <p className={`text-base font-semibold ${isVencida ? "text-red-600" : "text-gray-800"}`}>
                                    {venta.fechaLimite || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Monto Pagado</p>
                                <p className="text-base font-semibold text-gray-800">${fmt(montoPagado)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Saldo Pendiente</p>
                                <p className={`text-base font-semibold ${isVencida ? "text-red-600" :
                                    esPendiente ? "text-red-500" :
                                        "text-green-600"
                                    }`}>
                                    ${fmt(venta.montoPorPagar)}
                                </p>
                            </div>
                        </div>

                        {/* Historial de abonos */}
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                            Historial de Abonos
                        </h3>

                        <div className="rounded-xl overflow-x-auto border border-gray-100">
                            <table className="min-w-xl w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Fecha</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Método</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Abono</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Saldo pendiente</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonosTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-gray-400 italic text-sm">
                                                Sin abonos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        abonosTable.map((row, i) => {
                                            const isInicio = row.tipo === "inicio";
                                            const isAnulado = row.tipo === "anulado";
                                            const isAzul = row.tipo === "ultimo";
                                            const isRojo = row.tipo === "inicio" && (venta.abonos || []).length > 0;

                                            return (
                                                <tr
                                                    key={i}
                                                    className={`border-t border-gray-50 ${isAnulado ? "opacity-50 line-through text-gray-400" :
                                                        isRojo ? "text-red-500 font-medium" :
                                                            isAzul ? "text-blue-500 font-medium" :
                                                                "text-gray-600"
                                                        }`}
                                                >
                                                    <td className="px-5 py-2.5">{row.fecha}</td>
                                                    <td className="px-5 py-2.5 text-gray-400 text-xs">
                                                        {row.metodoPago || "—"}
                                                    </td>
                                                    <td className="px-5 py-2.5">
                                                        {row.abono === 0 ? "0"
                                                            : row.abono < 0 ? `-${fmt(Math.abs(row.abono))}`
                                                                : `+${fmt(row.abono)}`}
                                                    </td>
                                                    <td className="px-5 py-2.5">{fmt(row.saldoPendiente)}</td>
                                                    <td className="px-5 py-2.5">
                                                        {/* ✅ Solo en el último abono real y no anulado */}
                                                        {row.esUltimoReal && !isAnulado && !isInicio && (
                                                            <button
                                                                onClick={handleAnularAbono}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-medium transition cursor-pointer"
                                                            >
                                                                <Trash2 size={12} />
                                                                Anular
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón volver */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>
            </div>
        </div>
    );
}