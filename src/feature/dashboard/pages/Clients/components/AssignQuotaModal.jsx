import { X, CreditCard, Info } from "lucide-react";
import { useState, useEffect } from "react";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

export default function AssignQuotaModal({ isOpen, onClose, onConfirm, clientName, currentQuota }) {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setAmount(currentQuota && currentQuota > 0 ? String(currentQuota) : "");
            setError("");
        }
    }, [isOpen, currentQuota]);

    if (!isOpen) return null;

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setAmount(raw);

        const numAmount = parseFloat(raw);
        if (raw === "" || isNaN(numAmount)) {
            setError("");
        } else if (numAmount <= 0) {
            setError("El monto debe ser mayor a 0");
        } else {
            setError("");
        }
    };

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setError("Ingrese un monto válido");
            return;
        }
        onConfirm(numAmount);
        setAmount("");
        setError("");
    };

    const handleClose = () => {
        setAmount("");
        setError("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in border border-yellow-100 overflow-hidden relative">

                {/* DECORACIÓN SUPERIOR */}
                <div className="h-2 bg-linear-to-r from-yellow-400 to-yellow-600 w-full"></div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Asignar Cupo</h3>
                                <p className="text-sm text-gray-500 line-clamp-1">Cliente: <span className="font-semibold text-gray-700">{clientName || 'Seleccionado'}</span></p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Cupo actual:
                        <span className="font-bold text-green-600">
                            {formatCOP(currentQuota)}
                        </span>
                    </p>

                    {/* Info */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Ingrese el monto total de crédito (cupo) que desea asignarle a este cliente para sus futuras compras a crédito.
                        </p>
                    </div>

                    {/* Input de monto */}
                    <div className={`relative flex items-center justify-center py-5 px-6 bg-gray-50/50 rounded-xl border-2 transition-all duration-300 mb-2 ${error
                        ? 'border-red-200 bg-red-50/30 ring-4 ring-red-50'
                        : 'border-dashed border-gray-300 focus-within:border-yellow-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-yellow-50'
                        }`}>
                        <div className="flex flex-col items-center w-full relative h-12 justify-center">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl select-none">$</div>
                            <input
                                autoFocus
                                type="text"
                                value={amount ? formatCOP(parseFloat(amount)).replace('$', '').trim() : ""}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className={`w-full text-center bg-transparent border-none focus:outline-none font-black text-4xl tracking-tighter px-8 ${error ? 'text-red-500' : 'text-gray-800'
                                    }`}
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm select-none">COP</div>
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    <div className="h-6">
                        {error && (
                            <p className="text-red-500 text-center text-xs font-semibold animate-fade-in">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 justify-end mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition cursor-pointer font-semibold text-sm border border-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!!error || !amount || parseFloat(amount) <= 0}
                            className="px-6 py-2.5 bg-linear-to-r from-yellow-400 to-yellow-500 text-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>Confirmar Monto</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
