import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FileText, ArrowLeft, FileDown, Ban, Loader2 } from "lucide-react";
import paymentsService from "../services/paymentsService";
import { generarReporteVenta } from "../hooks/reportesPayments";
import ConfirmModal from "../../../components/ui/ConfirmModal";

const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

export default function PaymentDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [venta, setVenta] = useState(location.state?.payment || null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        const fetchSale = async () => {
            const found = await paymentsService.getById(id);
            if (found) setVenta(found);
        };
        fetchSale();
    }, [id]);

    if (!venta) {
        return (
            <div className="p-6 flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    const isAnulada = venta.estado === "Anulado" || venta.estado === "Anulada";
    const saldoPendiente = Number(venta.montoPorPagar) || 0;
    const esPendiente = !isAnulada && saldoPendiente > 0;
    const estadoLabel = isAnulada
        ? "Anulada"
        : esPendiente
            ? "Vigente"
            : "Finalizado";

    const montoPagado = (venta.abonos || [])
        .filter(a => !a.anulado)
        .reduce((acc, a) => acc + Number(a.monto), 0);

    const abonosTable = paymentsService.buildAbonosTable(venta);

    const handleAnularAbono = () => {
        setConfirmData({
            type: "delete",
            title: "Anular abono",
            message:
                "¿Estás seguro de anular el último abono? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                setConfirmData(null);
                setIsCanceling(true);

                try {
                    const resultado =
                        await paymentsService.anularUltimoAbono(venta.id);

                    if (resultado) setVenta(resultado);
                } catch (error) {
                    console.error("Error al anular abono:", error);
                } finally {
                    setIsCanceling(false);
                }
            },
            onCancel: () => setConfirmData(null)
        });
    };

    return (
        <div className="w-full p-6">
            <div className="max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-6">

                    {/* Título + botón reporte */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FileText size={22} />
                            <h2 className="text-xl font-semibold">
                                Detalles del Crédito
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() =>
                                    generarReporteVenta(
                                        venta,
                                        abonosTable
                                    )
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                            >
                                <FileDown size={16} />
                                <span className="hidden sm:inline">
                                    Descargar detalle
                                </span>
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </button>
                        </div>
                    </div>

                    {/* Información del crédito */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-8 max-w-4xl w-full mx-auto shadow-sm">

                        {/* Header: nombre + estado */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">
                                    Información del Crédito
                                </h3>
                                <p className="text-lg font-semibold text-gray-800">
                                    {venta.cliente}
                                </p>
                            </div>

                            <div
                                className={`px-5 py-2 rounded-full text-sm font-semibold ${isAnulada
                                    ? "bg-red-100 text-red-700"
                                    : esPendiente
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {estadoLabel}
                            </div>
                        </div>

                        {/* Aviso venta anulada */}
                        {isAnulada && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6">
                                <span className="text-red-500 text-lg">
                                    ⚠
                                </span>
                                <div>
                                    <p className="text-red-600 font-semibold text-sm">
                                        Esta venta está anulada
                                    </p>
                                    <p className="text-red-500 text-xs mt-0.5">
                                        La venta fue anulada y no acepta
                                        nuevos abonos. El saldo mostrado es
                                        informativo.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Datos del crédito */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-8">
                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Número de venta
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                    {venta.numeroVenta || `V-${venta.id}`}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Monto Total
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                    ${fmt(venta.total)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Fecha de venta
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                    {venta.fecha}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Fecha límite
                                </p>
                                <p
                                    className={`text-base font-semibold ${isAnulada
                                        ? "text-red-600"
                                        : "text-gray-800"
                                        }`}
                                >
                                    {venta.fechaLimite || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Tipo de venta
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                    {venta.tipoVenta || "Crédito"}
                                </p>
                            </div>

                            {(venta.tipoVenta === "Mixto" ||
                                venta.formaPago === "Mixto") && (
                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">
                                            Pago Inicial (Contado)
                                        </p>
                                        <p className="text-base font-semibold text-gray-800">
                                            ${fmt(venta.montoContado || 0)}
                                        </p>
                                    </div>
                                )}

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Monto Pagado
                                </p>
                                <p className="text-base font-semibold text-gray-800">
                                    ${fmt(montoPagado)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">
                                    Saldo Pendiente
                                </p>
                                <p
                                    className={`text-base font-semibold ${isAnulada
                                        ? "text-red-600"
                                        : esPendiente
                                            ? "text-red-500"
                                            : "text-green-600"
                                        }`}
                                >
                                    ${fmt(venta.montoPorPagar)}
                                </p>
                            </div>

                        </div>

                        {/* Historial de abonos */}
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                            Historial de Abonos
                        </h3>

                        <div className="border border-gray-200 rounded-sm overflow-x-auto">
                            <table className="min-w-150 w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">
                                            Fecha
                                        </th>

                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">
                                            Método
                                        </th>

                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">
                                            Abono
                                        </th>

                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">
                                            Saldo pendiente
                                        </th>

                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonosTable.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-6 text-gray-400 italic text-sm"
                                            >
                                                Sin abonos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        abonosTable.map((row, i) => {
                                            const isInicio =
                                                row.tipo === "inicio";
                                            const isAnulado =
                                                row.tipo === "anulado";
                                            return (
                                                <tr
                                                    key={i}
                                                    className={`border-t border-gray-50 ${isAnulado
                                                        ? "opacity-50 line-through text-gray-400"
                                                        : "text-gray-600"
                                                        }`}
                                                >
                                                    <td className="px-5 py-2.5">
                                                        {row.fecha}
                                                    </td>

                                                    <td className="px-5 py-2.5 text-gray-400 text-xs">
                                                        {row.metodoPago ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-5 py-2.5">
                                                        {row.abono === 0
                                                            ? "0"
                                                            : row.abono < 0
                                                                ? `-${fmt(
                                                                    Math.abs(
                                                                        row.abono
                                                                    )
                                                                )}`
                                                                : `+${fmt(
                                                                    row.abono
                                                                )}`}
                                                    </td>

                                                    <td className="px-4 py-2.5">
                                                        {fmt(
                                                            row.saldoPendiente
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-2.5">
                                                        {row.esUltimoReal &&
                                                            !isAnulado &&
                                                            !isInicio && (
                                                                <button
                                                                    onClick={
                                                                        handleAnularAbono
                                                                    }
                                                                    disabled={
                                                                        isCanceling
                                                                    }
                                                                    title="Anular abono"
                                                                    className="flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs transition cursor-pointer disabled:opacity-50"
                                                                >
                                                                    {isCanceling ? (
                                                                        <Loader2
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <Ban
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )}
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

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={confirmData.onCancel}
                />
            )}
        </div>
    );
}