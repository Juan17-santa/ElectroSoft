import { useState } from "react";
import { X, Box, Boxes, DollarSign } from "lucide-react";
import { formatCOP, parseCOP } from "../helpers/shoppingHelpers";

/**
 * Modal para añadir un producto a la compra.
 *
 * Props:
 *  - onClose   () => void
 *  - onAnadir  (producto) => void
 */
export default function AddProductModal({ onClose, onAnadir }) {
    const [modalProducto, setModalProducto]       = useState("");
    const [modalCantidad, setModalCantidad]       = useState("");
    const [modalPrecio, setModalPrecio]           = useState("");
    const [modalPrecioVenta, setModalPrecioVenta] = useState("");

    // ─── Previsualización de subtotal ─────────────────────────────────────────
    const subtotalEstimado = (parseInt(modalCantidad) || 0) * parseCOP(modalPrecio);
    const ventaEstimada    = (parseInt(modalCantidad) || 0) * parseCOP(modalPrecioVenta);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!modalProducto || !modalCantidad || !modalPrecio) {
            alert("Por favor completa los campos obligatorios: Producto, Cantidad y Precio.");
            return;
        }
        if (parseInt(modalCantidad) <= 0) {
            alert("La cantidad debe ser mayor a 0.");
            return;
        }
        if (parseCOP(modalPrecio) <= 0) {
            alert("El precio del producto debe ser mayor a 0.");
            return;
        }

        const cantidad    = parseInt(modalCantidad);
        const precio      = parseCOP(modalPrecio);
        const precioVenta = parseCOP(modalPrecioVenta) || precio;

        onAnadir({
            id: Date.now(),
            nombre: modalProducto,
            cantidad,
            precio,
            precioVenta,
            subtotal: cantidad * precio,
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

                        {/* PRODUCTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Box size={20} />
                                <span>Productos *</span>
                            </div>
                            <select
                                value={modalProducto}
                                onChange={(e) => setModalProducto(e.target.value)}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-shadow duration-300 cursor-pointer"
                            >
                                <option value="">Seleccione su producto...</option>
                                <option>Conector Rapido Wago</option>
                                <option>Sensor de movimiento PIR</option>
                            </select>
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
                                onChange={(e) => setModalCantidad(e.target.value)}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-shadow duration-300"
                            />
                        </div>

                        {/* PRECIO COSTO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={16} />
                                <span>Precio producto *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="5000"
                                value={modalPrecio}
                                onChange={(e) => setModalPrecio(e.target.value)}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-shadow duration-300"
                            />
                        </div>

                        {/* PRECIO VENTA — solo visual */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign size={16} className="text-blue-400" />
                                <span className="text-blue-400">Precio Venta</span>
                                <span className="text-xs text-gray-400 italic">(visual)</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="7000"
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
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-4 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                        >
                            Añadir producto
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}