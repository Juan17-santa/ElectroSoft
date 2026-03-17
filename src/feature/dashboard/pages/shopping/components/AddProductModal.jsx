import { useState, useEffect, useMemo } from "react";
import { X, Box, Boxes, DollarSign, Plus, AlertCircle, CheckCircle2, TrendingUp, Tag, Info } from "lucide-react";
import { formatCOP, parseCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import CreateProductModal from "./CreateProductModal";
import PrimaryButton from "../../../components/ui/PrimaryButton";

// ─── Indicador de validación ──────────────────────────────────────────────────
function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div
            className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${
                estado.valido ? "text-green-500" : "text-red-500"
            }`}
            style={{ minHeight: "16px" }}
        >
            {estado.valido
                ? <><CheckCircle2 size={12} /><span>Listo</span></>
                : <><AlertCircle size={12} /><span>{estado.mensaje}</span></>
            }
        </div>
    );
}

export default function AddProductModal({ onClose, onAnadir, productosYaAgregados = [] }) {
    const [productosList, setProductosList] = useState([]);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);

    const [modalProducto,      setModalProducto]      = useState("");
    const [modalCantidad,      setModalCantidad]      = useState("");
    const [modalPrecio,        setModalPrecio]        = useState("");
    const [modalCosteProducto, setModalCosteProducto] = useState("");
    const [modalPrecioVenta,   setModalPrecioVenta]   = useState("");
    const [seleccionPrecio,    setSeleccionPrecio]    = useState("wac"); // "wac" | "sugerido"

    const [tocados, setTocados] = useState({
        producto: false, cantidad: false, precio: false,
        costeProducto: false, precioVenta: false,
    });

    // ─── Cargar productos ─────────────────────────────────────────────────────
    useEffect(() => {
        const data = ServicesProducts.get().filter((p) => p.estado !== false);
        setProductosList(data);
    }, [showCreateProductModal]);

    // ─── Producto seleccionado ────────────────────────────────────────────────
    const productoSeleccionado = productosList.find(
        (p) => String(p.id) === String(modalProducto)
    );

    // ─── ¿Ya fue agregado activo? ─────────────────────────────────────────────
    const productoYaAgregado = productosYaAgregados.find(
        (p) => String(p.id) === String(modalProducto) && !p.anulado
    );

    // ─── WAC calculado (derivado) ─────────────────────────────────────────────
    const wacCalculado = useMemo(() => {
        if (!productoSeleccionado || !modalPrecioVenta || !modalCantidad) return null;
        const precioVenta  = parseCOP(modalPrecioVenta);
        const cantidad     = parseInt(modalCantidad) || 0;
        const stockAnt     = productoSeleccionado.stock ?? 0;
        const precioActual = productoSeleccionado.precio ?? 0;
        const stockNuevo   = stockAnt + cantidad;
        if (precioVenta <= 0 || cantidad <= 0) return null;
        const wacExacto = stockAnt > 0
            ? (stockAnt * precioActual + cantidad * precioVenta) / stockNuevo
            : precioVenta;
        return Math.ceil(wacExacto / 100) * 100;
    }, [productoSeleccionado, modalPrecioVenta, modalCantidad]);

    // Si WAC === precioVenta no hace falta preguntar; mostrar las tarjetas solo cuando difieren
    const mostrarSeleccionPrecio =
        wacCalculado !== null && wacCalculado !== parseCOP(modalPrecioVenta);

    // Resetear selección cuando cambia el producto o ya no hace falta preguntar
    useEffect(() => {
        if (!mostrarSeleccionPrecio) setSeleccionPrecio("wac");
    }, [mostrarSeleccionPrecio]);

    // ─── Al seleccionar producto → autocargar precio (o pre-cargar si ya existe) ──
    const handleSelectProducto = (id) => {
        setModalProducto(id);
        setTocados((t) => ({ ...t, producto: true }));

        const found     = productosList.find((p) => String(p.id) === String(id));
        const yaExiste  = productosYaAgregados.find((p) => String(p.id) === String(id) && !p.anulado);

        if (yaExiste) {
            // Pre-cargar con los valores que ya tiene en la compra
            setModalPrecio(String(found?.precio ?? ""));
            setModalCantidad(String(yaExiste.cantidad));
            setModalCosteProducto(String(yaExiste.costeProducto));
            setModalPrecioVenta(String(yaExiste.precioVenta));
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

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarProducto = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona un producto." };
        return { valido: true, mensaje: "" };
    };
    const validarCantidad = (val) => {
        if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
        if (isNaN(parseInt(val)) || parseInt(val) <= 0)
            return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };
    const validarPrecio = (val) => {
        if (!val) return { valido: false, mensaje: "El precio es obligatorio." };
        if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };
    const validarCosteProducto = (val) => {
        if (!val) return { valido: false, mensaje: "El coste es obligatorio." };
        if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };
    const validarPrecioVenta = (val) => {
        if (!val) return { valido: false, mensaje: "El precio de venta es obligatorio." };
        if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        if (parseCOP(val) <= parseCOP(modalCosteProducto))
            return { valido: false, mensaje: "Debe ser mayor al coste del producto." };
        return { valido: true, mensaje: "" };
    };

    const estadoProducto      = tocados.producto      ? validarProducto(modalProducto)           : null;
    const estadoCantidad      = tocados.cantidad      ? validarCantidad(modalCantidad)            : null;
    const estadoPrecio        = tocados.precio        ? validarPrecio(modalPrecio)                : null;
    const estadoCosteProducto = tocados.costeProducto ? validarCosteProducto(modalCosteProducto) : null;
    const estadoPrecioVenta   = tocados.precioVenta   ? validarPrecioVenta(modalPrecioVenta)      : null;

    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });

        if (
            !validarProducto(modalProducto).valido ||
            !validarCantidad(modalCantidad).valido  ||
            !validarPrecio(modalPrecio).valido       ||
            !validarCosteProducto(modalCosteProducto).valido ||
            !validarPrecioVenta(modalPrecioVenta).valido
        ) return;

        const found         = productosList.find((p) => String(p.id) === String(modalProducto));
        const cantidad      = parseInt(modalCantidad);
        const precio        = parseCOP(modalPrecio);
        const costeProducto = parseCOP(modalCosteProducto);
        const precioVenta   = parseCOP(modalPrecioVenta);

        // El usuario eligió "sugerido" → usaremos precioVenta directamente.
        // El usuario eligió "wac" (o no hubo diferencia) → se aplicará el WAC en guardarCompra.
        // Pasamos sobreescribirConSugerido para que CreateShopping.finalizarCompra lo maneje.
        const sobreescribirConSugerido = mostrarSeleccionPrecio && seleccionPrecio === "sugerido";

        onAnadir({
            id:                    found?.id ?? Date.now(),
            nombre:                found?.nombre ?? modalProducto,
            cantidad,
            precio,
            costeProducto,
            precioVenta,
            subtotal:              cantidad * costeProducto,
            sobreescribirConSugerido,
            esActualizacion:       !!productoYaAgregado,
        });
    };

    return (
        <>
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl z-10" onClick={onClose} />

            {/* TARJETA */}
            <div className="absolute inset-0 flex items-start justify-center z-20 pointer-events-none overflow-y-auto py-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl pointer-events-auto border border-gray-300 my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <p className="text-base font-semibold">
                                {productoYaAgregado
                                    ? <>Actualizar <span className="text-yellow-400">producto</span> en la compra</>
                                    : <>Añadir <span className="text-yellow-400">producto</span> a la compra</>
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {productoYaAgregado
                                    ? "Modifica los valores y confirma para actualizar."
                                    : "Complete todos los campos del formulario."}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer">
                            <X size={18} />
                        </button>
                    </div>

                    {/* CAMPOS */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">

                        {/* PRODUCTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Box size={20} /><span>Producto *</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <select
                                    value={modalProducto}
                                    onChange={(e) => handleSelectProducto(e.target.value)}
                                    onBlur={() => setTocados((t) => ({ ...t, producto: true }))}
                                    className={`flex-1 min-w-0 bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer
                                        ${estadoProducto === null ? "focus:ring-gray-400 text-gray-500"
                                            : estadoProducto.valido ? "ring-1 ring-green-300 text-gray-700"
                                            : "ring-1 ring-red-300 text-gray-500"}`}
                                >
                                    <option value="">Elige un producto...</option>
                                    {productosList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setShowCreateProductModal(true)}
                                    className="bg-yellow-400 hover:bg-yellow-500 transition p-3 rounded-xl shadow-md cursor-pointer flex-shrink-0">
                                    <Plus size={18} className="text-white" />
                                </button>
                            </div>
                            <FieldStatus estado={estadoProducto} />
                        </div>

                        {/* CANTIDAD */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Boxes size={20} /><span>Cantidad *</span>
                            </div>
                            <input type="number" min="1" placeholder="Unidades a comprar"
                                value={modalCantidad}
                                onChange={(e) => { setModalCantidad(e.target.value); setTocados((t) => ({ ...t, cantidad: true })); }}
                                onBlur={() => setTocados((t) => ({ ...t, cantidad: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoCantidad === null ? "focus:ring-gray-400"
                                        : estadoCantidad.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`}
                            />
                            {productoSeleccionado && (
                                <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs bg-gray-50 border border-gray-200">
                                    <span className="text-gray-500">Stock en inventario:</span>
                                    <span className="font-bold text-gray-700">{productoSeleccionado.stock} unidades</span>
                                </div>
                            )}
                            <FieldStatus estado={estadoCantidad} />
                        </div>

                        {/* PRECIO INVENTARIO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} /><span>Precio en inventario</span>
                            </div>
                            <input type="number" readOnly value={modalPrecio}
                                placeholder="Se carga al seleccionar"
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm cursor-not-allowed opacity-75" />
                            <p className="text-xs text-gray-400 -mt-1">Precio actual del producto (referencia)</p>
                        </div>

                        {/* COSTE COMPRA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} /><span>Coste de compra *</span>
                            </div>
                            <input type="number" min="1" placeholder="Lo que pagas al proveedor"
                                value={modalCosteProducto}
                                onChange={(e) => { setModalCosteProducto(e.target.value); setTocados((t) => ({ ...t, costeProducto: true })); }}
                                onBlur={() => setTocados((t) => ({ ...t, costeProducto: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoCosteProducto === null ? "focus:ring-gray-400"
                                        : estadoCosteProducto.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`}
                            />
                            <FieldStatus estado={estadoCosteProducto} />
                        </div>

                        {/* PRECIO VENTA */}
                        <div className="col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign size={16} className="text-blue-400" />
                                <span className="text-blue-400">Precio de venta *</span>
                            </div>
                            <input type="number" min="0" placeholder="Debe ser mayor al coste de compra"
                                value={modalPrecioVenta}
                                onChange={(e) => { setModalPrecioVenta(e.target.value); setTocados((t) => ({ ...t, precioVenta: true })); }}
                                onBlur={() => setTocados((t) => ({ ...t, precioVenta: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoPrecioVenta === null ? "focus:ring-gray-400"
                                        : estadoPrecioVenta.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`}
                            />
                            <FieldStatus estado={estadoPrecioVenta} />
                        </div>

                    </div>

                    {/* ── SELECCIÓN DE PRECIO — aparece cuando WAC ≠ precioVenta ── */}
                    {mostrarSeleccionPrecio && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={14} className="text-yellow-500" />
                                <p className="text-xs font-medium text-gray-600">
                                    El precio de venta difiere del promedio calculado (WAC). ¿Con cuál actualizas el inventario?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">

                                {/* Opción WAC */}
                                <button type="button" onClick={() => setSeleccionPrecio("wac")}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer
                                        ${seleccionPrecio === "wac"
                                            ? "border-blue-400 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"}`}
                                >
                                    {seleccionPrecio === "wac" && <CheckCircle2 size={13} className="absolute top-2 right-2 text-blue-500" />}
                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                        <Info size={10} />Precio promedio (WAC)
                                    </span>
                                    <span className="text-base font-bold text-blue-600">{fmt(wacCalculado)}</span>
                                    <span className="text-xs text-gray-400 leading-tight">Calculado con el inventario actual</span>
                                </button>

                                {/* Opción sugerido */}
                                <button type="button" onClick={() => setSeleccionPrecio("sugerido")}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer
                                        ${seleccionPrecio === "sugerido"
                                            ? "border-yellow-400 bg-yellow-50"
                                            : "border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/30"}`}
                                >
                                    {seleccionPrecio === "sugerido" && <CheckCircle2 size={13} className="absolute top-2 right-2 text-yellow-500" />}
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                            <Tag size={10} />Precio sugerido
                                        </span>
                                        {(() => {
                                            const diff = parseCOP(modalPrecioVenta) - wacCalculado;
                                            return (
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${diff > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                    {diff > 0 ? "▲" : "▼"} {fmt(Math.abs(diff))}
                                                </span>
                                            );
                                        })()}
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
                            <span>
                                <span className="font-medium">Subtotal compra: </span>
                                <span className="font-semibold text-gray-900">
                                    {formatCOP((parseInt(modalCantidad) || 0) * parseCOP(modalCosteProducto))}
                                </span>
                            </span>
                            <span>
                                <span className="font-medium">Margen unitario: </span>
                                <span className="font-semibold text-green-600">
                                    {formatCOP(parseCOP(modalPrecioVenta) - parseCOP(modalCosteProducto))}
                                </span>
                            </span>
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="flex justify-between mt-6">
                        <button type="button" onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer">
                            Cancelar
                        </button>
                        <PrimaryButton onClick={handleSubmit}>
                            {productoYaAgregado ? "Actualizar producto" : "Añadir producto"}
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* MODAL CREAR PRODUCTO */}
            {showCreateProductModal && (
                <CreateProductModal
                    onClose={() => setShowCreateProductModal(false)}
                    onSuccess={(nuevoProducto) => {
                        const data = ServicesProducts.get().filter((p) => p.estado !== false);
                        setProductosList(data);
                        setModalProducto(String(nuevoProducto.id));
                        setModalPrecio(String(nuevoProducto.precio));
                        setModalCosteProducto(String(nuevoProducto.precio));
                    }}
                />
            )}
        </>
    );
}