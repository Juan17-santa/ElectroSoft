import { useState, useEffect } from "react";
import { X, Box, Boxes, DollarSign, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCOP, parseCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import PrimaryButton from "../../../components/ui/PrimaryButton";

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
    const navigate = useNavigate();

    const [productosList, setProductosList] = useState([]);
    const [modalProducto, setModalProducto] = useState("");       // id del producto
    const [modalCantidad, setModalCantidad] = useState("");
    const [modalPrecio, setModalPrecio]     = useState("");        // se autocarga
    const [modalPrecioVenta, setModalPrecioVenta] = useState("");

    // Tocados — para no mostrar error antes de interactuar
    const [tocados, setTocados] = useState({
        producto: false,
        cantidad: false,
        precio:   false,
    });

    // ─── Cargar productos desde localStorage ─────────────────────────────────
    useEffect(() => {
        const data = ServicesProducts.get().filter((p) => p.estado !== false);
        setProductosList(data);
    }, []);

    // ─── Al seleccionar producto → autocargar precio ──────────────────────────
    const handleSelectProducto = (id) => {
        setModalProducto(id);
        setTocados((t) => ({ ...t, producto: true }));
        const found = productosList.find((p) => String(p.id) === String(id));
        if (found) {
            setModalPrecio(String(found.precio));
        } else {
            setModalPrecio("");
        }
    };

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarProducto = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona un producto." };
        return { valido: true, mensaje: "" };
    };
    const validarCantidad = (val) => {
        if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
        if (parseInt(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };
    const validarPrecio = (val) => {
        if (!val) return { valido: false, mensaje: "El precio es obligatorio." };
        if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };

    const estadoProducto = tocados.producto ? validarProducto(modalProducto) : null;
    const estadoCantidad = tocados.cantidad ? validarCantidad(modalCantidad) : null;
    const estadoPrecio   = tocados.precio   ? validarPrecio(modalPrecio)     : null;

    // ─── Previsualización ─────────────────────────────────────────────────────
    const subtotalEstimado = (parseInt(modalCantidad) || 0) * parseCOP(modalPrecio);
    const ventaEstimada    = (parseInt(modalCantidad) || 0) * parseCOP(modalPrecioVenta);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        // Marcar todos como tocados para mostrar errores
        setTocados({ producto: true, cantidad: true, precio: true });

        const vProd = validarProducto(modalProducto);
        const vCant = validarCantidad(modalCantidad);
        const vPre  = validarPrecio(modalPrecio);

        if (!vProd.valido || !vCant.valido || !vPre.valido) return;

        // Validar que el producto no esté ya agregado
        const yaAgregado = productosYaAgregados.some(
            (p) => String(p.id) === String(modalProducto) || p.nombre === productosList.find(x => String(x.id) === String(modalProducto))?.nombre
        );
        if (yaAgregado) {
            alert("Este producto ya fue agregado a la compra.");
            return;
        }

        const found    = productosList.find((p) => String(p.id) === String(modalProducto));
        const cantidad = parseInt(modalCantidad);
        const precio   = parseCOP(modalPrecio);
        const precioVenta = parseCOP(modalPrecioVenta) || precio;

        onAnadir({
            id:          found?.id ?? Date.now(),
            nombre:      found?.nombre ?? modalProducto,
            cantidad,
            precio,
            precioVenta,
            subtotal:    cantidad * precio,
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
                                    onClick={() => navigate("/dashboard/products/create")}
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
                            <FieldStatus estado={estadoCantidad} />
                        </div>

                        {/* PRECIO COSTO — autocargado */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} />
                                <span>Precio producto *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="ej. 100000"
                                readOnly
                                value={modalPrecio}
                                onChange={(e) => {
                                    setModalPrecio(e.target.value);
                                    setTocados((t) => ({ ...t, precio: true }));
                                }}
                                onBlur={() => setTocados((t) => ({ ...t, precio: true }))}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoPrecio === null
                                        ? "focus:ring-gray-400"
                                        : estadoPrecio.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoPrecio} />
                        </div>

                        {/* PRECIO VENTA — opcional */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign size={16} className="text-blue-400" />
                                <span className="text-blue-400">Precio Venta</span>
                                <span className="text-xs text-gray-400 italic">(opcional)</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="Digita el precio de venta"
                                value={modalPrecioVenta}
                                onChange={(e) => setModalPrecioVenta(e.target.value)}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow duration-300"
                            />
                        </div>

                    </div>

                    {/* PREVISUALIZACIÓN */}
                    {modalCantidad && modalPrecio && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm text-gray-700 flex items-center justify-between">
                            <span>
                                <span className="font-medium">Subtotal estimado: </span>
                                <span className="font-bold text-yellow-600">{formatCOP(subtotalEstimado)}</span>
                            </span>
                            {modalPrecioVenta && (
                                <span>
                                    <span className="font-medium text-blue-500">Venta: </span>
                                    <span className="font-bold text-blue-500">{formatCOP(ventaEstimada)}</span>
                                </span>
                            )}
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
        </>
    );
}