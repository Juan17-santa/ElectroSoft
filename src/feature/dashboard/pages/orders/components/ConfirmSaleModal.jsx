import { useState, useEffect } from "react";
import { X, CheckCircle2, Info, User, FileText, CreditCard, BadgeCheck } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Alert from "../../../components/ui/Alert";
import { ServicesOrders } from "../services/ServicesOrders";
import { ClientsService } from "../../Clients/services/ClientsService";
import paymentsService from "../../payments/services/paymentsService";

const MINIMUM_CREDIT_AMOUNT = 10000;

// COMPONENTE PRINCIPAL DE LA MODAL DE CONFIRMACIÓN
export default function ConfirmSaleModal({ isOpen, onClose, order, onConfirm, loading = false }) {
    const [activeOrder, setActiveOrder] = useState(order);
    const [diasPlazo, setDiasPlazo] = useState("");
    const [requestedCredit, setRequestedCredit] = useState(0);
    const [latestClientCupoDisponible, setLatestClientCupoDisponible] = useState(0);
    const [modalAlert, setModalAlert] = useState(null);

    useEffect(() => {
        if (!isOpen || !order) return;

        setActiveOrder(order);

        const loadLatestOrder = async () => {
            try {
                const freshOrder = await ServicesOrders.getOrderById(order._id);
                const orderData = freshOrder || order;
                setActiveOrder(orderData);

                const clientId = orderData.client?._id || orderData.client?.id || orderData.client;
                if (clientId) {
                    try {
                        const freshClient = await ClientsService.getById(clientId);
                        try {
                            const resumen = await paymentsService.getResumenCliente(freshClient.documento || freshClient.documentNumber || freshClient?.documento);
                            setLatestClientCupoDisponible(resumen?.cupoDisponible ?? (freshClient?.cupoTotal || 0));
                        } catch {
                            setLatestClientCupoDisponible(freshClient?.cupoTotal || 0);
                        }
                    } catch (clientError) {
                        console.warn("No se pudo obtener el cliente actualizado:", clientError);
                        setLatestClientCupoDisponible(orderData.client?.cupoTotal || 0);
                    }
                } else {
                    setLatestClientCupoDisponible(orderData.client?.cupoTotal || 0);
                }
            } catch (error) {
                console.warn("No se pudo obtener el pedido actualizado:", error);
                setActiveOrder(order);
            }
        };

        loadLatestOrder();
    }, [isOpen, order]);

    useEffect(() => {
        if (!isOpen || !activeOrder) return;

        setDiasPlazo("");

        if (activeOrder.paymentMethod === "Credito") {
            setRequestedCredit(activeOrder.total);
        } else if (activeOrder.paymentMethod === "Mixto") {
            setRequestedCredit(activeOrder.requestedCredit || 0);
        } else {
            setRequestedCredit(0);
        }
    }, [isOpen, activeOrder]);

    if (!isOpen || !activeOrder) return null;

    // DETERMINACIÓN DEL ESTADO SEGÚN LA FORMA DE PAGO
    const estadoFinal = activeOrder.paymentMethod === "Contado" ? "Finalizado" : "Vigente";

    const clienteCupoDisponible = latestClientCupoDisponible || activeOrder.client?.cupoDisponible || activeOrder.client?.cupoTotal || 0;

    const cashAmount = Math.max(
        0,
        Number(activeOrder.total || 0) - Number(requestedCredit || 0)
    );

    const formatCurrency = value =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(value || 0);

    const handleCreditChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setRequestedCredit(raw === "" ? 0 : Number(raw));
    };

    const formattedCredit =
        requestedCredit > 0
            ? requestedCredit.toLocaleString("es-CO")
            : "";

    return (
        <>
            {modalAlert && (
                <Alert
                    type={modalAlert.type}
                    message={modalAlert.message}
                    onClose={() => setModalAlert(null)}
                />
            )}

            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* CARD */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 border border-gray-200 animate-in fade-in zoom-in duration-200"
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
                            <p>Al confirmar, este pedido se convertirá en una <b>venta oficial</b> y se eliminará de la lista de pedidos por procesar.</p>
                        </div>

                        {/* ESTRUCTURA DE FILAS */}
                        <div className="flex flex-col gap-5">

                            {/* FILA 1: DATOS GENERALES */}
                            <div className="grid grid-cols-3 gap-5">
                                {/* CLIENTE */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                        <User size={16} />
                                        <span>Cliente</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium shadow-inner border border-gray-200">
                                        {activeOrder.client?.firstName || ""} {activeOrder.client?.lastName || ""}
                                    </div>
                                </div>

                                {/* DOCUMENTO */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                        <FileText size={16} />
                                        <span>Documento</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200">
                                        {activeOrder.client?.documentType?.abbreviation || ""} {activeOrder.client?.documentNumber || ""}
                                    </div>
                                </div>

                                {/* MÉTODO DE PAGO */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                        <CreditCard size={16} />
                                        <span>Método de pago</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200 font-semibold">
                                        {activeOrder.paymentMethod}
                                    </div>
                                </div>
                            </div>

                            {/* FILA 2: CASOS DE CONTADO, CRÉDITO Y MIXTO */}
                            {activeOrder.paymentMethod === "Contado" && (
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                        <BadgeCheck size={16} />
                                        <span>Estado final</span>
                                    </div>
                                    <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200 w-full">
                                        {estadoFinal}
                                    </div>
                                </div>
                            )}

                            {activeOrder.paymentMethod === "Credito" && (
                                <div className="grid grid-cols-2 gap-5 w-full">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                            <BadgeCheck size={16} />
                                            <span>Estado final</span>
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-500 rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200">
                                            {estadoFinal}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                            <FileText size={16} />
                                            <span>Plazo días (Crédito) *</span>
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
                                </div>
                            )}

                            {activeOrder.paymentMethod === "Mixto" && (
                                <div className="grid grid-cols-3 gap-5 w-full">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                            <BadgeCheck size={16} />
                                            <span>Estado final</span>
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-500 rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200">
                                            {estadoFinal}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                            <FileText size={16} />
                                            <span>Plazo días (Crédito) *</span>
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

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                            <CreditCard size={16} />
                                            <span>Cupo disponible</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200 font-semibold">
                                            {formatCurrency(clienteCupoDisponible)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FILA 3 (EXCLUSIVA PAGO MIXTO) */}
                            {activeOrder.paymentMethod === "Mixto" && (
                                <div className="grid grid-cols-2 gap-5 w-full items-end">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Crédito a utilizar
                                        </label>
                                        <input
                                            type="text"
                                            value={formattedCredit}
                                            onChange={handleCreditChange}
                                            placeholder="0"
                                            className="w-full bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700 opacity-0">
                                            Monto en efectivo
                                        </label>
                                        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.75 w-full">
                                            <span className="text-sm text-amber-800 font-medium">
                                                Monto en efectivo
                                            </span>
                                            <span className="font-bold text-amber-900 text-sm">
                                                {formatCurrency(cashAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TOTAL */}
                        <div className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Total a facturar:</span>
                            <span className="text-2xl font-bold">
                                ${activeOrder.total?.toLocaleString()}
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
                                onClick={() => {
                                    if ((activeOrder.paymentMethod === "Credito" || activeOrder.paymentMethod === "Mixto") && activeOrder.total < MINIMUM_CREDIT_AMOUNT) {
                                        setModalAlert({
                                            type: "error",
                                            message: "El total del pedido debe ser mínimo de $10.000 para usar crédito."
                                        });
                                        return;
                                    }
                                    if (activeOrder.paymentMethod === "Mixto") {
                                        if (requestedCredit <= 0) {
                                            setModalAlert({
                                                type: "error",
                                                message: "Debe indicar cuánto crédito utilizar."
                                            });
                                            return;
                                        }
                                        if (requestedCredit < MINIMUM_CREDIT_AMOUNT) {
                                            setModalAlert({
                                                type: "error",
                                                message: "El monto a crédito debe ser mínimo de $10.000."
                                            });
                                            return;
                                        }
                                        if (requestedCredit > clienteCupoDisponible) {
                                            setModalAlert({
                                                type: "error",
                                                message: "El crédito solicitado supera el cupo disponible."
                                            });
                                            return;
                                        }
                                        if (activeOrder.total - requestedCredit < MINIMUM_CREDIT_AMOUNT) {
                                            setModalAlert({
                                                type: "error",
                                                message: "La parte de contado debe ser mínimo de $10.000."
                                            });
                                            return;
                                        }
                                        if (requestedCredit > activeOrder.total) {
                                            setModalAlert({
                                                type: "error",
                                                message: "El crédito solicitado supera el total de la venta."
                                            });
                                            return;
                                        }
                                    }
                                    onConfirm(activeOrder, diasPlazo, requestedCredit);
                                }}
                                className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                    loading ||
                                    ((activeOrder?.paymentMethod === "Credito" || activeOrder?.paymentMethod === "Mixto") &&
                                        activeOrder?.total < MINIMUM_CREDIT_AMOUNT) ||
                                    ((activeOrder?.paymentMethod === "Credito" ||
                                        activeOrder?.paymentMethod === "Mixto") &&
                                        (
                                            !diasPlazo ||
                                            Number(diasPlazo) <= 0 ||
                                            Number(diasPlazo) > 60
                                        )) ||
                                    (activeOrder?.paymentMethod === "Mixto" && (
                                        requestedCredit <= 0 ||
                                        requestedCredit < MINIMUM_CREDIT_AMOUNT ||
                                        requestedCredit > clienteCupoDisponible ||
                                        requestedCredit > activeOrder.total ||
                                        activeOrder.total - requestedCredit < MINIMUM_CREDIT_AMOUNT
                                    ))
                                }
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