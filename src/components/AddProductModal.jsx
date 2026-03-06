import { useState, useEffect } from "react";
import { Box, Hash } from "lucide-react";
import ValidationMessage from "../feature/dashboard/components/ui/ValidationMessage";
import { Validations } from "../utils/validations";
import PrimaryButton from "../feature/dashboard/components/ui/PrimaryButton";

export default function AddProductModal({ isOpen, onClose, onAdd, products, orderProducts, buttonText }) {
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [productError, setProductError] = useState("");

    // Helpers para calcular stock
    const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));
    const productInOrder = orderProducts.find(p => p.id === selectedProduct?.id);
    const usedStock = productInOrder ? productInOrder.cantidad : 0;
    const availableStock = selectedProduct ? selectedProduct.stock - usedStock : 0;

    useEffect(() => {
        if (isOpen) {
            setSelectedProductId("");
            setQuantity("");
            setProductError("");
            setQuantityError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Lógica de validación centralizada ---
    const validateQuantity = (value, product) => {
        if (value === "") return "La cantidad es obligatoria";

        const qty = Number(value);
        if (isNaN(qty) || qty <= 0) return "Cantidad invalida";

        if (product && qty > availableStock) {
            return `Solo quedan ${availableStock} unidades disponibles`;
        }
        return "";
    };

    const handleAddProduct = () => {
        const pError = !selectedProductId ? "Debe seleccionar un producto" : "";
        const qError = validateQuantity(quantity, selectedProduct);

        setProductError(pError);
        setQuantityError(qError);

        if (pError || qError) return;

        onAdd(selectedProduct, Number(quantity));
        onClose();
    };

    // Solo se bloquea si hay mensajes de error de texto
    const isInvalid = productError || quantityError;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="p-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 relative">

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* Selector de Producto */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                    <Box size={18} />
                                    <span>Productos *</span>
                                </div>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => {
                                        setSelectedProductId(e.target.value);
                                        setProductError("");
                                    }}
                                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                >
                                    <option value="" hidden>Seleccione su producto...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} - ${parseFloat(p.precio || 0).toLocaleString()}
                                        </option>
                                    ))}
                                </select>

                                {/* MENSAJES DE VALIDACIÓN */}
                                {/* 1. Si hay error (no seleccionó nada), mostramos el error */}
                                <ValidationMessage error={productError} />

                                {/* MOSTRAR STOCK DISPONIBLE */}
                                {selectedProduct && !productError && (
                                    <p className={`text-xs ${availableStock === 0 ? "text-red-500" : "text-gray-500"}`}>
                                        Stock disponible: {availableStock}
                                    </p>
                                )}

                                {/* 2. Si ya seleccionó algo y no hay error, confirmamos que es válido */}
                                <ValidationMessage
                                    success={!!selectedProductId && !productError}
                                    successMessage="Producto seleccionado correctamente"
                                />
                            </div>

                            {/* Input de Cantidad */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                    <Hash size={18} />
                                    <span>Cantidad *</span>
                                </div>
                                <input
                                    type="text"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;

                                        // Si el valor es vacío (para poder borrar) o cumple tu validación de números
                                        if (val === "" || Validations.soloNumeros(val)) {
                                            setQuantity(val); // Solo actualiza si es un número válido
                                            setQuantityError(validateQuantity(val, selectedProduct));
                                        }
                                        // Si el usuario presiona "+" o "-", la función devuelve false y el input NO cambia.
                                    }}
                                    placeholder="0"
                                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                />

                                {/* Uso de tu componente reutilizable */}
                                <ValidationMessage error={quantityError} />
                                {/* Mensaje de Éxito (Solo si hay algo escrito y no hay error) */}
                                {quantity !== "" && !quantityError && (
                                    <ValidationMessage
                                        success={true}
                                        successMessage="Cantidad válida"
                                    />
                                )}
                            </div>
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition shadow-md"
                            >
                                Cancelar
                            </button>

                            <PrimaryButton
                                onClick={handleAddProduct}
                                disabled={isInvalid} // <-- Aquí aplicamos la lógica
                            >
                                {buttonText || "Añadir producto"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}