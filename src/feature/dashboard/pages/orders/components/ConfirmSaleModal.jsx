import { useState, useEffect } from "react";
import { X, CheckCircle2, Info, User, FileText, CreditCard, BadgeCheck } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";

// COMPONENTE PRINCIPAL DE LA MODAL DE CONFIRMACIÓN
export default function ConfirmSaleModal({ isOpen, onClose, order, onConfirm }) {
    const [diasPlazo, setDiasPlazo] = useState("");

    useEffect(() => {
        if (isOpen) setDiasPlazo("");
    }, [isOpen]);

    // VALIDACIÓN DE APERTURA Y EXISTENCIA DE DATOS
    if (!isOpen || !order) return null;

    // DETERMINACIÓN DEL ESTADO SEGÚN LA FORMA DE PAGO
    const estadoFinal = order.formaPago === "Contado" ? "Finalizado" : "Vigente";

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* CARD */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-lg font-semibold">
                                Confirmar <span className="text-yellow-400">venta</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                Revise los detalles antes de procesar la facturación
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* CUERPO DE LA MODAL */}
                    <div className="flex flex-col gap-6">
                        
                        {/* NOTA AZUL */}
                        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs shadow-sm">
                            <Info size={18} className="shrink-0" />
                            <p>Al confirmar, este pedido se convertirá en una <b>venta oficial</b> y se eliminará de la lista de pendientes.</p>
                        </div>

                        {/* DETALLES EN GRID  */}
                        <div className="grid grid-cols-2 gap-6">
                            
                            {/* CLIENTE */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <User size={16} />
                                    <span>Cliente</span>
                                </div>
                                <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium shadow-inner border border-gray-200">
                                    {order.nombreCliente}
                                </div>
                            </div>

                            {/* DOCUMENTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <FileText size={16} />
                                    <span>Documento</span>
                                </div>
                                <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200">
                                    {order.documento}
                                </div>
                            </div>

                            {/* MÉTODO DE PAGO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <CreditCard size={16} />
                                    <span>Método de pago</span>
                                </div>
                                <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200 font-semibold">
                                    {order.formaPago}
                                </div>
                            </div>

                            {/* ESTADO FINAL */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <BadgeCheck size={16} />
                                    <span>Estado final</span>
                                </div>
                                <div className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200 ${estadoFinal === 'Finalizado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-500'}`}>
                                    {estadoFinal}
                                </div>
                            </div>

                        </div>

                        {order?.formaPago === "Credito" && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <FileText size={16} />
                                    <span>Plazo (Crédito) *</span>
                                </div>
                                <input
                                    type="text"
                                    value={diasPlazo}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, "");
                                        if (val !== "" && Number(val) > 60) val = "60";
                                        setDiasPlazo(val);
                                    }}
                                    placeholder="Ej: 45"
                                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                />
                            </div>
                        )}

                        {/* TOTAL */}
                        <div className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Total a facturar:</span>
                            <span className="text-2xl font-bold">
                                ${order.total?.toLocaleString()}
                            </span>
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2.5 rounded-lg text-sm font-medium shadow cursor-pointer"
                            >
                                Regresar
                            </button>

                            <PrimaryButton
                                onClick={() => onConfirm(order, diasPlazo)}
                                className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={order?.formaPago === "Credito" && (!diasPlazo || Number(diasPlazo) < 0 || Number(diasPlazo) > 60)}
                            >
                                <CheckCircle2 size={18} />
                                Confirmar Venta
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}