import { useEffect, useState } from "react";
import { X, CheckCircle2, CreditCard, FileText, User, BadgeCheck } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ValidationMessage from "../../../components/ui/ValidationMessage";

const MINIMUM_CREDIT_AMOUNT = 10000;

export default function ConfirmSaleModal({
    isOpen,
    onClose,
    onConfirm,
    clientName,
    documentType,
    document,
    paymentMethod,
    total,
    availableCredit = 0,
    loading = false
}) {
    const [diasPlazo, setDiasPlazo] = useState("");
    const [requestedCredit, setRequestedCredit] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setDiasPlazo("");
            setRequestedCredit(paymentMethod === "Credito" ? total : 0);
        }
    }, [isOpen, paymentMethod, total]);

    if (!isOpen) return null;

    const needsCredit = paymentMethod === "Credito" || paymentMethod === "Mixto";
    const diasPlazoError = needsCredit && (!diasPlazo || Number(diasPlazo) <= 0 || Number(diasPlazo) > 60)
        ? "El plazo debe estar entre 1 y 60 días."
        : "";
    const requestedCreditError = paymentMethod !== "Mixto"
        ? ""
        : requestedCredit < MINIMUM_CREDIT_AMOUNT
            ? "El monto a crédito debe ser mínimo de $10.000."
            : requestedCredit > availableCredit
                ? "El crédito solicitado supera el cupo disponible."
                : requestedCredit > total
                    ? "El crédito solicitado supera el total de la venta."
                    : total - requestedCredit < MINIMUM_CREDIT_AMOUNT
                        ? "La parte de contado debe ser mínimo de $10.000."
                        : "";
    const cashAmount = Math.max(0, total - requestedCredit);
    const formatCurrency = (value) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", minimumFractionDigits: 0
    }).format(value || 0);

    const handleClose = () => {
        if (!loading) onClose();
    };

    const handleConfirm = () => {
        if (loading || diasPlazoError || requestedCreditError) return;
        onConfirm({
            diasPlazo: needsCredit ? Number(diasPlazo) : null,
            requestedCredit: paymentMethod === "Mixto" ? requestedCredit : paymentMethod === "Credito" ? total : 0
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 border border-gray-200" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-lg font-semibold">Confirmar <span className="text-yellow-400">venta</span></p>
                            <p className="text-xs text-gray-500">Revise los detalles antes de registrar la venta.</p>
                        </div>
                        <button type="button" onClick={handleClose} disabled={loading} className="hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer disabled:opacity-50"><X size={18} /></button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><User size={16} /><span>Cliente</span></div><div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium shadow-inner border border-gray-200">{clientName}</div></div>
                            <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><FileText size={16} /><span>Documento</span></div><div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200">{documentType} {document}</div></div>
                            <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><CreditCard size={16} /><span>Método de pago</span></div><div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 font-semibold shadow-inner border border-gray-200">{paymentMethod === "Credito" ? "Crédito" : paymentMethod}</div></div>
                        </div>

                        {paymentMethod === "Contado" && <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><BadgeCheck size={16} /><span>Estado final</span></div><div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200">Finalizado</div></div>}

                        {needsCredit && <div className={`grid grid-cols-1 ${paymentMethod === "Mixto" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-5`}>
                            <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><BadgeCheck size={16} /><span>Estado final</span></div><div className="bg-yellow-50 text-yellow-600 rounded-xl px-4 py-3 text-sm font-semibold shadow-inner border border-gray-200">Vigente</div></div>
                            <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><FileText size={16} /><span>Plazo días (Crédito) *</span></div><input type="text" value={diasPlazo} onChange={(event) => { let value = event.target.value.replace(/\D/g, ""); if (value && Number(value) > 60) value = "60"; setDiasPlazo(value); }} placeholder="Ej: 45 (Máx 60)" disabled={loading} className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-inner border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" /><ValidationMessage error={diasPlazoError} success={Boolean(diasPlazo) && !diasPlazoError} successMessage="Plazo válido" /></div>
                            {paymentMethod === "Mixto" && <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-yellow-400 text-sm font-medium"><CreditCard size={16} /><span>Cupo disponible</span></div><div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 font-semibold shadow-inner border border-gray-200">{formatCurrency(availableCredit)}</div></div>}
                        </div>}

                        {paymentMethod === "Mixto" && <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="flex flex-col gap-2"><label className="text-sm font-medium text-gray-700">Crédito a utilizar</label><input type="text" value={requestedCredit ? requestedCredit.toLocaleString("es-CO") : ""} onChange={(event) => setRequestedCredit(Number(event.target.value.replace(/\D/g, "")) || 0)} placeholder="0" disabled={loading} className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-sm" /><ValidationMessage error={requestedCreditError} success={requestedCredit > 0 && !requestedCreditError} successMessage="Crédito válido" /></div><div className="flex flex-col gap-2"><label className="text-sm font-medium text-gray-700">Monto en efectivo</label><div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"><span className="text-sm text-amber-800 font-medium">Paga ahora</span><span className="font-bold text-amber-900 text-sm">{formatCurrency(cashAmount)}</span></div></div></div>}

                        <div className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex justify-between items-center"><span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Total a facturar:</span><span className="text-2xl font-bold">{formatCurrency(total)}</span></div>
                        <div className="flex justify-end gap-4 pt-2"><button type="button" onClick={handleClose} disabled={loading} className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2.5 rounded-lg text-sm font-medium shadow cursor-pointer disabled:opacity-50">Regresar</button><PrimaryButton onClick={handleConfirm} loading={loading} disabled={loading || Boolean(diasPlazoError) || Boolean(requestedCreditError)} className="flex items-center gap-2"><CheckCircle2 size={18} /> Confirmar venta</PrimaryButton></div>
                    </div>
                </div>
            </div>
        </>
    );
}