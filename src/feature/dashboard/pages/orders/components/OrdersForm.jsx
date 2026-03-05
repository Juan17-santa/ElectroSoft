import { Boxes, CircleUser, FileText, Plus, X } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Calendar from "../../../components/ui/Calendar";

export default function OrdersForm({
    formData,
    errors,
    handleChange,
    handleSubmit,
    buttonText,
    onCancel,
    onOpenClientModal
}) {

    return (
        <>
            {/* Formulario principal */}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-12 mt-6 mx-28">

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

                            {errors.documento && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.documento}
                                </p>
                            )}
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

                                {errors.clienteId && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.clienteId}
                                    </p>
                                )}

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
                        <div className="flex flex-col gap-3 w-80">
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
                                className="w-80 [&>div>button]:w-full!"
                            />
                        </div>

                        {/* FECHA VENCIMIENTO */}
                        <div className="flex flex-col gap-3 w-80">
                            <Calendar
                                fechaISO={formData.fechaVencimiento}
                                onFechaChange={() => { }}   // no hace nada
                                label="Fecha vencimiento"
                                className="
                                    w-full 
                                    [&>div>button]:w-full!
                                    [&>div>button]:bg-gray-300!
                                    [&>div>button]:text-gray-500!
                                    [&>div>button]:cursor-not-allowed!
                                    [&>div>button]:shadow-none!
                                    pointer-events-none
                                "
                            />
                        </div>

                    </div>

                    {/* ================= PRODUCTOS ================= */}
                    {/* SECCIÓN PRODUCTOS */}
                    <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4 w-full">

                        {/* ENCABEZADO */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                                <Boxes size={20} />
                                <span>Productos</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    // onClick={}
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
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-400">
                                            No hay productos agregados.
                                        </td>
                                    </tr>
                                </tbody>
                                {/* <tbody className="bg-white text-gray-700">
                                {productosPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                            Añade productos a la compra.
                                        </td>
                                    </tr>
                                ) : (
                                    productosPagina.map((producto) => (
                                        <tr key={producto.id}>
                                            <td className="px-4 py-2 border-b border-gray-200">{producto.nombre}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{producto.cantidad}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{formatCOP(producto.precio)}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-blue-500 italic">
                                                {formatCOP(producto.precioVenta)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{formatCOP(producto.subtotal)}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                <button
                                                    onClick={() => handleEliminar(producto.id)}
                                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition duration-300 cursor-pointer"
                                                >
                                                    <Trash size={16} className="text-red-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody> */}
                            </table>
                        </div>

                        {/* ================= TOTALES ================= */}
                        <div className="w-full flex px-6 py-3 justify-between items-center">
                            <div>
                                {errors.productos && (
                                    <p className="text-red-500 text-sm">
                                        {errors.productos}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-6">
                                <span className="text-gray-600 text-sm">Subtotal: <span className="font-bold text-gray-800">10000</span></span>
                                <span className="text-gray-600 text-sm">IVA (19%): <span className="font-bold text-blue-600">2000</span></span>
                                <span className="text-gray-600 text-sm">Total: <span className="font-bold text-green-600">12000</span></span>
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
        </>
    );
}