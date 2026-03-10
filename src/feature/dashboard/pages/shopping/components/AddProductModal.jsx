import { useState, useEffect } from "react";
import { X, Box, Boxes, DollarSign, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCOP, parseCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import CreateProductModal from "./CreateProductModal";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Alert from "../../../components/ui/Alert";

// ─── Mini-componente: Indicador de validación ─────────────────────────────────
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
    const [alert, setAlert] = useState(null);

    const [modalProducto, setModalProducto] = useState("");
    const [modalCantidad, setModalCantidad] = useState("");
    const [modalPrecio, setModalPrecio] = useState("");
    const [modalCosteProducto, setModalCosteProducto] = useState("");
    const [modalPrecioVenta, setModalPrecioVenta] = useState("");

    // Tocados — para no mostrar error antes de interactuar
    const [tocados, setTocados] = useState({
        producto: false,
        cantidad: false,
        precio: false,
        costeProducto: false,
        precioVenta: false,
    });

    // ─── Cargar productos desde localStorage ─────────────────────────────────
    useEffect(() => {
        const data = ServicesProducts.get().filter((p) => p.estado !== false);
        setProductosList(data);
    }, [showCreateProductModal]);

    // ─── Producto seleccionado (derivado) ─────────────────────────────────────
    const productoSeleccionado = productosList.find((p) => String(p.id) === String(modalProducto));

    // ─── Al seleccionar producto → autocargar precio y re-validar cantidad ────
    const handleSelectProducto = (id) => {
        setModalProducto(id);
        setTocados((t) => ({ ...t, producto: true }));

        const found = productosList.find((p) => String(p.id) === String(id));
        if (found) {
            setModalPrecio(String(found.precio));
            setModalCosteProducto(String(found.precio));
        } else {
            setModalPrecio("");
            setModalCosteProducto("");
        }

        // Si ya había una cantidad escrita, forzar re-validación al cambiar producto
        if (modalCantidad) {
            setTocados((t) => ({ ...t, cantidad: true }));
        }
    };

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarProducto = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona un producto." };
        return { valido: true, mensaje: "" };
    };

    const validarCantidad = (val) => {
        if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
        const cantidad = parseInt(val);
        if (isNaN(cantidad) || cantidad <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        // Validación de stock en tiempo real
        if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
            return {
                valido: false,
                mensaje: `Supera el stock disponible (${productoSeleccionado.stock} unid.).`,
            };
        }
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
        if (parseCOP(val) <= parseCOP(modalCosteProducto)) {
            return { valido: false, mensaje: "Debe ser mayor al coste del producto." };
        }
        return { valido: true, mensaje: "" };
    };

    const estadoProducto      = tocados.producto      ? validarProducto(modalProducto)           : null;
    const estadoCantidad      = tocados.cantidad      ? validarCantidad(modalCantidad)            : null;
    const estadoPrecio        = tocados.precio        ? validarPrecio(modalPrecio)                : null;
    const estadoCosteProducto = tocados.costeProducto ? validarCosteProducto(modalCosteProducto) : null;
    const estadoPrecioVenta   = tocados.precioVenta   ? validarPrecioVenta(modalPrecioVenta)      : null;

    // ─── Indicador visual de stock ────────────────────────────────────────────
    const renderStockIndicator = () => {
        if (!productoSeleccionado) return null;
        const stock = productoSeleccionado.stock;
        const cantidad = parseInt(modalCantidad) || 0;
        const excede = cantidad > stock;

        return (
            <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs mt-1 ${
                excede ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"
            }`}>
                <span className={excede ? "text-red-500 font-medium" : "text-gray-500"}>
                    Stock disponible:
                </span>
                <span className={`font-bold ${excede ? "text-red-600" : "text-gray-700"}`}>
                    {stock} unidades
                </span>
            </div>
        );
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        setTocados({ producto: true, cantidad: true, precio: true, costeProducto: true, precioVenta: true });

        const vProd  = validarProducto(modalProducto);
        const vCant  = validarCantidad(modalCantidad);
        const vPre   = validarPrecio(modalPrecio);
        const vCoste = validarCosteProducto(modalCosteProducto);
        const vVenta = validarPrecioVenta(modalPrecioVenta);

        if (!vProd.valido || !vCant.valido || !vPre.valido || !vCoste.valido || !vVenta.valido) return;

        const yaAgregado = productosYaAgregados.some(
            (p) => String(p.id) === String(modalProducto)
        );
        if (yaAgregado) {
            setAlert({ type: "error", message: "Este producto ya fue agregado a la compra." });
            return;
        }

        const found       = productosList.find((p) => String(p.id) === String(modalProducto));
        const cantidad    = parseInt(modalCantidad);
        const precio      = parseCOP(modalPrecio);
        const costeProducto = parseCOP(modalCosteProducto);
        const precioVenta = parseCOP(modalPrecioVenta);

        onAnadir({
            id:             found?.id ?? Date.now(),
            nombre:         found?.nombre ?? modalProducto,
            cantidad,
            precio,
            costeProducto,
            precioVenta,
            subtotal:       cantidad * precio,
        });
    };

    return (
        <>
            {/* OVERLAY */}
            <div
                className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl z-10"
                onClick={onClose}
            />

            {/* TARJETA */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl pointer-events-auto border border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <p className="text-base font-semibold">
                                Crear nuevo <span className="text-yellow-400">pedido</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Complete todos los campos del formulario
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* CAMPOS */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">

                        {/* PRODUCTO + BOTÓN CREAR */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Box size={20} />
                                <span>Productos *</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <select
                                    value={modalProducto}
                                    onChange={(e) => handleSelectProducto(e.target.value)}
                                    onBlur={() => setTocados((t) => ({ ...t, producto: true }))}
                                    className={`flex-1 min-w-0 bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer
                                        ${estadoProducto === null
                                            ? "focus:ring-gray-400 text-gray-500"
                                            : estadoProducto.valido
                                                ? "ring-1 ring-green-300 text-gray-700"
                                                : "ring-1 ring-red-300 text-gray-500"
                                        }`}
                                >
                                    <option value="">Elige un producto...</option>
                                    {productosList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateProductModal(true)}
                                    className="bg-yellow-400 hover:bg-yellow-500 transition duration-300 p-3 rounded-xl shadow-md cursor-pointer flex-shrink-0"
                                >
                                    <Plus size={18} className="text-white" />
                                </button>
                            </div>
                            <FieldStatus estado={estadoProducto} />
                        </div>

                        {/* CANTIDAD */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Boxes size={20} />
                                <span>Cantidad *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="Digite la cantidad"
                                value={modalCantidad}
                                onChange={(e) => {
                                    setModalCantidad(e.target.value);
                                    setTocados((t) => ({ ...t, cantidad: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, cantidad: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoCantidad === null
                                        ? "focus:ring-gray-400"
                                        : estadoCantidad.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            {/* INDICADOR DE STOCK — siempre visible al elegir producto */}
                            {renderStockIndicator()}
                            <FieldStatus estado={estadoCantidad} />
                        </div>

                        {/* PRECIO PRODUCTO — autocargado, no editable */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} />
                                <span>Precio Producto *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="ej. 100000"
                                readOnly
                                value={modalPrecio}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm cursor-not-allowed opacity-75"
                            />
                            <FieldStatus estado={estadoPrecio} />
                        </div>

                        {/* COSTE PRODUCTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} />
                                <span>Coste Producto *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="Coste actual de compra"
                                value={modalCosteProducto}
                                onChange={(e) => {
                                    setModalCosteProducto(e.target.value);
                                    setTocados((t) => ({ ...t, costeProducto: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, costeProducto: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoCosteProducto === null
                                        ? "focus:ring-gray-400"
                                        : estadoCosteProducto.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoCosteProducto} />
                        </div>

                        {/* PRECIO VENTA */}
                        <div className="col-span-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign size={16} className="text-blue-400" />
                                <span className="text-blue-400">Precio Venta *</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="Debe ser mayor al coste del producto"
                                value={modalPrecioVenta}
                                onChange={(e) => {
                                    setModalPrecioVenta(e.target.value);
                                    setTocados((t) => ({ ...t, precioVenta: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, precioVenta: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoPrecioVenta === null
                                        ? "focus:ring-gray-400"
                                        : estadoPrecioVenta.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoPrecioVenta} />
                        </div>

                    </div>

                    {/* PREVISUALIZACIÓN */}
                    {modalCantidad && modalPrecio && modalCosteProducto && modalPrecioVenta && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-gray-700 flex items-center justify-between">
                            <span>
                                <span className="font-medium">Subtotal: </span>
                                <span className="font-bold text-blue-600">
                                    {formatCOP((parseInt(modalCantidad) || 0) * parseCOP(modalPrecio))}
                                </span>
                            </span>
                            <span>
                                <span className="font-medium">Margen de ganancia: </span>
                                <span className="font-bold text-green-600">
                                    {formatCOP(parseCOP(modalPrecioVenta) - parseCOP(modalCosteProducto))}
                                </span>
                            </span>
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <PrimaryButton onClick={handleSubmit}>
                            Añadir producto
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

            {/* ALERTA */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}