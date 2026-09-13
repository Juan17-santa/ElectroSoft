import { useState } from "react";
import { X, AlertCircle, CheckCircle2, FileText } from "lucide-react";

const MIN_LENGTH = 20;

export default function CancellationModal({ saleId, onConfirm, onCancel }) {
    const [reason, setReason] = useState("");
    const [errors, setErrors] = useState({});

    const validateInputs = () => {
        const newErrors = {};

        if (!reason.trim()) {
            newErrors.reason = "El motivo es obligatorio.";
        } else if (reason.trim().length < MIN_LENGTH) {
            newErrors.reason = `Mínimo ${MIN_LENGTH} caracteres. (${reason.trim().length}/${MIN_LENGTH})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = () => {
        if (!validateInputs()) return;
        onConfirm(reason.trim());
    };

    const isFormValid = reason.trim().length >= MIN_LENGTH;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-112.5 shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-red-100 rounded-xl p-1.5 flex items-center justify-center">
                                <AlertCircle size={16} className="text-red-600" />
                            </div>
                            <span className="font-bold text-[15px] text-stone-900 tracking-tight">
                                Anular venta
                            </span>
                        </div>

                        <button
                            onClick={onCancel}
                            className="bg-zinc-100 border-none rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors"
                        >
                            <X size={15} className="text-zinc-500" />
                        </button>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                        <div className="bg-red-500 rounded-xl p-2 flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(239,68,68,0.3)]">
                            <FileText size={15} className="text-white" />
                        </div>
                        <div className="flex gap-5 flex-1">
                            <div className="flex items-center gap-5">
                                <div>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest m-0">
                                        Venta
                                    </p>
                                    <p className="text-[13.5px] font-bold text-stone-900 mt-0.5 m-0">
                                        #{saleId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-[0.08em] mb-2">
                            <FileText size={10} /> Motivo de Cancelación
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (errors.reason) setErrors({ ...errors, reason: "" });
                            }}
                            placeholder="Describe el motivo de la anulación de la venta... (Mínimo 20 caracteres)"
                            rows={4}
                            className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[13px] text-stone-900 bg-stone-50 resize-none outline-none transition-all focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)] font-[inherit] ${
                                errors.reason
                                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-none"
                                    : "border-stone-200"
                            }`}
                        />

                        <div className="flex justify-between items-center mt-1.5">
                            {errors.reason ? (
                                <span className="text-[10px] text-red-600 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.reason}
                                </span>
                            ) : reason.trim().length >= MIN_LENGTH ? (
                                <span className="text-[10px] text-green-600 flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Válido
                                </span>
                            ) : (
                                <span />
                            )}
                            <span className={`text-[10px] font-semibold ${
                                reason.trim().length >= MIN_LENGTH ? "text-green-600" : "text-amber-200"
                            }`}>
                                {reason.trim().length}/{MIN_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2.5">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border-[1.5px] border-stone-200 bg-white text-[13px] font-semibold text-stone-500 cursor-pointer transition-all hover:bg-stone-50 hover:border-stone-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isFormValid}
                            className={`flex-1 py-3 rounded-xl border-none text-[13px] font-bold transition-all ${
                                isFormValid
                                    ? "bg-linear-to-br from-red-500 to-red-600 text-white cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.42)]"
                                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            }`}
                        >
                            Confirmar Cancelación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
