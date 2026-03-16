/**
 * CreditDetailsPage.jsx (CreditDetailsModal)
 * 
 * Vista de detalles del crédito de una venta.
 * Permite ver los abonos realizados, agregar nuevos abonos,
 * eliminar abonos existentes, y generar reporte PDF.
 * 
 * Diseño: Fondo con decoraciones SVG doradas, tarjeta blanca centrada.
 * 
 * Navegación: Se accede desde SalesManagement (icono tarjeta de crédito).
 * Solo disponible para ventas tipo "Crédito" con estado "Vigente".
 * Los datos se leen de localStorage (clave "saleToView").
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Ban, FileText, Info } from "lucide-react";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Alert from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

export default function CreditDetailsPage() {
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [alert, setAlert] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    const [netTotal, setNetTotal] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        try {
            const data = localStorage.getItem("saleToView");
            if (data) {
                const parsed = JSON.parse(data);
                setSale(parsed);

                // Calcular total neto (menos devoluciones)
                const devoluciones = ServicesDevolutions.getByIdVenta(parsed.id) || [];
                const totalRetornado = devoluciones.reduce((sum, d) => {
                    const prodPrice = parsed.productos?.find(p => p.nombre === d.producto)?.precio || 0;
                    return sum + (Number(d.cantidad || 0) * prodPrice);
                }, 0);
                const totalRetornadoConIVA = totalRetornado * 1.19; // Asumiendo IVA 19%
                setNetTotal(parsed.total - totalRetornadoConIVA);
            }
        } catch (error) {
            console.error("Error al cargar detalles del crédito:", error);
            setAlert({ type: "error", message: "Error al cargar los datos del crédito." });
        }
    }, []);

    if (!sale) return null;

    const abonos = sale.abonos || [];

    /**
     * Calcula las filas de la tabla de abonos.
     * Para cada abono, calcula el saldo pendiente acumulado
     * restando cada monto del total de la venta.
     */
    const getPaymentRows = () => {
        if (!sale) return [];
        let saldoPendiente = sale.total || 0;
        const abonosArray = sale.abonos || [];

        const rows = abonosArray.map((abono, index) => {
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
        return [...rows].reverse();
    };

    /** Recarga los datos de la venta desde localStorage después de un cambio */
    const refreshSale = () => {
        try {
            const updatedSale = SalesService.getById(sale?.id);
            if (updatedSale) {
                setSale(updatedSale);
                localStorage.setItem("saleToView", JSON.stringify(updatedSale));

                // Recalcular neto
                const devoluciones = ServicesDevolutions.getByIdVenta(updatedSale.id) || [];
                const totalRetornado = devoluciones.reduce((sum, d) => {
                    const prodPrice = updatedSale.productos?.find(p => p.nombre === d.producto)?.precio || 0;
                    return sum + (Number(d.cantidad || 0) * prodPrice);
                }, 0);
                const totalRetornadoConIVA = totalRetornado * 1.19;
                setNetTotal(updatedSale.total - totalRetornadoConIVA);
            }
        } catch (error) {
            console.error("Error al refrescar venta:", error);
            setAlert({ type: "error", message: "Error al actualizar los datos en tiempo real." });
        }
    };

    /**
     * Agrega un nuevo abono a la venta.
     * Valida que el monto sea > 0 y no exceda el saldo pendiente.
     * Después de agregar, recarga la venta para reflejar los cambios.
     */
    const handleAddPayment = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        try {
            const monto = parseFloat(paymentAmount);
            const saldoRestante = netTotal - (sale?.montoPagado || 0);

            if (!monto || monto <= 0) {
                setPaymentError("El monto debe ser mayor a 0");
                return;
            }
            if (monto > saldoRestante) {
                setPaymentError(`El monto no puede superar el saldo pendiente (${formatCOP(saldoRestante)})`);
                return;
            }

            SalesService.addPayment(sale.id, monto);
            refreshSale();
            setPaymentAmount("");
            setPaymentError("");
            setShowPaymentModal(false);
            setAlert({ type: "success", message: "Abono añadido correctamente." });
        } catch (error) {
            console.error("Error al añadir abono:", error);
            setAlert({ type: "error", message: "No se pudo registrar el abono. Intente de nuevo." });
        }
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setPaymentAmount(val);

        const monto = parseFloat(val);
        const saldoRestante = netTotal - sale.montoPagado;

        if (val === "" || isNaN(monto)) {
            setPaymentError("");
            return;
        }

        if (monto <= 0) {
            setPaymentError("El monto debe ser mayor a 0");
        } else if (monto > saldoRestante) {
            setPaymentError("El monto supera el saldo pendiente");
        } else {
            setPaymentError("");
        }
    };

    const handleRemovePayment = (paymentId) => {
        setConfirmData({
            type: "warning",
            title: "Anular abono",
            message: "¿Está seguro de anular este abono?",
            onConfirm: () => {
                SalesService.voidPayment(sale.id, paymentId);
                refreshSale();
                setConfirmData(null);
            },
            onCancel: () => setConfirmData(null)
        });
    };

    /** Regresa a la lista de ventas y limpia localStorage */
    const handleBack = (e) => {
        if (e) e.preventDefault();
        localStorage.removeItem("saleToView");
        navigate("/dashboard/sales-management");
    };

    /**
     * Genera un reporte PDF con la info del crédito y la tabla de abonos.
     * Se descarga como "credito_[numero].pdf".
     */
    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de este crédito?",
            onConfirm: () => {
                const doc = new jsPDF();

                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text("Detalles del Crédito", 14, 22);

                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(`Cliente: ${sale.cliente || '-'}`, 14, 36);
                doc.text(`Numero de venta: ${String(sale.numeroVenta || "").padStart(2, '0')}`, 14, 44);
                doc.text(`Estado: ${sale.estado}`, 14, 52);
                doc.text(`Monto Total: ${formatCOP(sale.total)}`, 120, 36);
                doc.text(`Monto Neto: ${formatCOP(netTotal)}`, 120, 44);
                doc.text(`Saldo Pendiente: ${formatCOP(Math.max(0, netTotal - sale.montoPagado))}`, 120, 52);

                const rows = getPaymentRows();
                if (rows.length > 0) {
                    autoTable(doc, {
                        startY: 62,
                        head: [["Fecha", "Abono", "Saldo pendiente"]],
                        body: rows.map(r => [
                            r.fecha,
                            formatCOP(r.monto),
                            formatCOP(r.saldoPendiente)
                        ]),
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [234, 179, 8] }
                    });
                }

                doc.save(`credito_${String(sale.numeroVenta || "").padStart(2, '0')}.pdf`);
                setAlert({ type: "success", message: "Reporte generado correctamente." });
                setConfirmData(null);
            },
            onCancel: () => setConfirmData(null)
        });
    };

    const paymentRows = getPaymentRows();

    return (
        <>
            <div
                className="h-full rounded-2xl shadow-lg relative overflow-hidden"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* ALERTA FLOTANTE EN PARTE SUPERIOR */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                <div className="absolute inset-0 bg-white/55 rounded-2xl pointer-events-none"></div>
                {/* ═══ DECORACIONES DORADAS ═══ */}

                {/* Esquina superior izquierda — arcos finos + punta */}
                <svg className="absolute -top-4 -left-4 w-48 h-48 pointer-events-none" viewBox="0 0 200 200" fill="none">
                    <ellipse cx="30" cy="30" rx="100" ry="100" stroke="url(#cGold1)" strokeWidth="3" opacity=".35" />
                    <ellipse cx="30" cy="30" rx="80" ry="80" stroke="url(#cGold1)" strokeWidth="2" opacity=".25" />
                    <ellipse cx="30" cy="30" rx="60" ry="60" stroke="url(#cGold1)" strokeWidth="1.5" opacity=".18" />
                    <path d="M60 5 Q95 15 110 55" stroke="url(#cGold2)" strokeWidth="4" fill="none" opacity=".6" />
                    <path d="M5 60 Q15 95 55 110" stroke="url(#cGold2)" strokeWidth="3" fill="none" opacity=".45" />
                    <defs>
                        <linearGradient id="cGold1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4a843" /><stop offset="100%" stopColor="#f0d68a" /></linearGradient>
                        <linearGradient id="cGold2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c9952c" /><stop offset="50%" stopColor="#e8c34a" /><stop offset="100%" stopColor="#f5e08a" /></linearGradient>
                    </defs>
                </svg>

                {/* Esquina superior derecha */}
                <svg className="absolute -top-6 -right-6 w-52 h-52 pointer-events-none" viewBox="0 0 220 220" fill="none">
                    <circle cx="190" cy="30" r="90" fill="url(#cFill1)" opacity=".12" />
                    <circle cx="190" cy="30" r="70" stroke="url(#cGold3)" strokeWidth="3" opacity=".3" />
                    <circle cx="190" cy="30" r="50" stroke="url(#cGold3)" strokeWidth="2" opacity=".2" />
                    <circle cx="190" cy="30" r="55" fill="url(#cFill2)" opacity=".15" />
                    <circle cx="170" cy="60" r="25" fill="url(#cFill2)" opacity=".25" />
                    <defs>
                        <radialGradient id="cFill1"><stop offset="0%" stopColor="#e8c34a" /><stop offset="100%" stopColor="#d4a843" stopOpacity="0" /></radialGradient>
                        <radialGradient id="cFill2"><stop offset="0%" stopColor="#c9952c" /><stop offset="100%" stopColor="#e8c34a" stopOpacity="0" /></radialGradient>
                        <linearGradient id="cGold3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4a843" /><stop offset="100%" stopColor="#f0d68a" /></linearGradient>
                    </defs>
                </svg>

                {/* Puntos dorados izquierda */}
                <div className="absolute left-5 top-[42%] pointer-events-none">
                    <div className="w-4 h-4 rounded-full mb-2" style={{ background: 'radial-gradient(circle, #d4a843, #c9952c)' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full mb-1.5 ml-3" style={{ background: 'radial-gradient(circle, #e8c34a, #d4a843)' }}></div>
                    <div className="w-3 h-3 rounded-full ml-1" style={{ background: 'radial-gradient(circle, #d4a843, #c9952c)' }}></div>
                </div>

                {/* Esquina inferior izquierda */}
                <svg className="absolute -bottom-4 -left-4 w-48 h-48 pointer-events-none" viewBox="0 0 200 200" fill="none">
                    <ellipse cx="30" cy="170" rx="100" ry="100" stroke="url(#cGold1)" strokeWidth="3" opacity=".3" />
                    <ellipse cx="30" cy="170" rx="80" ry="80" stroke="url(#cGold1)" strokeWidth="2" opacity=".22" />
                    <ellipse cx="30" cy="170" rx="55" ry="55" fill="url(#cFill1)" opacity=".1" />
                    <path d="M5 120 Q25 155 70 175" stroke="url(#cGold2)" strokeWidth="3.5" fill="none" opacity=".5" />
                </svg>

                {/* Esquina inferior derecha */}
                <svg className="absolute -bottom-8 -right-8 w-56 h-56 pointer-events-none" viewBox="0 0 240 240" fill="none">
                    <circle cx="200" cy="200" r="100" fill="url(#cFill3)" opacity=".2" />
                    <circle cx="200" cy="200" r="75" fill="url(#cFill4)" opacity=".18" />
                    <circle cx="200" cy="200" r="80" stroke="url(#cGold3)" strokeWidth="2.5" opacity=".25" />
                    <circle cx="180" cy="180" r="40" fill="url(#cFill4)" opacity=".22" />
                    <defs>
                        <radialGradient id="cFill3"><stop offset="0%" stopColor="#c9952c" /><stop offset="80%" stopColor="#d4a843" /><stop offset="100%" stopColor="#e8c34a" stopOpacity="0" /></radialGradient>
                        <radialGradient id="cFill4"><stop offset="0%" stopColor="#b8860b" /><stop offset="100%" stopColor="#d4a843" stopOpacity="0" /></radialGradient>
                    </defs>
                </svg>

                {/* Línea dorada horizontal */}
                <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '48%' }}>
                    <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent 5%, #d4a843 30%, #e8c34a 50%, #d4a843 70%, transparent 95%)' }}></div>
                </div>

                {/* ═══ CONTENIDO ═══ */}
                <div className="px-10 py-8 relative z-10 flex flex-col h-full overflow-y-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-[22px] font-bold text-gray-800">
                            Detalles del <span className="text-gray-400">Credito</span>
                        </h2>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleGenerateReport(); }}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-white px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer shadow-sm"
                        >
                            <FileText size={16} />
                            Generar reporte
                        </button>
                    </div>

                    {/* Tarjeta info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 pl-6 pr-8 py-6 ml-8 mr-8"
                        style={{ borderLeft: '3px solid #e5e7eb' }}
                    >
                        {/* Nombre cliente */}
                        <p className="text-[17px] font-bold text-gray-800 mb-5">{sale.cliente || 'Sin cliente'}</p>

                        {/* Grid info */}
                        <div className="flex gap-24 mb-6">
                            {/* Columna izquierda */}
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-xs text-gray-400 leading-none mb-1">Numero de venta</p>
                                    <p className="font-bold text-gray-800 text-[15px]">{String(sale.numeroVenta || "").padStart(2, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 leading-none mb-1">Estado</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded-sm rotate-45 ${sale.estado === 'Finalizado' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        <p className="font-bold text-[15px]">{sale.estado}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="flex flex-col gap-2">
                                <div>
                                    <p className="text-xs text-gray-400 leading-none mb-1">Monto Neto (Tras Devoluciones)</p>
                                    <p className="font-bold text-gray-800 text-[17px]">{formatCOP(netTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 leading-none mb-1">Monto Pagado</p>
                                    <p className="font-bold text-gray-800 text-[17px]">{formatCOP(sale.montoPagado)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 leading-none mb-1">Saldo Real Pendiente</p>
                                    <p className="font-bold text-yellow-600 text-[17px]">{formatCOP(Math.max(0, netTotal - sale.montoPagado))}</p>
                                </div>
                            </div>
                        </div>

                        {/* Agregar abono */}
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPaymentModal(true); }}
                            disabled={sale.estado === "Finalizado" || sale.estado === "Anulado" || sale.estado === "Devuelto"}
                            className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700 hover:text-yellow-600 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} className="text-gray-600 bg-gray-100 rounded-full p-0.5" />
                            Agregar abono
                        </button>

                        {/* Tabla de abonos */}
                        {paymentRows.length > 0 ? (
                            <div className="border border-gray-200 rounded-sm overflow-hidden">
                                <table className="w-full text-sm">
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
                                                        {!row.anulado && (
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
                            <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                                No hay abonos registrados
                            </div>
                        )}
                    </div>

                    {/* Volver */}
                    <div className="flex justify-center mt-auto pt-6">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-2 px-8 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer font-medium text-sm border border-gray-200"
                        >
                            <X size={14} />
                            Volver
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal agregar abono */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-scale-in border border-yellow-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 italic">Añadir abono</h3>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPaymentModal(false); setPaymentAmount(""); setPaymentError(""); }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Info de Saldo Pendiente */}
                        <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-yellow-700">
                                <Info size={18} />
                                <span className="text-sm font-semibold uppercase tracking-wider">Saldo Real Pendiente</span>
                            </div>
                            <span className="text-lg font-bold text-gray-800">{formatCOP(netTotal - sale.montoPagado)}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4 bg-gray-50/50 py-2 px-3 rounded-lg border border-gray-100/50">
                            <Plus size={14} className="text-yellow-500" />
                            <span className="text-xs font-medium text-gray-500 italic">
                                Por favor, digite la cantidad que desea abonar a continuación
                            </span>
                        </div>

                        <div className={`relative flex items-center justify-center py-4 px-6 bg-gray-50/50 rounded-xl border-2 transition-all duration-300 ${paymentError
                            ? 'border-red-100 bg-red-50/20'
                            : 'border-dashed border-gray-200 focus-within:border-yellow-300 focus-within:bg-white'
                            }`}>
                            <div className="flex flex-col items-center w-full">
                                <input
                                    type="text"
                                    value={paymentAmount ? formatCOP(parseFloat(paymentAmount.replace(/\./g, ''))).replace('$', '').trim() : ""}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        setPaymentAmount(raw);

                                        const monto = parseFloat(raw);
                                        const saldoRestante = netTotal - sale.montoPagado;

                                        if (raw === "" || isNaN(monto)) {
                                            setPaymentError("");
                                            return;
                                        }

                                        if (monto <= 0) {
                                            setPaymentError("El monto debe ser mayor a 0");
                                        } else if (monto > saldoRestante) {
                                            setPaymentError("El monto supera el saldo pendiente");
                                        } else {
                                            setPaymentError("");
                                        }
                                    }}
                                    placeholder="0"
                                    className={`w-full text-center bg-transparent border-none focus:outline-none font-black text-3xl tracking-tighter ${paymentError ? 'text-red-400' : 'text-gray-900'
                                        }`}
                                />
                            </div>
                        </div>

                        {paymentError && (
                            <p className="text-red-400 text-center text-[11px] mt-2 font-medium">
                                {paymentError}
                            </p>
                        )}

                        <div className="flex gap-3 justify-center mt-8">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPaymentModal(false); setPaymentAmount(""); setPaymentError(""); }}
                                className="px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition cursor-pointer font-semibold text-sm border border-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddPayment}
                                disabled={!!paymentError || !paymentAmount || parseFloat(paymentAmount) <= 0}
                                className="px-8 py-2.5 bg-linear-to-r from-yellow-400 to-yellow-500 text-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
                            >
                                Confirmar Abono
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={confirmData.onCancel}
                />
            )}
        </>
    );
}
