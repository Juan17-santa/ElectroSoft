import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function CancellationModal({ saleId, onConfirm, onCancel }) {
    const [motivo, setMotivo] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!motivo.trim()) {
            setError("Debe proporcionar un motivo para la anulación.");
            return;
        }
        onConfirm(motivo);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex flex-col items-center mb-5 text-center">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Anular Venta #{saleId}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Esta acción anulará la venta y retornará los productos al inventario.
                    </p>
                </div>

                <div className="mb-5 text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo de anulación *
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => { setMotivo(e.target.value); setError(""); }}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Especifique el motivo..."
                    />
                    {error && <p className="text-left text-red-500 text-xs mt-2">{error}</p>}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium text-sm cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md cursor-pointer transition font-medium text-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
