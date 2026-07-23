import { useState, useEffect, useMemo } from "react";
import { X, Box, Boxes, DollarSign, Plus, AlertCircle, CheckCircle2, TrendingUp, Tag, Info } from "lucide-react";
import { formatCOP, parseCOP, blockInvalidKeys } from "../helpers/shoppingHelpers";
import CreateProductModal from "./CreateProductModal";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import CustomSelect from "../../../components/ui/CustomSelect";
import { ServicesShopping } from "../services/ServicesShopping";

function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${estado.valido ? "text-green-500" : "text-red-500"}`} style={{ minHeight: "16px" }}>
            {estado.valido ? <><CheckCircle2 size={12} /><span>Listo</span></> : <><AlertCircle size={12} /><span>{estado.mensaje}</span></>}
        </div>
    );
}

export default function AddProductModal({ onClose, onAnadir, productosYaAgregados = [] }) {
    const [productosList, setProductosList] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productsError, setProductsError] = useState("");
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);

    const [modalProducto,      setModalProducto]      = useState("");
    const [modalCantidad,      setModalCantidad]      = useState("");
    const [modalPrecio,        setModalPrecio]        = useState("");
    const [modalCosteProducto, setModalCosteProducto] = useState("");
    const [modalPrecioVenta,   setModalPrecioVenta]   = useState("");
    const [seleccionPrecio,    setSeleccionPrecio]    = useState("wac");

    const [tocados, setTocados] = useState({ producto: false, cantidad: false, precio: false, costeProducto: false, precioVenta: false });
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoadingProducts(true);
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
            })
            .finally(() => {
                if (mounted) setLoadingProducts(false);
            });
        return () => {
            mounted = false;
        };
    }, [showCreateProductModal]);

    const productoSeleccionado = productosList.find((p) => String(p.id) === String(modalProducto));
    const productoYaAgregado   = productosYaAgregados.find((p) => String(p.id) === String(modalProducto) && !p.anulado);

    const wacCalculado = useMemo(() => {
        if (!productoSeleccionado || !modalPrecioVenta || !modalCantidad) return null;
        const precioVenta = parseCOP(modalPrecioVenta);
        const cantidad    = parseInt(modalCantidad) || 0;
        const stockAnt    = productoSeleccionado.stock ?? 0;
        const precioAct   = productoSeleccionado.precio ?? 0;
        const stockNuevo  = stockAnt + cantidad;
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
        const found    = productosList.find((p) => String(p.id) === String(id));
        const yaExiste = productosYaAgregados.find((p) => String(p.id) === String(id) && !p.anulado);
        if (yaExiste) {
            setModalPrecio(String(found?.precio ?? ""));
            setModalCantidad(String(yaExiste.cantidad));
            setModalCosteProducto(String(yaExiste.costeProducto));
            // Al re-editar, mostrar el precio original ingresado (no el WAC aplicado),
            // ya que el modal necesita el valor real para recalcular el WAC correctamente.
            setModalPrecioVenta(String(yaExiste.precioVentaOriginal ?? yaExiste.precioVenta));
            setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });
        } else if (found) {
            setModalPrecio(String(found.precio));
            setModalCosteProducto(String(found.precio));
            setModalPrecioVenta("");
            setModalCantidad("");
            setTocados((t) => ({ ...t, producto: true }));
        } else {
            setModalPrecio(""); setModalCosteProducto(""); setModalPrecioVenta(""); setModalCantidad("");
        }
    };

    const validarProducto      = (v) => !v ? { valido: false, mensaje: "Selecciona un producto." } : { valido: true, mensaje: "" };
    const validarCantidad      = (v) => { if (!v) return { valido: false, mensaje: "Ingresa la cantidad." }; if (isNaN(parseInt(v)) || parseInt(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; if (parseInt(v) > 9999) return { valido: false, mensaje: "Máximo 9999." }; return { valido: true, mensaje: "" }; };
    const validarPrecio        = (v) => { if (!v) return { valido: false, mensaje: "El precio es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; return { valido: true, mensaje: "" }; };
    const validarCosteProducto = (v) => { if (!v) return { valido: false, mensaje: "El coste es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; return { valido: true, mensaje: "" }; };
    const validarPrecioVenta   = (v) => { if (!v) return { valido: false, mensaje: "El precio de venta es obligatorio." }; if (parseCOP(v) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; if (parseCOP(v) <= parseCOP(modalCosteProducto)) return { valido: false, mensaje: "Debe ser mayor al coste." }; return { valido: true, mensaje: "" }; };

    const estadoProducto      = tocados.producto      ? validarProducto(modalProducto)           : null;
    const estadoCantidad      = tocados.cantidad      ? validarCantidad(modalCantidad)            : null;
    const estadoPrecio        = tocados.precio        ? validarPrecio(modalPrecio)                : null;
    const estadoCosteProducto = tocados.costeProducto ? validarCosteProducto(modalCosteProducto) : null;
    const estadoPrecioVenta   = tocados.precioVenta   ? validarPrecioVenta(modalPrecioVenta)      : null;

    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

    const ring = (estado) => {
        if (estado === null) return "focus:ring-gray-400";
        return estado.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300";
    };

    const handleSubmit = () => {
        setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });
        if (!validarProducto(modalProducto).valido || !validarCantidad(modalCantidad).valido || !validarPrecio(modalPrecio).valido || !validarCosteProducto(modalCosteProducto).valido || !validarPrecioVenta(modalPrecioVenta).valido) return;
        const found         = productosList.find((p) => String(p.id) === String(modalProducto));
        const sobreescribirConSugerido = mostrarSeleccionPrecio && seleccionPrecio === "sugerido";
        const precioVentaOriginal = parseCOP(modalPrecioVenta);

        // Si el usuario eligió WAC, el precio que se aplicará al inventario es el WAC;
        // si eligió sugerido (o no había selección), es el precio que ingresó manualmente.
        const precioVentaAplicado = mostrarSeleccionPrecio && seleccionPrecio === "wac"
            ? wacCalculado
            : precioVentaOriginal;

        onAnadir({
            id:                    found?.id ?? Date.now(),
            nombre:                found?.nombre ?? modalProducto,
            cantidad:              parseInt(modalCantidad),
            precio:                parseCOP(modalPrecio),
            costeProducto:         parseCOP(modalCosteProducto),
            precioVenta:           precioVentaAplicado,
            precioVentaOriginal,   // Se envía al backend como salePrice (necesario para la fórmula WAC)
            subtotal:              parseInt(modalCantidad) * parseCOP(modalCosteProducto),
            sobreescribirConSugerido,
            esActualizacion:       !!productoYaAgregado,
        });
    };

    return (
        <>
            {/* OVERLAY global — cubre toda la ventana incluido navbar y sidebar */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

            {/* Modal centrado respecto a toda la ventana */}
            <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none overflow-y-auto pt-4 pb-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl pointer-events-auto border border-gray-300 my-auto mx-4" onClick={(e) => e.stopPropagation()}>

                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-base font-semibold">
                                {productoYaAgregado ? <>Actualizar <span className="text-yellow-400">producto</span> en la compra</> : <>Añadir <span className="text-yellow-400">producto</span> a la compra</>}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {productoYaAgregado ? "Modifica los valores y confirma para actualizar." : "Complete todos los campos del formulario."}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"><X size={18} /></button>
                    </div>

                    {/* FILA 1 — Producto y Cantidad */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                        {/* PRODUCTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Box size={18} /><span>Producto *</span></div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <CustomSelect
                                        options={productosList.map(p => ({ value: String(p.id), label: p.nombre }))}
                                        value={String(modalProducto)}
                                        onChange={(val) => { handleSelectProducto(val); }}
                                        placeholder={"Elige un producto..."}
                                    />
                                </div>
                                <button type="button" onClick={() => setShowCreateProductModal(true)} className="bg-yellow-400 hover:bg-yellow-500 transition p-3 rounded-xl shadow-md cursor-pointer flex-shrink-0">
                                    <Plus size={18} className="text-white" />
                                </button>
                            </div>
                            <FieldStatus estado={estadoProducto} />
                            {productsError && <p className="text-xs text-red-500">{productsError}</p>}
                        </div>

                        {/* CANTIDAD */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Boxes size={18} /><span>Cantidad *</span></div>
                            <input type="number" min="1" placeholder="Unidades a comprar" value={modalCantidad}
                                onChange={(e) => { setModalCantidad(e.target.value); setTocados((t) => ({ ...t, cantidad: true })); }}
                                onKeyDown={blockInvalidKeys}
                                onBlur={() => setTocados((t) => ({ ...t, cantidad: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoCantidad)}`} />
                            {productoSeleccionado && (
                                <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs bg-gray-50 border border-gray-200">
                                    <span className="text-gray-500">Stock en inventario:</span>
                                    <span className="font-bold text-gray-700">{productoSeleccionado.stock} unidades</span>
                                </div>
                            )}
                            <FieldStatus estado={estadoCantidad} />
                        </div>

                    </div>

                    {/* FILA 2 — 3 campos de precio en grid de 3 columnas */}
                    <div className="grid grid-cols-3 gap-x-5 gap-y-4 mt-4">

                        {/* PRECIO INVENTARIO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><DollarSign size={16} /><span>Precio inventario</span></div>
                            <input type="text" readOnly value={modalPrecio ? formatCOP(Number(modalPrecio)) : ""} placeholder="carga automatica"
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm cursor-not-allowed opacity-75" />
                            <p className="text-xs text-gray-400 -mt-1">Precio actual (referencia)</p>
                        </div>

                        {/* COSTE COMPRA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><DollarSign size={16} /><span>Coste de compra *</span></div>
                            <input type="text" min="1" placeholder="precio proveedor" maxLength="15"
                                value={focusedField === "costeProducto" ? modalCosteProducto : (modalCosteProducto ? formatCOP(parseCOP(modalCosteProducto)) : "")}
                                onFocus={() => setFocusedField("costeProducto")}
                                onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setModalCosteProducto(raw); setTocados((t) => ({ ...t, costeProducto: true })); }}
                                onBlur={() => { setFocusedField(null); setTocados((t) => ({ ...t, costeProducto: true })); }}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoCosteProducto)}`} />
                            <FieldStatus estado={estadoCosteProducto} />
                        </div>

                        {/* PRECIO VENTA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium"><DollarSign size={16} className="text-blue-400" /><span className="text-blue-400">Precio de venta *</span></div>
                            <input type="text" min="0" placeholder="Mayor al coste" maxLength="15"
                                value={focusedField === "precioVenta" ? modalPrecioVenta : (modalPrecioVenta ? formatCOP(parseCOP(modalPrecioVenta)) : "")}
                                onFocus={() => setFocusedField("precioVenta")}
                                onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setModalPrecioVenta(raw); setTocados((t) => ({ ...t, precioVenta: true })); }}
                                onBlur={() => { setFocusedField(null); setTocados((t) => ({ ...t, precioVenta: true })); }}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${ring(estadoPrecioVenta)}`} />
                            <FieldStatus estado={estadoPrecioVenta} />
                        </div>

                    </div>

                    {/* SELECCIÓN WAC — aparece cuando WAC ≠ precioVenta */}
                    {mostrarSeleccionPrecio && (
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

                    {/* BOTONES */}
                    <div className="flex justify-between mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer">Cancelar</button>
                        <PrimaryButton onClick={handleSubmit}>{productoYaAgregado ? "Actualizar producto" : "Añadir producto"}</PrimaryButton>
                    </div>
                </div>
            </div>

            {showCreateProductModal && (
                <CreateProductModal
                    onClose={() => setShowCreateProductModal(false)}
                    onSuccess={(nuevoProducto) => {
                        ServicesShopping.fetchProducts().then((data) => {
                            setProductosList(data.filter((p) => p.estado !== false));
                        });
                        setModalProducto(String(nuevoProducto.id));
                        setModalPrecio(String(nuevoProducto.precio));
                        setModalCosteProducto(String(nuevoProducto.precio));
                    }}
                />
            )}
        </>
    );
}