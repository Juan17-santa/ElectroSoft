import { Boxes, CircleUser, FileText, Plus, X } from "lucide-react";
import { CreditCard, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Calendar from "../../../components/ui/Calendar";
import AddProductModal from "../../../../../components/AddProductModal";
import ValidationMessage from "../../../components/ui/ValidationMessage";

export default function OrdersForm({
    formData,
    errors,
    handleChange,
    handleSubmit,
    buttonText,
    onCancel,
    onOpenClientModal,
    products,
    addProduct
}) {

    // ESTADO PARA VER LA MODAL DE AÑADIR PRODUCTOS
    const [openProductModal, setOpenProductModal] = useState(false);

    const [showPago, setShowPago] = useState(false);
    const pagoRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (pagoRef.current && !pagoRef.current.contains(e.target)) {
                setShowPago(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <>
            {/* Formulario principal */}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-12 mt-6">

                    {/* ================= PRIMERA FILA ================= */}
                    <div className="flex gap-16">

                        {/* DOCUMENTO */}
                        <div className="flex flex-col gap-3 w-80">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Documento *</span>
                            </div>

                            <input
                                type="text"
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                placeholder="Ingrese documento"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.documento}
                                success={formData.clienteId}
                                successMessage="Cliente válido"
                            />
                        </div>

                        {/* CLIENTE (AUTO) */}
                        <div className="flex flex-col gap-3 w-80">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <CircleUser size={16} />
                                <span>Cliente</span>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.clienteNombre || ""}
                                    disabled
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full"
                                />

                                {/* BOTON CREAR CLIENTE */}
                                <button
                                    type="button"
                                    onClick={onOpenClientModal}
                                    className="bg-yellow-400 hover:bg-yellow-500 transition-all rounded-xl px-4 shadow-md cursor-pointer">
                                    +
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* ================= SEGUNDA FILA ================= */}
                    <div className="flex gap-16">

                        {/* FECHA PEDIDO */}
                        <div className="flex flex-col gap-3 w-52">
                            {/* Aquí va tu Calendar */}
                            <Calendar
                                fechaISO={formData.fechaPedido}
                                onFechaChange={(fecha) =>
                                    handleChange({
                                        target: {
                                            name: "fechaPedido",
                                            value: fecha
                                        }
                                    })
                                }
                                label="Fecha pedido"
                                required
                                readOnly
                            />
                        </div>

                        {/* FECHA VENCIMIENTO */}
                        <div className="flex flex-col gap-3 w-52">
                            <Calendar
                                fechaISO={formData.fechaVencimiento}
                                onFechaChange={() => { }}   // no hace nada
                                label="Fecha vencimiento"
                                className="
                                    w-full
                                    pointer-events-none
                                    [&>div>button]:bg-gray-300
                                    [&>div>button]:text-gray-600
                                "
                            />
                        </div>

                        {/* TIPO DE PAGO */}
                        <div className="flex flex-col gap-2 w-52">

                            {/* LABEL */}
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <CreditCard size={20} />
                                <span>Tipo de pago *</span>
                            </div>

                            {/* INPUT */}
                            <div className="relative" ref={pagoRef}>

                                <button
                                    type="button"
                                    onClick={() => setShowPago(v => !v)}
                                    className={`bg-gray-200 mb-4 rounded-xl px-4 py-3 text-sm shadow-md w-full text-left transition-all duration-300 
                                        focus:outline-none focus:ring-2 cursor-pointer flex items-center justify-between gap-2
                                        ${errors.formaPago ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                >
                                    <span>
                                        {formData.formaPago || "Seleccionar tipo"}
                                    </span>

                                    <ChevronDown
                                        size={16}
                                        className={`transition duration-300 ${showPago ? "rotate-180 text-yellow-500" : "text-gray-400"}`}
                                    />
                                </button>

                                {/* DROPDOWN */}
                                {showPago && (
                                    <div
                                        className="absolute z-50 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 w-full"
                                    >

                                        {["Credito", "Contado"].map(pago => (
                                            <button
                                                key={pago}
                                                type="button"
                                                onClick={() => {
                                                    handleChange({
                                                        target: {
                                                            name: "formaPago",
                                                            value: pago
                                                        }
                                                    });
                                                    setShowPago(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm transition"
                                            >
                                                {pago}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <ValidationMessage
                                    error={errors.formaPago}
                                    success={formData.formaPago}
                                    successMessage="Forma de pago válida"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ================= PRODUCTOS ================= */}
                    {/* SECCIÓN PRODUCTOS */}
                    <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4 w-3xl">

                        {/* ENCABEZADO */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                                <Boxes size={20} />
                                <span>Productos</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpenProductModal(true)}
                                    className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-4 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                                >
                                    <Plus size={16} />
                                    Añadir producto
                                </button>
                            </div>
                        </div>

                        {/* TABLA */}
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="px-4 py-2 font-semibold">Producto</th>
                                        <th className="px-4 py-2 font-semibold text-center">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold text-center">Precio</th>
                                        <th className="px-4 py-2 font-semibold text-center">Subtotal</th>
                                        <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(formData.productos || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-gray-400">
                                                No hay productos agregados.
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.productos.map((producto, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border-b">{producto.nombre}</td>
                                                <td className="px-4 py-2 border-b text-center">{producto.cantidad}</td>
                                                <td className="px-4 py-2 border-b text-center">{producto.precio}</td>
                                                <td className="px-4 py-2 border-b text-center">{producto.subtotal}</td>
                                                <td className="px-4 py-2 border-b text-center">
                                                    <button
                                                        onClick={() => {
                                                            const nuevos = formData.productos.filter((_, i) => i !== index);
                                                            handleChange({
                                                                target: {
                                                                    name: "productos",
                                                                    value: nuevos
                                                                }
                                                            });
                                                        }}
                                                        className="text-red-500"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= TOTALES ================= */}
                        <div className="w-full flex px-6 py-3 justify-between items-center">
                            <div>
                                <ValidationMessage
                                    error={errors.productos}
                                    success={formData.productos.length > 0}
                                    successMessage="Productos agregados correctamente"
                                />
                            </div>
                            <div className="flex gap-6">
                                <span className="text-gray-600 text-sm">Subtotal: <span className="font-bold text-gray-800">{formData.subtotal}</span></span>
                                <span className="text-gray-600 text-sm">IVA (19%): <span className="font-bold text-blue-600">{formData.iva}</span></span>
                                <span className="text-gray-600 text-sm">Total: <span className="font-bold text-green-600">{formData.total}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* ================= BOTONES ================= */}
                    <div className="flex justify-end w-full gap-6">
                        {/* Botón Cancelar */}
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
                        >
                            <X size={16} />
                            Cancelar
                        </button>

                        {/* Botón Principal (Crear) */}
                        <PrimaryButton
                            type="submit"
                            disabled={Object.values(errors).some(error => error)} // Desactiva si hay errores
                        >
                            {buttonText}
                        </PrimaryButton>
                    </div>
                </div>
            </form>

            {/* MODAL PARA AÑADIR PRODUCTOS */}
            <AddProductModal
                isOpen={openProductModal}
                onClose={() => setOpenProductModal(false)}
                products={products}
                onAdd={(product, quantity) => {
                    addProduct(product, quantity);
                    setOpenProductModal(false);
                }}
            />
        </>
    );
}