import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Ban, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Alert from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";
import paymentsService from "../payments/services/paymentsService";

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

                const devoluciones = ServicesDevolutions.getByIdVenta(parsed.id) || [];
                const totalRetornado = devoluciones.reduce((sum, d) => {
                    const prodPrice = parsed.productos?.find(p => p.nombre === d.producto)?.precio || 0;
                    return sum + (Number(d.cantidad || 0) * prodPrice);
                }, 0);
                const totalRetornadoConIVA = totalRetornado * 1.19;
                setNetTotal(parsed.total - totalRetornadoConIVA);

                // ✅ FIX: Cargar abonos reales desde el backend
                paymentsService.getById(parsed.id).then(ventaEnriquecida => {
                    if (ventaEnriquecida) {
                        setSale(prev => ({
                            ...prev,
                            abonos: ventaEnriquecida.abonos || [],
                            montoPagado: ventaEnriquecida.montoPagado || 0
                        }));
                    }
                }).catch(e => console.error("Error cargando abonos:", e));
            }
        } catch (error) {
            console.error("Error al cargar detalles del crédito:", error);
            setAlert({ type: "error", message: "Error al cargar los datos del crédito." });
        }
    }, []);

    if (!sale) return null;

    const abonos = sale.abonos || [];

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

    const refreshSale = async () => {
        try {
            const updatedSale = await SalesService.getById(sale?.id);
            if (updatedSale) {
                setSale(updatedSale);
                localStorage.setItem("saleToView", JSON.stringify(updatedSale));

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
     * Navega directamente al módulo de Pagos para registrar un abono en esta venta.
     * El módulo de Pagos está conectado al backend real y maneja toda la lógica.
     */
    const handleIrAPagos = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!sale?.id) return;
        // Guardar el documento para que la pantalla de crear abono lo preseleccione
        navigate(
            `/dashboard/payments/create/${sale.id}`,
            { state: { venta: sale, documento: sale.numeroDocumento } }
        );
    };

    /**
     * Navega al historial de abonos de esta venta en el módulo de Pagos.
     */
    const handleVerHistorialAbonos = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!sale?.id) return;
        navigate(
            `/dashboard/payments/detail/${sale.id}`,
            { state: { payment: sale, documento: sale.numeroDocumento } }
        );
    };

    const handleBack = (e) => {
        if (e) e.preventDefault();
        localStorage.removeItem("saleToView");
        navigate("/dashboard/sales-management");
    };

    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Imprimir crédito",
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
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* ALERTA FLOTANTE EN PARTE SUPERIOR */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                {/* ═══ CONTENIDO ═══ */}
                <div className="px-4 md:px-10 py-6 md:py-8 relative z-10 flex flex-col h-full overflow-y-auto bg-gray-100 md:bg-transparent">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
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

                    {/* Tarjeta info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:pl-6 md:pr-8 py-6 mx-0 md:mx-8"
                        style={{ borderLeft: '3px solid #e5e7eb' }}
                    >
                        {/* Nombre cliente */}
                        <p className="text-[17px] font-bold text-gray-800 mb-5">{sale.cliente || 'Sin cliente'}</p>

                        {/* Grid info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-24 mb-6">
                            {/* Columna izquierda */}
                            <div className="flex flex-col gap-4">
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
                            <div className="flex flex-col gap-4">
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

                        {/* Botones de acción — Pagos reales en el módulo de Pagos/Abonos */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                type="button"
                                onClick={handleIrAPagos}
                                disabled={sale.estado === "Finalizado" || sale.estado === "Anulado" || sale.estado === "Devuelto"}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-yellow-600 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} className="text-gray-600 bg-gray-100 rounded-full p-0.5" />
                                Registrar abono
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                type="button"
                                onClick={handleVerHistorialAbonos}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition cursor-pointer"
                            >
                                <ExternalLink size={14} />
                                Ver historial completo
                            </button>
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
                            <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                                No hay abonos registrados
                            </div>
                        )}
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
        </>
    );
}
