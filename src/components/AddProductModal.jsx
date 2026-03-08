import { useState, useEffect } from "react";
import { X, Box, Hash } from "lucide-react";

export default function AddProductModal({ isOpen, onClose, onAdd, products }) {
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState("");

    // Reset fields when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProductId("");
            setQuantity("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!selectedProductId || !quantity || quantity <= 0) {
            alert("Seleccione un producto y una cantidad válida.");
            return;
        }

        const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));
        if (selectedProduct) {
            onAdd(selectedProduct, parseFloat(quantity));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Modal Body with White Card effect */}
                <div className="p-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 relative">

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* Product Select */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <Box size={18} />
                                    <span>Productos *</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                    >
                                        <option value="">Seleccione su producto...</option>
                                        {(products || []).map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} - ${parseFloat(p.precio || 0).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Input */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <Hash size={18} />
                                    <span>Cantidad *</span>
                                </div>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Digite la cantidad"
                                    min="1"
                                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-8 py-2.5 rounded-xl bg-linear-to-r from-white to-yellow-300 hover:shadow-lg text-gray-800 font-medium transition cursor-pointer"
                            >
                                Añadir producto
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
