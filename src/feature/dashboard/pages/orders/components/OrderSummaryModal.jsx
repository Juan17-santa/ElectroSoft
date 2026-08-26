import { useEffect } from "react";
import { X, Banknote } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";

const MINIMUM_CREDIT_AMOUNT = 10000;

export default function OrderSummaryModal({
    isOpen,
    onClose,
    onConfirm,
    total,
    paymentMethod,
    availableCredit,
    requestedCredit,
    setRequestedCredit,
    loading,
    errorRequestedCredit
}) {

    useEffect(() => {
        if (!isOpen) return;

        if (paymentMethod === "Credito") {
            setRequestedCredit(total);
        } else {
            setRequestedCredit(0);
        }

    }, [isOpen, paymentMethod, total, setRequestedCredit]);

    if (!isOpen) return null;

    const cashAmount = Math.max(0, total - requestedCredit);

    const creditValidationError = paymentMethod === "Mixto"
        ? requestedCredit <= 0
            ? "Debe indicar cuánto crédito desea utilizar."
            : requestedCredit < MINIMUM_CREDIT_AMOUNT
                ? "El monto a crédito debe ser mínimo de $10.000."
            : requestedCredit > availableCredit
                ? "El crédito solicitado supera el cupo disponible."
                : requestedCredit > total
                    ? "El crédito no puede ser mayor al total."
                : total - requestedCredit < MINIMUM_CREDIT_AMOUNT
                    ? "La parte de contado debe ser mínimo de $10.000."
                    : ""
        : "";

    const handleConfirm = () => {
        if (creditValidationError) {
            return;
        }
        onConfirm();
    };

    const formatCurrency = value =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(value || 0);

    const handleCreditChange = (e) => {
        const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
        const numericValue = rawDigits === "" ? 0 : parseInt(rawDigits, 10);
        setRequestedCredit(numericValue);
    };

    const formattedCredit = requestedCredit
        ? requestedCredit.toLocaleString("es-CO")
        : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
                <div className="flex justify-between items-start border-b border-gray-200 pb-5 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Confirmar pedido
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Revisa la información antes de registrar el pedido.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
                        <p className="text-sm text-gray-600 mb-1">
                            Total del pedido
                        </p>

                        <p className="text-3xl font-bold text-yellow-700">
                            {formatCurrency(total)}
                        </p>
                    </div>

                    {(paymentMethod === "Credito" || paymentMethod === "Mixto") && (
                        <>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Cupo disponible
                                    </span>

                                    <span className="font-bold text-green-700 text-lg">
                                        {formatCurrency(availableCredit)}
                                    </span>
                                </div>
                            </div>

                            {paymentMethod === "Mixto" && (
                                <>
                                    <div>
                                        <label className="block mb-2 font-medium">
                                            Crédito a utilizar
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={formattedCredit}
                                            onChange={handleCreditChange}
                                            maxLength={11}
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-lg font-semibold focus:border-yellow-400 focus:bg-white outline-none transition"
                                        />
                                        {(errorRequestedCredit || creditValidationError) && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errorRequestedCredit || creditValidationError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                                        <Banknote size={24} className="text-amber-600 shrink-0" />
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <span className="text-sm text-amber-800">
                                                Este monto debe pagarse en efectivo
                                            </span>
                                            <strong className="text-base font-bold text-amber-900 whitespace-nowrap">
                                                {formatCurrency(cashAmount)}
                                            </strong>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium cursor-pointer hover:bg-gray-200 hover:text-gray-800 active:scale-95 transition-all duration-150"
                    >
                        Cancelar
                    </button>

                    <PrimaryButton
                        onClick={handleConfirm}
                        loading={loading}
                        disabled={loading || Boolean(creditValidationError)}
                    >
                        Confirmar pedido
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}