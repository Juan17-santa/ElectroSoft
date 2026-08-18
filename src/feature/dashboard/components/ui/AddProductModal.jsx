import { useState, useEffect, useRef } from "react";
import { X, Search, Plus, Trash2, Package, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { Validations } from "../../../../utils/validations";
import ValidationMessage from "./ValidationMessage";

/**
 * AddProductModal — Modal reutilizable para agregar productos en cola
 *
 * Props:
 * @param {boolean}  isOpen            - Controla visibilidad del modal
 * @param {function} onClose           - Callback para cerrar
 * @param {function} onConfirm         - Callback final con array [{...producto, cantidad}]
 * @param {Array}    products          - Lista de productos disponibles
 * @param {function} getAvailableStock - (producto) => number — stock disponible
 * @param {string}   title             - Título del modal (opcional)
 * @param {string}   confirmText       - Texto del botón confirmar (opcional)
 */
export default function AddProductModal({
    isOpen,
    onClose,
    onConfirm,
    products = [],
    getAvailableStock,
    title = "Agregar Productos",
    confirmText = "Confirmar selección",
    isCredit = false,
    quotaAmount = 0,
    currentSaleTotal = 0,
    onSwitchToMixed
}) {
    // ── BUSCADOR / COMBO ─────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState("");

    // ── ERRORES ADICIONALES ──────────────────────────────────────────────────
    const [showQuotaWarning, setShowQuotaWarning] = useState(false);
    const [pendingProductToAdd, setPendingProductToAdd] = useState(null);   // { selectedProduct, quantity }
    const [pendingQueueUpdate, setPendingQueueUpdate] = useState(null);      // { id, change }

    // ── PAGINACIÓN DEL DROPDOWN ──────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // ── COLA DE PRODUCTOS ────────────────────────────────────────────────────
    const [queue, setQueue] = useState([]);

    // ── ERRORES ──────────────────────────────────────────────────────────────
    const [productError, setProductError] = useState("");
    const [quantityError, setQuantityError] = useState("");

    const dropdownRef = useRef(null);
    const quantityInputRef = useRef(null);

    // ── STOCK REAL (descuenta lo que ya está en cola) ────────────────────────
    const getRealStock = (product) => {
        if (!product) return 0;
        const base = getAvailableStock?.(product) ?? 0;
        const inQueue = queue.find((q) => String(q.id) === String(product.id));
        return base - (Number(inQueue?.cantidad) || 0);
    };

    // ── PRODUCTOS FILTRADOS + PAGINADOS ──────────────────────────────────────
    const filteredProducts = products.filter((p) =>
        (p.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedItems = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── CERRAR DROPDOWN FUERA DE CLICK ───────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
                if (selectedProduct) setSearchTerm(selectedProduct.nombre);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [selectedProduct]);

    // ── RESET AL ABRIR ───────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSelectedProduct(null);
            setQuantity("");
            setQueue([]);
            setProductError("");
            setQuantityError("");
            setIsDropdownOpen(false);
            setCurrentPage(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // ── HANDLERS ─────────────────────────────────────────────────────────────
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchTerm(product.nombre);
        setIsDropdownOpen(false);
        setProductError("");
        setTimeout(() => quantityInputRef.current?.focus(), 50);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setIsDropdownOpen(true);
        setCurrentPage(1);
        if (selectedProduct && val !== selectedProduct.nombre) {
            setSelectedProduct(null);
            setProductError("Selecciona un producto de la lista");
        } else if (selectedProduct) {
            setProductError("");
        }
    };

    const handleClearProduct = () => {
        setSearchTerm("");
        setSelectedProduct(null);
        setProductError("");
        setIsDropdownOpen(true);
        setCurrentPage(1);
    };

    const validateQty = (val, product) => {
        if (!val) return "Ingresa una cantidad";
        const num = Number(val);
        if (isNaN(num) || num <= 0 || !Number.isInteger(num)) return "Cantidad inválida";
        if (product) {
            const stock = getRealStock(product);
            if (num > stock) return `Máximo disponible: ${stock}`;
            
            if (isCredit) {
                const totalValue = queue.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
                const newTotalSaleValue = currentSaleTotal + totalValue + (num * product.precio);
                if (newTotalSaleValue > quotaAmount) {
                    return "QUOTA_EXCEEDED";
                }
            }
        }
        return "";
    };

    const handleAddToQueue = () => {
        let hasError = false;
        if (!selectedProduct) { setProductError("Selecciona un producto válido"); hasError = true; }
        const qError = validateQty(quantity, selectedProduct);
        
        if (qError === "QUOTA_EXCEEDED") {
            setShowQuotaWarning(true);
            setPendingProductToAdd({ selectedProduct, quantity: Number(quantity) });
            return;
        } else if (qError) { 
            setQuantityError(qError); 
            hasError = true; 
        }
        
        if (hasError) return;

        performAddToQueue(selectedProduct, Number(quantity));
    };

    const performAddToQueue = (prod, qty) => {
        const existing = queue.find((q) => String(q.id) === String(prod.id));
        setQueue(existing
            ? queue.map((q) => String(q.id) === String(prod.id) ? { ...q, cantidad: (Number(q.cantidad) || 0) + qty } : q)
            : [...queue, { ...prod, cantidad: qty }]
        );
        setSelectedProduct(null); setSearchTerm(""); setQuantity("");
        setProductError(""); setQuantityError("");
    };

    const handleRemoveFromQueue = (id) => {
        setQueue((prev) => prev.filter((q) => q.id !== id));
    };

    const handleUpdateQuantity = (id, change) => {
        setQueue((prev) => prev.map((q) => {
            if (q.id === id) {
                const currentQty = Number(q.cantidad) || 0;
                const newQty = currentQty + change;
                if (newQty <= 0) return q;
                const base = getAvailableStock?.(q) ?? Infinity;
                if (change > 0 && newQty > base) return q;

                // Verificar cupo si es venta a crédito y se está aumentando cantidad
                if (change > 0 && isCredit && quotaAmount > 0) {
                    const otherTotal = prev
                        .filter(item => item.id !== id)
                        .reduce((acc, item) => acc + item.precio * (Number(item.cantidad) || 0), 0);
                    const newTotal = otherTotal + q.precio * newQty + currentSaleTotal;
                    if (newTotal > quotaAmount) {
                        // Mostrar alerta de cambio a Mixto sin aplicar el cambio
                        setPendingQueueUpdate({ id, change });
                        setPendingProductToAdd(null);
                        setShowQuotaWarning(true);
                        return q; // No aplicar el cambio todavía
                    }
                }

                return { ...q, cantidad: newQty };
            }
            return q;
        }));
    };

    const handleSetQuantity = (id, value) => {
        if (value === "") {
            setQueue((prev) => prev.map((q) => q.id === id ? { ...q, cantidad: "" } : q));
            return;
        }
        const newQty = parseInt(value, 10);
        if (isNaN(newQty) || newQty < 0) return;
        
        setQueue((prev) => prev.map((q) => {
            if (q.id === id) {
                const base = getAvailableStock?.(q) ?? Infinity;
                if (newQty > base) return { ...q, cantidad: base };
                return { ...q, cantidad: newQty };
            }
            return q;
        }));
    };

    const handleBlurQuantity = (id) => {
        setQueue((prev) => prev.map((q) => {
            if (q.id === id) {
                if (!q.cantidad || Number(q.cantidad) <= 0) {
                    return { ...q, cantidad: 1 };
                }
            }
            return q;
        }));
    };

    const handleConfirm = () => {
        if (queue.length === 0) return;
        const validQueue = queue
            .map(q => ({ ...q, cantidad: Number(q.cantidad) || 1 }))
            .filter(q => q.cantidad > 0);
        if (validQueue.length === 0) return;
        onConfirm(validQueue);
        onClose();
    };

    // ── TOTALES ──────────────────────────────────────────────────────────────
    const totalItems = queue.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0);
    const totalValue = queue.reduce((acc, p) => acc + p.precio * (Number(p.cantidad) || 0), 0);

    const isExceedingQuota = isCredit && (currentSaleTotal + totalValue > quotaAmount);

    const fmt = (n) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(n);

    // ── ESTILO BASE DE INPUTS ─────────────────────────────────────────────────
    const inputBase = {
        width: "100%", backgroundColor: "#f3f4f6", border: "1.5px solid #e5e7eb",
        borderRadius: "10px", padding: "10px 14px", fontSize: "14px",
        color: "#111827", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
        .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}>

            <div className="w-full flex flex-col bg-white overflow-hidden"
                style={{
                    maxWidth: "1024px", maxHeight: "90vh", borderRadius: "20px",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.18)", border: "1px solid #e5e7eb"
                }}>

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-7 py-5"
                    style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl"
                            style={{ backgroundColor: "#facc15" }}>
                            <ShoppingCart size={17} color="#1f2937" strokeWidth={2.2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-gray-800"
                                    style={{ fontSize: "16px", letterSpacing: "-0.01em" }}>{title}</h2>
                                {isCredit && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                        style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
                                        Cupo: {fmt(quotaAmount)}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400" style={{ marginTop: "1px" }}>
                                {queue.length === 0
                                    ? "Ningún producto añadido"
                                    : `${queue.length} ${queue.length === 1 ? "producto" : "productos"} · ${totalItems} unidades`}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>

                {/* ── ZONA SELECCIÓN ─────────────────────────────────────── */}
                <div className="px-7 py-5"
                    style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_130px_110px]">

                        {/* Buscador / combo */}
                        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                            <label className="text-xs font-semibold text-yellow-500 flex items-center gap-1.5"
                                style={{ letterSpacing: "0.03em" }}>
                                <Package size={13} /> Producto *
                            </label>

                            <div className="relative">
                                <Search size={14}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                                <input type="text" value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Buscar producto..."
                                    style={{
                                        ...inputBase, paddingLeft: "36px", paddingRight: "60px",
                                        borderColor: productError ? "#f87171" : isDropdownOpen ? "#facc15" : "#e5e7eb",
                                        boxShadow: isDropdownOpen ? "0 0 0 3px rgba(250,204,21,0.15)" : "none",
                                    }} />
                                {searchTerm && (
                                    <button type="button" onClick={handleClearProduct}
                                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors">
                                        <X size={13} />
                                    </button>
                                )}
                                <ChevronDown size={14}
                                    className="absolute right-3 top-1/2 pointer-events-none text-gray-400 transition-transform"
                                    style={{ transform: isDropdownOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} />

                                {/* ── DROPDOWN ─────────────────────────────── */}
                                {isDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white overflow-hidden"
                                        style={{
                                            borderRadius: "12px", border: "1.5px solid #facc15",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
                                        }}>

                                        {/* Cabecera columnas */}
                                        <div
                                            className="grid px-4 py-2 grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_80px_70px_90px]"
                                            style={{
                                                backgroundColor: "#fffbeb",
                                                borderBottom: "1px solid #fde68a"
                                            }}
                                        >
                                            <p className="text-xs font-semibold text-yellow-600">Nombre producto</p>
                                            <p className="text-xs font-semibold text-yellow-600 text-right">Precio</p>
                                            <p className="text-xs font-semibold text-yellow-600 text-right">Stock</p>
                                            <p className="text-xs font-semibold text-yellow-600 text-right hidden md:block">Tipo stock</p>
                                        </div>

                                        {/* Filas paginadas */}
                                        <div>
                                            {paginatedItems.length > 0 ? paginatedItems.map((p) => {
                                                const stock = getRealStock(p);
                                                const inQueue = queue.some((q) => String(q.id) === String(p.id));
                                                const isSelected = selectedProduct && String(selectedProduct.id) === String(p.id);
                                                return (
                                                    <button key={p.id} type="button"
                                                        onClick={() => handleSelectProduct(p)}
                                                        className={`w-full grid px-4 py-3 text-left btn-row-product grid-cols-[1fr_80px_70px] md:grid-cols-[1fr_80px_70px_90px] ${isSelected ? "bg-yellow-50" : ""}`}
                                                        style={{ borderBottom: "1px solid #f9fafb" }}>
                                                        <div className="flex md:items-center flex-col md:flex-row md:gap-2 overflow-hidden">
                                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                                {p.nombre}
                                                            </span>

                                                            {inQueue && (
                                                                <span
                                                                    className="shrink-0 font-semibold px-1.5 py-0.5 rounded w-fit mt-1"
                                                                    style={{
                                                                        backgroundColor: "#fef9c3",
                                                                        color: "#a16207",
                                                                        fontSize: "10px"
                                                                    }}
                                                                >
                                                                    En lista
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-xs font-medium text-gray-500 text-right tabular-nums self-center">
                                                            {fmt(p.precio)}
                                                        </p>

                                                        <div className="flex justify-end items-center">
                                                            <span
                                                                className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                                                                style={{
                                                                    backgroundColor: stock > 20 ? "#f0fdf4" : stock > 0 ? "#fffbeb" : "#fef2f2",
                                                                    color: stock > 20 ? "#16a34a" : stock > 0 ? "#ca8a04" : "#dc2626",
                                                                }}
                                                            >
                                                                {stock}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-gray-400 text-right hidden md:block">
                                                            {p.tipoStock || "—"}
                                                        </p>
                                                    </button>
                                                );
                                            }) : (
                                                <div className="py-8 text-center text-sm text-gray-400 italic">
                                                    Sin resultados
                                                </div>
                                            )}
                                        </div>

                                        {/* ── PAGINADOR ────────────────────── */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between px-4 py-2.5"
                                                style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                                                <p className="text-xs text-gray-400">Página {currentPage} de {totalPages}</p>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage((p) => p - 1)}
                                                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-30 bg-white btn-page"
                                                        style={{ border: "1px solid #e5e7eb" }}>
                                                        <ChevronLeft size={13} className="text-gray-500" />
                                                    </button>

                                                    {pageNumbers.map((p, idx) =>
                                                        p === "..." ? (
                                                            <span key={`dots-${idx}`} className="text-xs text-gray-400 px-1">…</span>
                                                        ) : (
                                                            <button key={p} type="button" onClick={() => setCurrentPage(p)}
                                                                className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${currentPage !== p ? "btn-page" : ""}`}
                                                                style={{
                                                                    backgroundColor: currentPage === p ? "#facc15" : "white",
                                                                    color: currentPage === p ? "#1f2937" : "#6b7280",
                                                                    border: currentPage === p ? "1px solid #facc15" : "1px solid #e5e7eb",
                                                                }}>{p}</button>
                                                        )
                                                    )}

                                                    <button type="button" disabled={currentPage === totalPages}
                                                        onClick={() => setCurrentPage((p) => p + 1)}
                                                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-30 bg-white btn-page"
                                                        style={{ border: "1px solid #e5e7eb" }}>
                                                        <ChevronRight size={13} className="text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ValidationMessage error={productError} />
                            <ValidationMessage
                                success={!!selectedProduct && !productError}
                                successMessage={`Producto válido · Stock: ${getRealStock(selectedProduct)} · Tipo stock: ${selectedProduct?.tipoStock || "N/A"}`}
                            />
                        </div>

                        {/* Cantidad */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-yellow-500" style={{ letterSpacing: "0.03em" }}>
                                Cantidad *
                            </label>
                            <input ref={quantityInputRef} type="number" min="1"
                                value={quantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || Validations.soloNumeros(val)) {
                                        setQuantity(val);
                                        setQuantityError(validateQty(val, selectedProduct));
                                        
                                        // Ocultar alerta de excedente si el usuario decide cambiar la cantidad
                                        if (showQuotaWarning) {
                                            setShowQuotaWarning(false);
                                            setPendingProductToAdd(null);
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
                                }}
                                placeholder="0"
                                style={{
                                    ...inputBase,
                                    borderColor: quantityError ? "#f87171" : "#e5e7eb",
                                    boxShadow: quantityError ? "0 0 0 3px rgba(248,113,113,0.12)" : "none",
                                    MozAppearance: "textfield",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#facc15";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(250,204,21,0.15)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = quantityError ? "#f87171" : "#e5e7eb";
                                    e.currentTarget.style.boxShadow = quantityError ? "0 0 0 3px rgba(248,113,113,0.12)" : "none";
                                }}
                            />
                            <ValidationMessage error={quantityError === "QUOTA_EXCEEDED" ? "El monto superaría el cupo (Pulsa Añadir para opciones)" : quantityError} />
                            <ValidationMessage success={quantity !== "" && !quantityError} successMessage="Cantidad válida" />
                        </div>

                        {/* Botón añadir */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold opacity-0 select-none">.</label>
                            <button type="button" onClick={handleAddToQueue}
                                disabled={!selectedProduct || !quantity}
                                className="flex items-center justify-center gap-2 w-full font-semibold text-sm rounded-xl transition-all btn-add"
                                style={{
                                    padding: "10px 14px", height: "42px", border: "none",
                                    backgroundColor: !selectedProduct || !quantity ? "#e5e7eb" : "#facc15",
                                    color: !selectedProduct || !quantity ? "#9ca3af" : "#1f2937",
                                    cursor: !selectedProduct || !quantity ? "not-allowed" : "pointer",
                                }}>
                                <Plus size={15} /> Añadir
                            </button>
                        </div>
                    </div>
                    {/* Alerta de cambio de tipo a Mixto */}
                    {showQuotaWarning && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">
                                    El monto total supera el cupo. ¿Deseas cambiar la venta a Mixto para continuar?
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowQuotaWarning(false);
                                        setPendingProductToAdd(null);
                                        setPendingQueueUpdate(null);
                                    }}
                                    className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onSwitchToMixed) onSwitchToMixed();
                                        // Aplicar acción pendiente según el flujo que activó la alerta
                                        if (pendingProductToAdd) {
                                            performAddToQueue(pendingProductToAdd.selectedProduct, pendingProductToAdd.quantity);
                                        } else if (pendingQueueUpdate) {
                                            setQueue((prev) => prev.map((q) => {
                                                if (q.id === pendingQueueUpdate.id) {
                                                    return { ...q, cantidad: (Number(q.cantidad) || 0) + pendingQueueUpdate.change };
                                                }
                                                return q;
                                            }));
                                        }
                                        setShowQuotaWarning(false);
                                        setPendingProductToAdd(null);
                                        setPendingQueueUpdate(null);
                                    }}
                                    className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Cambiar a Mixto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── TABLA ──────────────────────────────────────────────── */}
                <div className="flex flex-col flex-1 overflow-hidden">

                    <div className="overflow-x-auto">

                        <div className="min-w-150">

                            <div
                                className="grid px-7 py-3"
                                style={{
                                    gridTemplateColumns: "1fr 90px 130px 130px 48px",
                                    backgroundColor: "#f9fafb",
                                    borderBottom: "1px solid #f3f4f6"
                                }}
                            >
                                {["Producto", "Cant.", "Precio unit.", "Subtotal", ""].map((h, i) => (
                                    <p
                                        key={i}
                                        className="text-xs font-semibold text-gray-400"
                                        style={{
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            textAlign: i === 0 ? "left" : "right"
                                        }}
                                    >
                                        {h}
                                    </p>
                                ))}
                            </div>

                            <div className="overflow-y-auto" style={{ maxHeight: "60vh", minHeight: "240px" }}>
                                {queue.length > 0 ? queue.map((item, index) => (

                                    <div
                                        key={item.id}
                                        className="grid px-7 py-3.5 items-center"
                                        style={{
                                            gridTemplateColumns: "1fr 90px 130px 130px 48px",
                                            borderBottom: "1px solid #f9fafb"
                                        }}
                                    >

                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg"
                                                style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>
                                                {index + 1}
                                            </span>

                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                {item.nombre}
                                            </p>
                                        </div>

                                        <div className="flex justify-end items-center gap-2">
                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, -1)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition">
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => handleSetQuantity(item.id, e.target.value)}
                                                onBlur={() => handleBlurQuantity(item.id)}
                                                className="text-sm font-semibold text-center w-12 py-0.5 rounded-lg border border-transparent focus:border-yellow-400 focus:bg-white focus:outline-none transition"
                                                style={{ backgroundColor: "#fef9c3", color: "#a16207" }}
                                            />
                                            <button type="button" onClick={() => handleUpdateQuantity(item.id, 1)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition">
                                                +
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-400 text-right">
                                            {fmt(item.precio)}
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700 text-right">
                                            {fmt(item.precio * (Number(item.cantidad) || 0))}
                                        </p>

                                        <div className="flex justify-end">
                                            <button onClick={() => handleRemoveFromQueue(item.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                    </div>

                                )) : (
                                    <div className="py-10 text-center text-gray-400">
                                        Añade productos
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── FOOTER ─────────────────────────────────────────────── */}
                <div className="px-7 py-4 flex flex-col gap-3" style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                    {queue.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total en cola ({totalItems} {totalItems === 1 ? "ítem" : "ítems"}):</span>
                            <span className="text-base font-extrabold text-gray-900">{fmt(totalValue)}</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium rounded-xl transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                            style={{ backgroundColor: "#e5e7eb", border: "none" }}>
                            Cancelar
                        </button>

                        <button type="button" onClick={handleConfirm} disabled={queue.length === 0 || isExceedingQuota}
                            className="px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-all btn-confirm"
                            style={{
                                backgroundColor: (queue.length === 0 || isExceedingQuota) ? "#e5e7eb" : "#facc15",
                                color: (queue.length === 0 || isExceedingQuota) ? "#9ca3af" : "#1f2937",
                                cursor: (queue.length === 0 || isExceedingQuota) ? "not-allowed" : "pointer",
                                border: "none",
                                boxShadow: (queue.length > 0 && !isExceedingQuota) ? "0 4px 14px rgba(250,204,21,0.35)" : "none",
                            }}>
                            <CheckCircle size={15} />
                            {isExceedingQuota ? "Cupo excedido" : confirmText}
                            {queue.length > 0 && !isExceedingQuota && (
                                <span className="ml-1 px-2 py-0.5 rounded-md text-xs font-bold"
                                    style={{ backgroundColor: "rgba(0,0,0,0.1)", color: "#1f2937" }}>
                                    {queue.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes rowIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
 
                .btn-add:not(:disabled):hover     { background-color: #fde047 !important; }
                .btn-confirm:not(:disabled):hover { background-color: #fde047 !important; }
                .btn-page:not(:disabled):hover    { background-color: #f9fafb !important; }
                .btn-row-product:hover            { background-color: #f9fafb !important; }
                .btn-row-queue:hover              { background-color: #fafafa !important; }
                .btn-row-delete:hover             { background-color: #fef2f2 !important; color: #ef4444 !important; }
            `}</style>
        </div>
    );
}