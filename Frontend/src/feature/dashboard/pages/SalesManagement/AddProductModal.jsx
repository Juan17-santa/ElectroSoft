import { useState, useEffect, useRef } from "react";
import { X, Box, Hash, ChevronDown, Search, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AddProductModal({ isOpen, onClose, onAdd, products, getAvailableStock }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [tempProducts, setTempProducts] = useState([]); // Cola local de productos
    const dropdownRef = useRef(null);

    // Reset fields when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProduct(null);
            setQuantity("");
            setSearchTerm("");
            setShowDropdown(false);
            setTempProducts([]); // Limpiar cola al abrir
        }
    }, [isOpen]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const getRealTimeStock = (p) => {
        if (!p) return 0;
        const baseAvailable = getAvailableStock(p);
        const inQueue = tempProducts.find(item => item.nombre === p.nombre);
        return baseAvailable - (inQueue ? inQueue.cantidad : 0);
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddToQueue = (e) => {
        if (e) e.preventDefault();

        if (!selectedProduct) {
            alert("Por favor, seleccione un producto.");
            return;
        }
        if (!quantity || quantity <= 0) {
            alert("Por favor, ingrese una cantidad válida.");
            return;
        }

        const qtyNum = parseFloat(quantity);
        const availableStock = getRealTimeStock(selectedProduct);

        if (qtyNum > availableStock) {
            alert(`No hay suficiente stock. Disponible real: ${availableStock}.`);
            return;
        }

        const inQueue = tempProducts.find(p => p.nombre === selectedProduct.nombre);
        if (inQueue) {
            setTempProducts(tempProducts.map(p =>
                p.nombre === selectedProduct.nombre
                    ? { ...p, cantidad: p.cantidad + qtyNum }
                    : p
            ));
        } else {
            setTempProducts([...tempProducts, {
                ...selectedProduct,
                cantidad: qtyNum
            }]);
        }

        // Reset solo la selección actual
        setSelectedProduct(null);
        setQuantity("");
        setSearchTerm("");
        setShowDropdown(false);
    };

    const handleRemoveFromQueue = (nombre) => {
        setTempProducts(tempProducts.filter(p => p.nombre !== nombre));
    };

    const handleConfirm = () => {
        if (tempProducts.length === 0) {
            alert("Agregue al menos un producto a la lista.");
            return;
        }
        onAdd(tempProducts);
        onClose();
    };

    const formatPrice = (val) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white rounded-[2rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl overflow-visible animate-in fade-in zoom-in duration-300 border border-gray-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-10 rounded-t-[2rem]">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Agregar <span className="text-yellow-400">Productos a la Venta</span></h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gestione el inventario y revise las cantidades antes de confirmar</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300 text-gray-400 hover:text-gray-900 group"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="p-10 flex flex-col gap-8 overflow-y-auto">
                    {/* Selector Area - More Spacious */}
                    <div className="bg-gray-50/50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="grid grid-cols-12 gap-6 items-end">
                            <div className="col-span-12 md:col-span-8 flex flex-col gap-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Producto</label>
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className={`w-full bg-white border-2 rounded-2xl px-6 py-4 text-sm flex items-center justify-between cursor-pointer transition-all duration-300 ${showDropdown ? 'border-yellow-400 ring-4 ring-yellow-50 shadow-lg' : 'border-gray-100 hover:border-yellow-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start gap-1 overflow-hidden">
                                            <span className={`truncate w-full ${selectedProduct ? 'text-gray-900 font-bold text-base' : 'text-gray-400 italic font-medium'}`}>
                                                {selectedProduct ? selectedProduct.nombre : 'Haz clic para buscar en el inventario...'}
                                            </span>
                                            {selectedProduct && (
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                                        Disponibilidad Real: {getRealTimeStock(selectedProduct)} unid.
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-lg">
                                                        {formatPrice(selectedProduct.precio)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                                    </div>

                                    {showDropdown && (
                                        <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                <div className="relative">
                                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Escribe el nombre del producto..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Column Headers for alignment */}
                                            <div className="grid grid-cols-12 px-6 py-2 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                                <div className="col-span-7">Descripción</div>
                                                <div className="col-span-2 text-center">Precio</div>
                                                <div className="col-span-3 text-right">Stock Actual</div>
                                            </div>

                                            <div className="overflow-y-auto max-h-[300px] p-2">
                                                {filteredProducts.map((p) => {
                                                    const stockVal = getRealTimeStock(p);
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => { setSelectedProduct(p); setShowDropdown(false); }}
                                                            className="w-full text-left px-4 py-3 rounded-xl text-sm hover:bg-yellow-50 flex items-center justify-between group transition-all"
                                                        >
                                                            <div className="grid grid-cols-12 w-full items-center">
                                                                <div className="col-span-7 pr-4">
                                                                    <span className="font-bold text-gray-700 truncate block group-hover:text-gray-900 transition-colors">{p.nombre}</span>
                                                                </div>
                                                                <div className="col-span-2 text-center">
                                                                    <span className="text-[11px] font-bold text-gray-500 tabular-nums">{formatPrice(p.precio)}</span>
                                                                </div>
                                                                <div className="col-span-3 text-right">
                                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${stockVal > 5 ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                                                                        {stockVal} unid.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                                {filteredProducts.length === 0 && (
                                                    <div className="py-10 text-center text-gray-400 italic text-sm font-medium">
                                                        No se encontraron resultados
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-8 md:col-span-3 flex flex-col gap-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 transition-all font-bold text-gray-800 shadow-sm"
                                />
                            </div>

                            <div className="col-span-4 md:col-span-1">
                                <button
                                    type="button"
                                    onClick={handleAddToQueue}
                                    disabled={!selectedProduct || !quantity || quantity <= 0}
                                    className="w-full h-[60px] bg-yellow-400 hover:bg-yellow-500 disabled:opacity-30 text-white rounded-2xl shadow-lg transition-all flex items-center justify-center cursor-pointer group"
                                >
                                    <Plus size={24} strokeWidth={4} className="group-active:scale-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Queue Management */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Productos Seleccionados ({tempProducts.length})</span>
                            {tempProducts.length > 0 && <span className="text-[9px] text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 uppercase tracking-widest animate-pulse">Revisar lista antes de confirmar</span>}
                        </div>

                        <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm min-h-[160px] max-h-[300px] overflow-y-auto">
                            {tempProducts.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50 sticky top-0 z-10">
                                        <tr className="text-left text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-5 font-black">Producto</th>
                                            <th className="px-8 py-5 font-black text-center">Cantidad</th>
                                            <th className="px-8 py-5 font-black text-right">Precio Unitario</th>
                                            <th className="px-8 py-5 font-black text-right">Subtotal</th>
                                            <th className="px-8 py-5 font-black text-center w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {tempProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5 font-bold text-gray-700">{p.nombre}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="bg-yellow-100 text-yellow-800 font-black px-4 py-1 rounded-lg text-xs border border-yellow-200">
                                                        {p.cantidad}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-medium text-gray-500 tabular-nums">{formatPrice(p.precio)}</td>
                                                <td className="px-8 py-5 text-right font-bold text-gray-800 tabular-nums">{formatPrice(p.precio * p.cantidad)}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFromQueue(p.nombre)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-all cursor-pointer hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-5 opacity-40">
                                    <Box size={56} className="text-gray-300 stroke-[1.5]" />
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic tracking-[0.3em]">Lista Vacía</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 pt-6 flex gap-5 border-t border-gray-50 bg-white sticky bottom-0 rounded-b-[2rem]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest"
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={tempProducts.length === 0}
                        className="flex-[2.5] py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-black rounded-2xl shadow-xl shadow-yellow-100 hover:shadow-2xl hover:shadow-yellow-200/50 transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3 cursor-pointer uppercase tracking-[0.2em] text-xs"
                    >
                        <CheckCircle2 size={20} />
                        Confirmar y Cargar a la Venta
                    </button>
                </div>
            </div>
        </div>
    );
}
