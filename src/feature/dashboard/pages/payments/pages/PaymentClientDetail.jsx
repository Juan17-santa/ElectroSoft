import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, FileDown, Pencil, X, CreditCard } from "lucide-react";
import paymentsService from "../services/paymentsService";
import VentaCreditoCard from "../components/VentaCreditoCard";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { generarReporteCliente, generarReporteClientePDF } from "../hooks/reportesPayments";
import { useToast } from "../../../../../context/ToastContext";
import { Restricted } from "../../../components/ui/Restricted";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

const fmtInput = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

// Monto mínimo de crédito: igual al mínimo de venta a crédito del sistema
const MIN_CUPO = 10_000;

export default function PaymentClientDetail() {
    const navigate = useNavigate();
    const { documento } = useParams();
    const { showToast } = useToast();
    const [resumen, setResumen] = useState(null);
    const [ventas, setVentas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevoCupo, setNuevoCupo] = useState("");
    const [errorCupo, setErrorCupo] = useState("");
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await paymentsService.checkAndExpireOverdue();
            const res = await paymentsService.getResumenCliente(documento);
            const vts = await paymentsService.getVentasCredito(documento);
            setResumen(res);
            setVentas(vts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [documento]);

    useEffect(() => {
        window.addEventListener("payments-updated", cargarDatos);
        return () => window.removeEventListener("payments-updated", cargarDatos);
    }, [documento]);

    const handleAbrirModal = () => {
        if (resumen?.cupoOcupado > 0) {
            showToast("error", `No se puede modificar el cupo hasta que el cliente libere su saldo pendiente (Cupo ocupado: ${fmt(resumen.cupoOcupado)}).`);
            return;
        }
        // Precarga el cupo actual
        setNuevoCupo(resumen?.cupoCredito ? String(resumen.cupoCredito) : "");
        setErrorCupo("");
        setShowModal(true);
    };

    const handleCupoChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setNuevoCupo(raw);
        setErrorCupo("");
    };

    useEffect(() => {
        const monto = Number(nuevoCupo);
        if (resumen?.cupoOcupado > 0) {
            setErrorCupo(`No se puede modificar el cupo hasta liberar el saldo ocupado (${fmt(resumen.cupoOcupado)}).`);
        } else if (nuevoCupo !== "" && monto < MIN_CUPO) {
            setErrorCupo(`El cupo mínimo es ${fmt(MIN_CUPO)}. Un cupo menor no permite realizar ninguna venta a crédito.`);
        } else if (nuevoCupo !== "" && monto < (resumen?.cupoOcupado || 0)) {
            setErrorCupo(`El cupo no puede ser menor al monto ya ocupado (${fmt(resumen.cupoOcupado)}).`);
        } else {
            setErrorCupo("");
        }
    }, [nuevoCupo, resumen]);

    const handleConfirmarCupo = async () => {
        if (resumen?.cupoOcupado > 0) {
            showToast("error", `No se puede modificar el cupo hasta liberar el saldo ocupado (${fmt(resumen.cupoOcupado)}).`);
            return;
        }
        const monto = Number(nuevoCupo);
        if (!monto || monto <= 0) {
            setErrorCupo("Ingresa un monto válido mayor a 0.");
            return;
        }
        if (monto < MIN_CUPO) {
            setErrorCupo(`El cupo mínimo es ${fmt(MIN_CUPO)}. Un cupo de ${fmt(monto)} no permite realizar ninguna venta a crédito.`);
            return;
        }
        if (monto < (resumen?.cupoOcupado || 0)) {
            setErrorCupo(`El cupo no puede ser menor al monto ya ocupado (${fmt(resumen.cupoOcupado)}).`);
            return;
        }
        try {
            await paymentsService.actualizarCupo(resumen.id, monto);
            setShowModal(false);
            showToast("success", "Cupo de crédito actualizado exitosamente.");
            await cargarDatos();
        } catch (error) {
            console.error("Error actualizando cupo:", error);
            const msg = error?.response?.data?.error || error?.message || "Error al actualizar el cupo.";
            setErrorCupo(msg);
            showToast("error", msg);
        }
    };

    if (loading) return (
        <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
            <div className="flex flex-col items-center gap-3 text-yellow-500">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500">Cargando cuenta de crédito...</p>
            </div>
        </div>
    );

    if (!resumen) return (
        <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
            <p className="text-gray-500 text-sm">Cliente no encontrado.</p>
        </div>
    );

    const isSuspendido = resumen.estado === false;
    const porcentaje = resumen.cupoCredito > 0
        ? Math.min((resumen.cupoOcupado / resumen.cupoCredito) * 100, 100)
        : 0;

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <p className="text-xl font-semibold">
                            Cuenta de crédito
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-sm font-medium text-yellow-600 shadow-sm transition cursor-pointer"
                        >
                            <FileDown size={16} />
                            <span className="hidden sm:inline">Descargar estado</span>
                        </button>
                        <button
                            onClick={() => navigate("/dashboard/payments")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>
                </div>

                {/* Card resumen cliente */}
                <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">

                    {/* Fila superior: avatar + datos + estado */}
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0
                        ${isSuspendido ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-500"}`}>
                            {resumen.nombres?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                                {resumen.nombres} {resumen.apellidos}
                            </p>
                            <p className="text-xs text-gray-500">
                                {resumen.tipoDocumento} {resumen.documento} · {resumen.email}
                            </p>
                        </div>
                        {isSuspendido && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-full">
                                <AlertCircle size={13} className="text-red-500" />
                                <span className="text-xs text-red-600 font-semibold">Suspendido</span>
                            </div>
                        )}
                    </div>

                    {/* Fila cupos */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Cupo total — con botón editar */}
                        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
                            <p className="text-xs text-gray-400">Cupo total</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800">{fmt(resumen.cupoCredito)}</p>
                                <Restricted scope="Pagos y abonos" action="editar-cupo">
                                    <button
                                        onClick={handleAbrirModal}
                                        className={`p-1 rounded-lg transition cursor-pointer ${resumen.cupoOcupado > 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                        title={resumen.cupoOcupado > 0 ? `No se puede modificar hasta liberar el cupo ocupado (${fmt(resumen.cupoOcupado)})` : "Editar cupo"}
                                    >
                                        <Pencil size={13} className={resumen.cupoOcupado > 0 ? "text-gray-300" : "text-gray-400 hover:text-yellow-500"} />
                                    </button>
                                </Restricted>
                            </div>
                        </div>
                        <div className="flex-1 bg-orange-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
                            <p className="text-xs text-gray-400">Cupo ocupado</p>
                            <p className="text-sm font-bold text-orange-500">{fmt(resumen.cupoOcupado)}</p>
                        </div>
                        <div className={`flex-1 rounded-xl px-4 py-2.5 flex justify-between items-center ${resumen.cupoDisponible === 0 ? "bg-red-50" : "bg-green-50"
                            }`}>
                            <p className="text-xs text-gray-400">Cupo disponible</p>
                            <p className={`text-sm font-bold ${resumen.cupoDisponible === 0 ? "text-red-500" : "text-green-600"
                                }`}>{fmt(resumen.cupoDisponible)}</p>
                        </div>
                    </div>

                    {/* Barra uso cupo */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Uso del cupo</span>
                            <span>{porcentaje.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isSuspendido ? "bg-red-400" :
                                    porcentaje >= 80 ? "bg-orange-400" :
                                        porcentaje >= 50 ? "bg-yellow-400" :
                                            "bg-green-400"
                                    }`}
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Ventas a crédito */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ventas a crédito pendientes — {ventas.length}
                    </p>

                    {ventas.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-md">
                            Este cliente no tiene ventas a crédito pendientes.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {ventas.map(venta => (
                                <VentaCreditoCard
                                    key={`${venta.fuente}-${venta.id}`}
                                    venta={venta}
                                    onDetalle={() => navigate(
                                        `/dashboard/payments/detail/${venta.id}`,
                                        { state: { payment: venta, documento } }
                                    )}
                                    onAbonar={() => navigate(
                                        `/dashboard/payments/create/${venta.id}`,
                                        { state: { venta, documento } }
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal editar cupo */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5">

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-yellow-500 font-semibold">
                                <CreditCard size={18} />
                                <span>Editar cupo de crédito</span>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                            <span className="text-gray-400">Cliente</span>
                            <span className="font-semibold text-gray-700">
                                {resumen.nombres} {resumen.apellidos}
                            </span>
                        </div>

                        <div className="bg-orange-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                            <span className="text-gray-400">Cupo ocupado actual</span>
                            <span className="font-semibold text-orange-500">{fmt(resumen.cupoOcupado)}</span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Nuevo cupo total *
                            </label>
                            <input
                                type="text"
                                value={nuevoCupo ? fmtInput(Number(nuevoCupo)) : ""}
                                onChange={handleCupoChange}
                                placeholder="Ej: 2.000.000"
                                autoFocus
                                className="bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            {nuevoCupo && !errorCupo && (
                                <p className="text-xs text-gray-400">
                                    Nuevo cupo: <span className="font-semibold text-gray-700">{fmt(Number(nuevoCupo))}</span>
                                </p>
                            )}
                            {errorCupo && (
                                <p className="text-xs text-red-500">{errorCupo}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarCupo}
                                disabled={!nuevoCupo}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Descargar Estado de Cuenta"
                    message="Selecciona el formato en el que deseas descargar el estado de cuenta del cliente."
                    showDateFilter={false}
                    showFormatSelector={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ format }) => {
                        try {
                            if (format === "pdf") {
                                generarReporteClientePDF(resumen, ventas);
                            } else {
                                generarReporteCliente(resumen, ventas);
                            }
                            showToast("success", "Reporte generado correctamente");
                        } catch (error) {
                            showToast("error", "Error al generar el reporte");
                        }
                        setShowReportModal(false);
                    }}
                />
            )}
        </>
    );
}