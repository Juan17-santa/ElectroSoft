import { useState, useEffect } from "react";
import { X, Box, Hash, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function AddProductModal({ isOpen, onClose, onAdd, products, getAvailableStock }) {
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    // Reset fields when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProductId("");
            setQuantity("");
            setCurrentPage(1);
            setSearch("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleAdd = () => {
        if (!selectedProductId || !quantity || quantity <= 0) {
            alert("Seleccione un producto y una cantidad válida.");
            return;
        }

        const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));
        if (selectedProduct) {
            const availableStock = getAvailableStock(selectedProduct);
            if (quantity > availableStock) {
                alert(`No hay suficiente stock disponible. Stock actual: ${availableStock}`);
                return;
            }
            onAdd(selectedProduct, parseFloat(quantity));
        }
    };

    const selectedProductData = products.find(p => String(p.id) === String(selectedProductId));
    const availableStock = selectedProductData ? getAvailableStock(selectedProductData) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 relative">
                        <button 
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Añadir producto a la venta</h3>
                            <p className="text-sm text-gray-500">Seleccione un producto de la lista y la cantidad a vender.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-6">
                            {/* Product Selection List */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                    <Box size={18} />
                                    <span>Productos *</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
                                />
                                <div className="flex flex-col gap-2 min-h-[220px]">
                                    {paginatedProducts.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedProductId(String(p.id))}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                                                String(selectedProductId) === String(p.id)
                                                    ? "bg-yellow-50 border-yellow-400 text-yellow-800 font-medium"
                                                    : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{p.nombre}</span>
                                                <span className="text-xs text-gray-500">${parseFloat(p.precio || 0).toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic">
                                            No se encontraron productos.
                                        </div>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center mt-2 px-2">
                                        <span className="text-xs text-gray-500">Pág. {currentPage} de {totalPages}</span>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                className="p-1.5 rounded-lg bg-gray-100 disabled:opacity-30 hover:bg-gray-200 transition-colors"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                className="p-1.5 rounded-lg bg-gray-100 disabled:opacity-30 hover:bg-gray-200 transition-colors"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity and Info */}
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                        <Hash size={18} />
                                        <span>Cantidad *</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        min="1"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                    {selectedProductId && (
                                        <div className="mt-2 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                            <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">Disponibilidad</p>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-blue-800">Stock disponible:</span>
                                                <span className={`text-lg font-bold ${availableStock < quantity ? 'text-red-600' : 'text-blue-900'}`}>
                                                    {availableStock}
                                                </span>
                                            </div>
                                            {availableStock < quantity && (
                                                <p className="text-[10px] text-red-500 mt-1 font-medium italic">Excede el stock disponible</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-6">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition cursor-pointer"
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
