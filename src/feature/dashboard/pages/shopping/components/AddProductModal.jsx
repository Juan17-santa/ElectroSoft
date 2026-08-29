import { useState, useEffect, useMemo, useRef } from "react";
import { X, Box, Boxes, DollarSign, Plus, AlertCircle, CheckCircle2, TrendingUp, Tag, Info, Search, ChevronDown, ChevronLeft, ChevronRight, Trash2, ShoppingBag } from "lucide-react";
import { formatCOP, parseCOP, blockInvalidKeys } from "../helpers/shoppingHelpers";
import CreateProductModal from "./CreateProductModal";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Pagination from "../../../components/ui/Pagination";
import { ServicesShopping } from "../services/ServicesShopping";

function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${estado.valido ? "text-green-500" : "text-red-500"}`} style={{ minHeight: "16px" }}>
            {estado.valido ? <><CheckCircle2 size={12} /><span>Listo</span></> : <><AlertCircle size={12} /><span>{estado.mensaje}</span></>}
        </div>
    );
}

// Quita cualquier caracter que no sea dígito y elimina ceros a la izquierda
// (para que al escribir "1" sobre un campo que arrancó en "0" quede "1" y no "01")
const sanitizeMoneyDigits = (value) => value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");

const RESULTS_PER_PAGE = 5;
const PRODUCTOS_PER_PAGE = 3;

export default function AddProductModal({ onClose, onCargarCompra, productosYaAgregados = [] }) {
    const [productosList, setProductosList] = useState([]);
    const [productsError, setProductsError] = useState("");
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);

    const [modalProducto, setModalProducto] = useState("");
    const [modalCantidad, setModalCantidad] = useState("");
    const [modalPrecio, setModalPrecio] = useState("");
    const [modalCosteProducto, setModalCosteProducto] = useState("");
    const [modalPrecioVenta, setModalPrecioVenta] = useState("");
    const [seleccionPrecio, setSeleccionPrecio] = useState("wac");

    const [tocados, setTocados] = useState({ producto: false, cantidad: false, precio: false, costeProducto: false, precioVenta: false });
    const [productosModal, setProductosModal] = useState(productosYaAgregados);
    const [productSearch, setProductSearch] = useState("");
    const [showProductResults, setShowProductResults] = useState(false);
    const [resultPage, setResultPage] = useState(1);
    const [productPage, setProductPage] = useState(1);

    const productDropdownRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        setProductsError("");
        ServicesShopping.fetchProducts()
            .then((data) => {
                if (mounted) setProductosList(data.filter((p) => p.estado !== false));
            })
            .catch((err) => {
                if (mounted) {
                    setProductosList([]);
                    setProductsError(err.message || "No se pudieron cargar los productos.");
                }
            });
        return () => {
            mounted = false;
        };
    }, []);

    // Cerrar el dropdown de búsqueda al hacer click fuera de él
    useEffect(() => {
        const handler = (e) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
                setShowProductResults(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const productoSeleccionado = productosList.find((p) => String(p.id) === String(modalProducto));
    const productoYaAgregado = productosModal.find((p) => String(p.id) === String(modalProducto));
    const productosFiltrados = productosList.filter((product) => {
        const search = productSearch.trim().toLowerCase();
        if (!search) return true;
        return `${product.nombre} ${product.serial || ""}`.toLowerCase().includes(search);
    });

    const totalResultPages = Math.max(1, Math.ceil(productosFiltrados.length / RESULTS_PER_PAGE));
    const paginatedResultados = productosFiltrados.slice(
        (resultPage - 1) * RESULTS_PER_PAGE,
        resultPage * RESULTS_PER_PAGE
    );
    const resultPageNumbers = Array.from({ length: totalResultPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalResultPages || Math.abs(p - resultPage) <= 1)
        .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
        }, []);

    const wacCalculado = useMemo(() => {
        if (!productoSeleccionado || !modalPrecioVenta || !modalCantidad) return null;
        const precioVenta = parseCOP(modalPrecioVenta);
        const cantidad = parseInt(modalCantidad) || 0;
        const stockAnt = productoSeleccionado.stock ?? 0;
        const precioAct = productoSeleccionado.precio ?? 0;
        if (precioVenta <= 0 || cantidad <= 0) return null;
        return ServicesShopping.calculateWac({
            stockAnterior: stockAnt,
            precioAnterior: precioAct,
            cantidad,
            precioVenta,
        });
    }, [productoSeleccionado, modalPrecioVenta, modalCantidad]);

    const mostrarSeleccionPrecio = wacCalculado !== null && wacCalculado !== parseCOP(modalPrecioVenta);

    useEffect(() => { if (!mostrarSeleccionPrecio) setSeleccionPrecio("wac"); }, [mostrarSeleccionPrecio]);

    const handleSelectProducto = (id) => {
        setModalProducto(id);
        setTocados((t) => ({ ...t, producto: true }));
        const found = productosList.find((p) => String(p.id) === String(id));
        const yaExiste = productosModal.find((p) => String(p.id) === String(id));
        setProductSearch(found?.nombre || "");
        setShowProductResults(false);
        if (yaExiste) {
            setModalPrecio(String(found?.precio ?? ""));
            setModalCantidad(String(yaExiste.cantidad));
            setModalCosteProducto(String(yaExiste.costeProducto));
            // Al re-editar, mostrar el precio original ingresado (no el WAC aplicado),
            // ya que el modal necesita el valor real para recalcular el WAC correctamente.
            setModalPrecioVenta(String(yaExiste.precioVentaOriginal ?? yaExiste.precioVenta));
            setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });
        } else if (found?.isNew) {
            setModalPrecio("0");
            setModalCosteProducto("");
            setModalPrecioVenta("");
            setModalCantidad("");
            setTocados((t) => ({ ...t, producto: true }));
        } else if (found) {
            setModalPrecio(String(found.precio));
            setModalCosteProducto("0");
            setModalPrecioVenta("");
            setModalCantidad("");
            setTocados((t) => ({ ...t, producto: true }));
        } else {
            setModalPrecio(""); setModalCosteProducto(""); setModalPrecioVenta(""); setModalCantidad("");
        }
    };

    const validarProducto = (v) => !v ? { valido: false, mensaje: "Selecciona un producto." } : { valido: true, mensaje: "" };
    const validarCantidad = (v) => { if (!v) return { valido: false, mensaje: "Ingresa la cantidad." }; if (isNaN(parseInt(v)) || parseInt(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; if (parseInt(v) > 9999) return { valido: false, mensaje: "Máximo 9999." }; return { valido: true, mensaje: "" }; };
    const validarPrecio = (v) => { if (!v) return { valido: false, mensaje: "El precio es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; return { valido: true, mensaje: "" }; };
    const validarCosteProducto = (v) => { if (!v) return { valido: false, mensaje: "El coste es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; return { valido: true, mensaje: "" }; };
    const validarPrecioVenta = (v) => { if (!v) return { valido: false, mensaje: "El precio de venta es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; if (parseCOP(v) <= parseCOP(modalCosteProducto)) return { valido: false, mensaje: "Debe ser mayor al coste." }; return { valido: true, mensaje: "" }; };

    const estadoProducto = tocados.producto ? validarProducto(modalProducto) : null;
    const estadoCantidad = tocados.cantidad ? validarCantidad(modalCantidad) : null;
    const estadoCosteProducto = tocados.costeProducto ? validarCosteProducto(modalCosteProducto) : null;
    const estadoPrecioVenta = tocados.precioVenta ? validarPrecioVenta(modalPrecioVenta) : null;

    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

    // Color del indicador de stock, reutilizado en el dropdown y en el resumen del producto elegido
    const stockDotColor = (stock) => (stock > 20 ? "#16a34a" : stock > 0 ? "#ca8a04" : "#dc2626");
    const stockBadgeStyle = (stock) => ({
        backgroundColor: stock > 20 ? "#f0fdf4" : stock > 0 ? "#fffbeb" : "#fef2f2",
        color: stock > 20 ? "#16a34a" : stock > 0 ? "#ca8a04" : "#dc2626",
    });

    const ring = (estado) => {
        if (estado === null) return "focus:ring-gray-400";
        return estado.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300";
    };

    const handleSubmit = () => {
        setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });
        const esNuevo = productoSeleccionado?.isNew;
        if (!validarProducto(modalProducto).valido || !validarCantidad(modalCantidad).valido || (!esNuevo && !validarPrecio(modalPrecio).valido) || !validarCosteProducto(modalCosteProducto).valido || !validarPrecioVenta(modalPrecioVenta).valido) return;
        const found = productosList.find((p) => String(p.id) === String(modalProducto));
        const sobreescribirConSugerido = mostrarSeleccionPrecio && seleccionPrecio === "sugerido";
        const precioVentaOriginal = parseCOP(modalPrecioVenta);

        // Si el usuario eligió WAC, el precio que se aplicará al inventario es el WAC;
        // si eligió sugerido (o no había selección), es el precio que ingresó manualmente.
        const precioVentaAplicado = mostrarSeleccionPrecio && seleccionPrecio === "wac"
            ? wacCalculado
            : precioVentaOriginal;

        const productoParaGuardar = {
            id: found?.id ?? Date.now(),
            nombre: found?.nombre ?? modalProducto,
            cantidad: parseInt(modalCantidad),
            precio: parseCOP(modalPrecio),
            costeProducto: parseCOP(modalCosteProducto),
            precioVenta: precioVentaAplicado,
            precioVentaOriginal,   // Se envía al backend como salePrice (necesario para la fórmula WAC)
            subtotal: parseInt(modalCantidad) * parseCOP(modalCosteProducto),
            sobreescribirConSugerido,
            esActualizacion: !!productoYaAgregado,
            isNew: found?.isNew || false,
            stock: found?.stock ?? 0,
            categoriaId: found?.categoriaId,
            serial: found?.serial,
            garantia: found?.garantia,
            tipoStock: found?.tipoStock,
            caracteristicas: found?.caracteristicas,
        };

        setProductosModal((prev) => {
            const next = prev.filter((item) => String(item.id) !== String(productoParaGuardar.id));
            return [...next, productoParaGuardar];
        });
        setModalProducto("");
        setModalCantidad("");
        setModalPrecio("");
        setModalCosteProducto("");
        setModalPrecioVenta("");
        setSeleccionPrecio("wac");
        setProductSearch("");
        setShowProductResults(false);
        setTocados({ producto: false, cantidad: false, precio: false, costeProducto: false, precioVenta: false });
    };

    const updateModalQuantity = (id, quantity) => {
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        setProductosModal((prev) => prev.map((item) => String(item.id) === String(id)
            ? { ...item, cantidad: safeQuantity, subtotal: safeQuantity * Number(item.costeProducto || 0) }
            : item));
    };

    const removeModalProduct = (id) => {
        setProductosModal((prev) => prev.filter((item) => String(item.id) !== String(id)));
    };

    const totalModal = productosModal.reduce((total, item) => total + Number(item.subtotal || 0), 0);

    const totalProductPages = Math.max(1, Math.ceil(productosModal.length / PRODUCTOS_PER_PAGE));
    const productActual = Math.min(productPage, totalProductPages);
    const paginatedProductosModal = productosModal.slice((productActual - 1) * PRODUCTOS_PER_PAGE, productActual * PRODUCTOS_PER_PAGE);

    return (
        <>
            {/* OVERLAY global — cubre toda la ventana incluido navbar y sidebar */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

            {/* Modal centrado respecto a toda la ventana */}
            <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none overflow-y-auto pt-4 pb-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl pointer-events-auto border border-gray-300 my-auto mx-4" onClick={(e) => e.stopPropagation()}>

                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-black">
                                <ShoppingBag size={35} className="bg-yellow-400 p-2 rounded-lg" />
                                <p className="text-base font-semibold">
                                    {productoYaAgregado ? <>Actualizar producto en la compra</> : <>Añadir producto a la compra</>}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {productoYaAgregado ? "Modifica los valores y confirma para actualizar." : "Complete todos los campos del formulario."}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"><X size={18} /></button>
                    </div>

                    {/* FILA 1 — Producto, botón crear y Cantidad */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_auto_minmax(160px,0.55fr)] gap-x-4 gap-y-4 items-start">

                        {/* PRODUCTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Box size={18} /><span>Producto *</span></div>
                            <div className="relative" ref={productDropdownRef}>
                                <div className="flex items-center gap-2 bg-gray-200 rounded-xl px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-yellow-400">
                                    <Search size={17} className="text-gray-500 shrink-0" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(event) => {
                                            setProductSearch(event.target.value);
                                            setShowProductResults(true);
                                            setResultPage(1);
                                            if (!event.target.value) setModalProducto("");
                                        }}
                                        onFocus={() => setShowProductResults(true)}
                                        placeholder="Buscar por nombre o serial..."
                                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-500"
                                    />
                                    {productSearch && (
                                        <button type="button" onClick={() => { setProductSearch(""); setModalProducto(""); setShowProductResults(true); setResultPage(1); }} className="text-gray-400 hover:text-red-500 shrink-0">
                                            <X size={16} />
                                        </button>
                                    )}
                                    <ChevronDown
                                        size={16}
                                        className="text-gray-500 shrink-0 transition-transform"
                                        style={{ transform: showProductResults ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </div>

                                {/* ── DROPDOWN DE RESULTADOS ─────────────────────────── */}
                                {showProductResults && (
                                    <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white overflow-hidden"
                                        style={{
                                            borderRadius: "12px", border: "1.5px solid #facc15",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
                                        }}>

                                        {/* Cabecera columnas */}
                                        <div className="grid px-4 py-2 grid-cols-[1fr_110px_100px]"
                                            style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
                                            <p className="text-xs font-semibold text-yellow-600">Nombre producto</p>
                                            <p className="text-xs font-semibold text-yellow-600 text-right">Stock</p>
                                            <p className="text-xs font-semibold text-yellow-600 text-right">Precio ref.</p>
                                        </div>

                                        {/* Filas paginadas */}
                                        <div className="max-h-64 overflow-y-auto">
                                            {paginatedResultados.length > 0 ? paginatedResultados.map((product) => {
                                                const stock = product.stock ?? 0;
                                                const enCompra = productosModal.find((p) => String(p.id) === String(product.id));
                                                const isSelected = String(modalProducto) === String(product.id);
                                                return (
                                                    <button key={product.id} type="button"
                                                        onClick={() => handleSelectProducto(String(product.id))}
                                                        className={`w-full grid px-4 py-2.5 text-left grid-cols-[1fr_110px_100px] hover:bg-yellow-50 transition-colors ${isSelected ? "bg-yellow-50" : ""}`}
                                                        style={{ borderBottom: "1px solid #f9fafb" }}>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-medium text-gray-700 truncate">{product.nombre}</span>
                                                            {enCompra && (
                                                                <span className="w-fit mt-0.5 font-semibold px-1.5 py-0.5 rounded"
                                                                    style={{ backgroundColor: "#fef9c3", color: "#a16207", fontSize: "10px" }}>
                                                                    En la compra
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end items-center gap-1">
                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0" style={stockBadgeStyle(stock)}>
                                                                {stock}
                                                            </span>
                                                            {enCompra && (
                                                                <span className="text-xs font-bold text-green-600 shrink-0">
                                                                    (+{enCompra.cantidad})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-500 text-right self-center tabular-nums">
                                                            {fmt(product.precio ?? 0)}
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
                                        {totalResultPages > 1 && (
                                            <div className="flex items-center justify-between px-4 py-2.5"
                                                style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                                                <p className="text-xs text-gray-400">Página {resultPage} de {totalResultPages}</p>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" disabled={resultPage === 1}
                                                        onClick={() => setResultPage((p) => p - 1)}
                                                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-30 bg-white hover:bg-gray-50"
                                                        style={{ border: "1px solid #e5e7eb" }}>
                                                        <ChevronLeft size={13} className="text-gray-500" />
                                                    </button>

                                                    {resultPageNumbers.map((p, idx) =>
                                                        p === "..." ? (
                                                            <span key={`dots-${idx}`} className="text-xs text-gray-400 px-1">…</span>
                                                        ) : (
                                                            <button key={p} type="button" onClick={() => setResultPage(p)}
                                                                className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-50"
                                                                style={{
                                                                    backgroundColor: resultPage === p ? "#facc15" : "white",
                                                                    color: resultPage === p ? "#1f2937" : "#6b7280",
                                                                    border: resultPage === p ? "1px solid #facc15" : "1px solid #e5e7eb",
                                                                }}>{p}</button>
                                                        )
                                                    )}

                                                    <button type="button" disabled={resultPage === totalResultPages}
                                                        onClick={() => setResultPage((p) => p + 1)}
                                                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-30 bg-white hover:bg-gray-50"
                                                        style={{ border: "1px solid #e5e7eb" }}>
                                                        <ChevronRight size={13} className="text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Resumen compacto del producto elegido: ● Nombre (stock unds) (precio) */}
                            {productoSeleccionado && (
                                <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stockDotColor(productoSeleccionado.stock ?? 0) }} />
                                    <p className="text-xs font-medium text-gray-700 truncate">
                                        {productoSeleccionado.nombre}
                                        <span className="text-gray-400 font-normal"> ({productoSeleccionado.stock ?? 0} unds)</span>
                                        <span className="text-gray-400 font-normal"> ({fmt(productoSeleccionado.precio ?? 0)})</span>
                                    </p>
                                </div>
                            )}

                            <FieldStatus estado={estadoProducto} />
                            {productsError && <p className="text-xs text-red-500">{productsError}</p>}
                        </div>

                        {/* BOTÓN CREAR PRODUCTO — entre el buscador y la cantidad */}
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-semibold opacity-0 select-none hidden lg:block">.</label>
                            <button type="button" onClick={() => setShowCreateProductModal(true)}
                                title="Crear producto nuevo"
                                className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 transition rounded-xl shadow-md cursor-pointer shrink-0 w-full lg:w-11.5 h-11.5">
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>

                        {/* CANTIDAD */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Boxes size={18} /><span>Cantidad *</span></div>
                            <input type="number" min="1" placeholder="Cuánto?" value={modalCantidad}
                                onChange={(e) => { setModalCantidad(e.target.value); setTocados((t) => ({ ...t, cantidad: true })); }}
                                onKeyDown={blockInvalidKeys}
                                onBlur={() => setTocados((t) => ({ ...t, cantidad: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoCantidad)}`} />
                            <FieldStatus estado={estadoCantidad} />
                        </div>

                    </div>

                    {/* FILA 2 — campos de precio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mt-4">

                        {/* COSTE COMPRA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><DollarSign size={16} /><span>Coste de compra *</span></div>
                            <input type="text" inputMode="numeric" placeholder="precio proveedor" maxLength="15"
                                value={modalCosteProducto ? formatCOP(parseCOP(modalCosteProducto)) : ""}
                                onChange={(e) => {
                                    const raw = sanitizeMoneyDigits(e.target.value);
                                    setModalCosteProducto(raw);
                                    setTocados((t) => ({ ...t, costeProducto: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, costeProducto: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoCosteProducto)}`} />
                            <FieldStatus estado={estadoCosteProducto} />
                        </div>

                        {/* PRECIO VENTA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium"><DollarSign size={16} className="text-blue-400" /><span className="text-blue-400">Precio de venta *</span></div>
                            <input type="text" inputMode="numeric" placeholder="Mayor al coste" maxLength="15"
                                value={modalPrecioVenta ? formatCOP(parseCOP(modalPrecioVenta)) : ""}
                                onChange={(e) => {
                                    const raw = sanitizeMoneyDigits(e.target.value);
                                    setModalPrecioVenta(raw);
                                    setTocados((t) => ({ ...t, precioVenta: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, precioVenta: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoPrecioVenta)}`} />
                            <FieldStatus estado={estadoPrecioVenta} />
                        </div>

                    </div>

                    {/* SELECCIÓN WAC — aparece cuando WAC ≠ precioVenta y el producto ya existe */}
                    {mostrarSeleccionPrecio && !productoSeleccionado?.isNew && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={14} className="text-yellow-500" />
                                <p className="text-xs font-medium text-gray-600">
                                    El precio de venta difiere del promedio calculado (WAC). ¿Con cuál actualizas el inventario?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button type="button" onClick={() => setSeleccionPrecio("wac")}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${seleccionPrecio === "wac" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"}`}>
                                    {seleccionPrecio === "wac" && <CheckCircle2 size={13} className="absolute top-2 right-2 text-blue-500" />}
                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide"><Info size={10} />Precio promedio (WAC)</span>
                                    <span className="text-base font-bold text-blue-600">{fmt(wacCalculado)}</span>
                                    <span className="text-xs text-gray-400 leading-tight">Calculado con el inventario actual</span>
                                </button>
                                <button type="button" onClick={() => setSeleccionPrecio("sugerido")}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${seleccionPrecio === "sugerido" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/30"}`}>
                                    {seleccionPrecio === "sugerido" && <CheckCircle2 size={13} className="absolute top-2 right-2 text-yellow-500" />}
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide"><Tag size={10} />Precio sugerido</span>
                                        {(() => { const d = parseCOP(modalPrecioVenta) - wacCalculado; return <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${d > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{d > 0 ? "▲" : "▼"} {fmt(Math.abs(d))}</span>; })()}
                                    </div>
                                    <span className="text-base font-bold text-yellow-600">{fmt(parseCOP(modalPrecioVenta))}</span>
                                    <span className="text-xs text-gray-400 leading-tight">Ingresado en esta compra</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PREVISUALIZACIÓN */}
                    {modalCantidad && modalCosteProducto && modalPrecioVenta && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-gray-700 flex items-center justify-between">
                            <span><span className="font-medium">Subtotal compra: </span><span className="font-semibold text-gray-900">{formatCOP((parseInt(modalCantidad) || 0) * parseCOP(modalCosteProducto))}</span></span>
                            <span><span className="font-medium">Margen unitario: </span><span className="font-semibold text-green-600">{formatCOP(parseCOP(modalPrecioVenta) - parseCOP(modalCosteProducto))}</span></span>
                        </div>
                    )}

                    {productosModal.length > 0 && (
                        <>
                            <div className="mt-5 border border-gray-200 rounded-xl overflow-x-auto">
                                <table className="w-full min-w-125 text-xs">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Producto</th>
                                            <th className="px-3 py-2 text-center">Cantidad</th>
                                            <th className="px-3 py-2 text-right">Coste</th>
                                            <th className="px-3 py-2 text-right">Precio venta</th>
                                            <th className="px-3 py-2 text-right">Subtotal</th>
                                            <th className="px-3 py-2 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProductosModal.map((producto) => (
                                            <tr key={producto.id} className="border-t border-gray-100">
                                                <td className="px-3 py-2 font-medium text-gray-700">{producto.nombre}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button type="button" onClick={() => updateModalQuantity(producto.id, producto.cantidad - 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">-</button>
                                                        <span className="w-7 text-center font-semibold">{producto.cantidad}</span>
                                                        <button type="button" onClick={() => updateModalQuantity(producto.id, producto.cantidad + 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right">{fmt(producto.costeProducto)}</td>
                                                <td className="px-3 py-2 text-right">{fmt(producto.precioVenta)}</td>
                                                <td className="px-3 py-2 text-right font-semibold">{fmt(producto.subtotal)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <button type="button" onClick={() => removeModalProduct(producto.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Eliminar producto">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-gray-200 bg-gray-100">
                                        <tr>
                                            <td colSpan="4" className="px-3 py-2 text-right font-semibold text-gray-700">Total de la compra:</td>
                                            <td className="px-3 py-2 text-right font-bold text-green-600">{fmt(totalModal)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            {totalProductPages > 1 && (
                                <div className="flex justify-end mt-3">
                                    <Pagination currentPage={productActual} totalPages={totalProductPages} onPageChange={setProductPage} />
                                </div>
                            )}
                        </>
                    )}

                    {/* BOTONES */}
                    <div className="flex justify-between items-center gap-3 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer">Cancelar</button>
                        <div className="flex gap-2">
                            <PrimaryButton onClick={handleSubmit}>{productoYaAgregado ? "Actualizar" : "Añadir"}</PrimaryButton>
                            {onCargarCompra && (
                                <PrimaryButton onClick={() => onCargarCompra(productosModal)} disabled={productosModal.length === 0}>
                                    Cargar compra
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCreateProductModal && (
                <CreateProductModal
                    onClose={() => setShowCreateProductModal(false)}
                    onSuccess={(nuevoProducto) => {
                        setProductosList((prev) => [...prev, nuevoProducto]);
                        setModalProducto(String(nuevoProducto.id));
                        setModalPrecio("0");
                        setModalCosteProducto("");
                        setModalPrecioVenta("");
                        setModalCantidad("");
                    }}
                />
            )}
        </>
    );
}