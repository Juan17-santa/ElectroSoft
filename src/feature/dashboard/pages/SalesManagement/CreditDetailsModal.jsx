import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Ban, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { generatePDFReport } from "../../../../utils/PDFReportGenerator";
import ConfirmModal from "../../components/ui/ConfirmModal";
import paymentsService from "../payments/services/paymentsService";
import { useToast } from "../../../../context/ToastContext";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

export default function CreditDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const [sale, setSale] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [netTotal, setNetTotal] = useState(0);
    const [isNavigatingToPayment, setIsNavigatingToPayment] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        try {
            if (id) {
                SalesService.getById(id).then(parsed => {
                    if (!parsed) return;
                    setSale(parsed);

                    ServicesDevolutions.getBySaleId(parsed.id).then(devoluciones => {
                    const devolucionesValidas = devoluciones.filter(
                        (d) => d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA",
                    );
                    const reembolsos = devolucionesValidas
                        .filter((d) => d.estadoResolucion === "RESUELTO")
                        .reduce((sum, d) => sum + (Number(d.montoReembolso) || 0), 0);
                    setNetTotal(parsed.total - reembolsos);
                    }).catch(e => console.error("Error al cargar devoluciones:", e));

                    paymentsService.getById(parsed.id).then(ventaEnriquecida => {
                    if (ventaEnriquecida) {
                        setSale(prev => ({
                            ...prev,
                            abonos: ventaEnriquecida.abonos || [],
                            montoPagado: ventaEnriquecida.montoPagado || 0,
                            montoPorPagar: ventaEnriquecida.montoPorPagar ?? prev.montoPorPagar,
                            estado: ventaEnriquecida.estado || prev.estado
                        }));
                    }
                    }).catch(e => console.error("Error cargando abonos:", e));
                }).catch(e => console.error("Error al cargar la venta:", e));
            }
        } catch (error) {
            console.error("Error al cargar detalles del crédito:", error);
            showToast("error", "Error al cargar los datos del crédito.");
        }
    }, [id, showToast]);

    if (!sale) return null;

    const getPaymentRows = () => {
        if (!sale) return [];
        let saldoPendiente = sale.total || 0;

        const abonosCronologicos = [...(sale.abonos || [])].sort((a, b) => {
            const valA = a.timestamp || a.id;
            const valB = b.timestamp || b.id;
            if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB);
            return valA - valB;
        });

        const rows = abonosCronologicos.map((abono, index) => {
            if (!abono.anulado) {
                saldoPendiente = saldoPendiente - (abono.monto || 0);
            }
            return {
                ...abono,
                index,
                id: abono.id || index,
                saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0
            };
        });

        const reversedRows = rows.reverse();

        let foundUltimoValido = false;
        return reversedRows.map(row => {
            let esUltimoActivo = false;
            if (!row.anulado && !foundUltimoValido) {
                esUltimoActivo = true;
                foundUltimoValido = true;
            }
            return { ...row, esUltimoActivo };
        });
    };

    const refreshSale = async () => {
        try {
            const updatedSale = await SalesService.getById(sale?.id);
            if (updatedSale) {
                setSale(updatedSale);
                ServicesDevolutions.getBySaleId(updatedSale.id).then(devoluciones => {
                    const devolucionesValidas = devoluciones.filter(
                        (d) => d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA",
                    );
                    const reembolsos = devolucionesValidas
                        .filter((d) => d.estadoResolucion === "RESUELTO")
                        .reduce((sum, d) => sum + (Number(d.montoReembolso) || 0), 0);
                    setNetTotal(updatedSale.total - reembolsos);
                }).catch(e => console.error("Error al refrescar devoluciones:", e));
            }
        } catch (error) {
            console.error("Error al refrescar venta:", error);
            showToast("error", "Error al actualizar los datos en tiempo real.");
        }
    };

    const handleIrAPagos = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!sale?.id || isNavigatingToPayment) return;
        setIsNavigatingToPayment(true);
        navigate(
            `/dashboard/payments/create/${sale.id}`,
            { state: { venta: sale, documento: sale.documentoNumero } }
        );
    };

    const handleVerHistorialAbonos = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!sale?.id) return;
        navigate(
            `/dashboard/payments/detail/${sale.id}`,
            { state: { payment: sale, documento: sale.numeroDocumento } }
        );
    };

    const handleRemovePayment = (paymentId) => {
        setConfirmData({
            type: "delete",
            title: "Anular abono",
            message: "¿Estás seguro de anular este abono? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                setConfirmData(null);
                try {
                    await paymentsService.anularAbono(paymentId);
                    showToast("success", "Abono anulado exitosamente.");
                    refreshSale();
                } catch (error) {
                    console.error("Error al anular abono:", error);
                    showToast("error", "Error al anular el abono.");
                }
            },
            onCancel: () => setConfirmData(null)
        });
    };

    const handleBack = (e) => {
        if (e) e.preventDefault();
        navigate("/dashboard/sales-management");
    };

    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Imprimir crédito",
            message: "¿Deseas descargar el reporte de este crédito?",
            onConfirm: () => {
                const rows = getPaymentRows();

                generatePDFReport({
                    title: `Detalles del Crédito #${String(sale.numeroVenta || "").padStart(2, '0')}`,
                    fileName: `credito_${String(sale.numeroVenta || "").padStart(2, '0')}.pdf`,
                    columns: ["Fecha", "Abono", "Saldo Pendiente"],
                    data: rows.map(r => [
                        r.fecha,
                        formatCOP(r.monto),
                        formatCOP(r.saldoPendiente)
                    ]),
                    extraInfo: [
                        `Cliente: ${sale.cliente || '-'}`,
                        `Documento: ${sale.numeroDocumento || 'No registrado'}`,
                        `Estado: ${sale.estado}`
                    ],
                    emptyMessage: "Aún no se han registrado abonos a este crédito.",
                    totals: [
                        `Monto Total: ${formatCOP(sale.total)}`,
                        `Monto Neto: ${formatCOP(netTotal)}`,
                        `Saldo Real Pendiente: ${formatCOP(sale.montoPorPagar ?? Math.max(0, netTotal - sale.montoPagado))}`
                    ]
                });

                showToast("success", "Reporte generado correctamente.");
                setConfirmData(null);
            },
            onCancel: () => setConfirmData(null)
        });
    };

    const paymentRows = getPaymentRows();

    return (
        <div className="flex flex-col gap-6 w-full h-full overflow-y-auto items-center">
            <div
                className="w-full p-6 md:p-8 flex flex-col gap-6 relative animate-scale-in"
            >
                {/* ═══ CONTENIDO ═══ */}
                <div className="relative z-10 flex flex-col h-full">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <h2 className="text-[22px] font-bold text-gray-800">
                            Detalles del credito
                        </h2>
                        <div className="flex w-full md:w-auto items-center gap-4">
                            <button
                                onClick={(e) => { e.preventDefault(); handleGenerateReport(); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                            >
                                <FileText size={16} />
                                Imprimir
                            </button>
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </button>
                        </div>
                    </div>

                    {/* INFORMACIÓN DEL CRÉDITO */}
                    <div className="p-6">

                        {/* ID DE VENTA*/}
                        <div className="pb-5 border-b border-gray-300">
                            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-500 mb-1">
                                Número de venta
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                                #{String(sale.numeroVenta || "").padStart(2, "0")}
                            </p>
                        </div>

                        {/* CLIENTE + ESTADO*/}
                        <div className="grid grid-cols-1 md:grid-cols-2">

                            {/* CLIENTE */}
                            <div className="py-5 md:pr-8">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                    Cliente
                                </p>
                                <p className="text-[15px] font-bold text-gray-800">
                                    {sale.cliente || "Sin cliente"}
                                </p>
                            </div>

                            {/* ESTADO */}
                            <div className="py-5 md:pl-8">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                    Estado
                                </p>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold
                                            ${sale.estado === "Finalizado"
                                                ? "bg-green-100 text-green-700"
                                                : sale.estado === "Anulado"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {sale.estado}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MONTOS */}
                        <div className="border-t border-gray-300 border-b">
                            <div className="grid grid-cols-1 md:grid-cols-3">

                                {/* MONTO NETO */}
                                <div className="py-5 md:pr-8">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                        Monto Neto
                                    </p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatCOP(netTotal)}
                                    </p>
                                </div>

                                {/* MONTO PAGADO */}
                                <div className="py-5 md:px-8">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                        Monto Pagado
                                    </p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatCOP(sale.montoPagado)}
                                    </p>
                                </div>

                                {/* SALDO PENDIENTE */}
                                <div className="py-5 md:pl-8">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                        Saldo Real Pendiente
                                    </p>
                                    <p className="text-lg font-bold text-yellow-600">
                                        {formatCOP(sale.montoPorPagar ??
                                            Math.max(0, netTotal - sale.montoPagado)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="flex flex-wrap items-center gap-3 pt-5">
                            <button
                                type="button"
                                onClick={handleIrAPagos}
                                disabled={
                                    isNavigatingToPayment ||
                                    sale.estado === "Finalizado" ||
                                    sale.estado === "Anulado" ||
                                    sale.estado === "ANULADA"
                                }
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-yellow-600 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus
                                    size={18}
                                    className={`text-gray-600 bg-gray-100 rounded-full p-0.5 ${isNavigatingToPayment ? "animate-spin" : ""}`}
                                />
                                {isNavigatingToPayment ? "Abriendo abonos..." : "Registrar abono"}
                            </button>

                            <span className="text-gray-300">
                                |
                            </span>

                            <button
                                type="button"
                                onClick={handleVerHistorialAbonos}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition cursor-pointer"
                            >
                                <ExternalLink size={14} />
                                Ver historial completo
                            </button>
                        </div>
                    </div>

                    {/* Tabla de abonos */}
                    {paymentRows.length > 0 ? (
                        <div className="border border-gray-200 rounded-sm overflow-auto">
                            <table className="min-w-150 w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">Fecha</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">Abono</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-800">Saldo pendiente</th>
                                        <th className="px-4 py-2.5 text-center font-semibold w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentRows.map((row, index) => {
                                        const isPositive = row.monto > 0;
                                        return (
                                            <tr key={index} className={`border-b border-gray-100 last:border-b-0 ${row.anulado ? 'opacity-60 bg-red-50' : ''}`}>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`${row.anulado ? 'text-red-500' : (isPositive && index > 0 ? 'text-yellow-600' : 'text-gray-700')} text-sm`}>
                                                            {row.fecha.split(' ')[0]}
                                                        </span>
                                                        {row.fecha.split(' ')[1] && (
                                                            <span className={`text-sm italic font-medium ${row.anulado ? 'text-red-400' : 'text-blue-500'}`}>
                                                                {row.fecha.split(' ')[1]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 font-semibold text-base ${row.anulado ? 'text-red-500 line-through' : (isPositive && index > 0 ? 'text-green-600' : 'text-gray-700')}`}>
                                                    {isPositive ? '+' : ''}{formatCOP(row.monto)}
                                                </td>
                                                <td className={`px-4 py-3 text-base ${row.anulado ? 'text-red-500 line-through' : (isPositive && index > 0 ? 'text-yellow-600 font-semibold' : 'text-gray-700')}`}>{formatCOP(row.saldoPendiente)}</td>
                                                <td className="px-4 py-2.5 text-center">
                                                    {!row.anulado && row.esUltimoActivo && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); handleRemovePayment(row.id); }}
                                                            className="text-red-400 hover:text-red-600 transition cursor-pointer"
                                                            title="Anular abono"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                            No hay abonos registrados
                        </div>
                    )}
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
