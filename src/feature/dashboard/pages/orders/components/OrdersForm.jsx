import { Boxes, CircleUser, FileText, Plus, X, Trash, CreditCard, AlertCircle } from "lucide-react";
import { useState } from "react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Calendar from "../../../components/ui/Calendar";
import AddProductModal from "../../../components/ui/AddProductModal";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import Pagination from "../../../components/ui/Pagination";
import CustomSelect from "../../../components/ui/CustomSelect";

// COMPONENTE PRINCIPAL DEL FORMULARIO DE PEDIDOS
export default function OrdersForm({
    formData,
    errors,
    handleChange,
    handleSubmit,
    buttonText,
    onCancel,
    onOpenClientModal,
    products,
    addProduct,
    currentProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    indexOfFirstItem,
    itemsPerPage,
    paymentOptions
}) {

    // ESTADO PARA VER LA MODAL DE AÑADIR PRODUCTOS
    const [openProductModal, setOpenProductModal] = useState(false);

    // Lógica de fechas locales (evita desfase UTC de toISOString)
    const nowLocal = new Date();
    const hoy = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;

    const tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - 3);
    const haceTresDias = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;

    // FUNCIÓN PARA FORMATEAR NÚMEROS A MONEDA (PESOS COLOMBIANOS)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // FUNCION PARA ELIMINAR UN PRODUCTO SELECCIONADO DE LA LISTA
    const handleRemoveProduct = (index) => {
        const nuevosProductos = formData.productos.filter((_, i) => i !== index);

        // ACTUALIZACIÓN DEL ESTADO GLOBAL MEDIANTE EL MANEJADOR DE CAMBIOS
        handleChange({
            target: {
                name: "productos",
                value: nuevosProductos
            }
        });
    };

    // FUNCION QUE CALCULA EL STOCK DISPONIBLE DEL MODAL
    const getAvailableStock = (product) => {

        // BUSCAR SI EL PRODUCTO YA ESTA EN EL PEDIDO
        const productInOrder = formData.productos?.find(p => p.id === product.id)

        // CANTIDAD YA USADA
        const usedStock = productInOrder ? productInOrder.cantidad : 0

        // RETORNAR LA DIFERENCIA ENTRE EL STOCK TOTAL Y EL USADO
        return product.stock - usedStock
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="h-full">
                <div className="flex flex-col gap-12 mt-6 flex-1">

                    {/* ================= PRIMERA FILA ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 w-full">

                        {/* DOCUMENTO */}
                        <div className="flex flex-col gap-3 w-full">
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

                        {/* CLIENTE (AUTOMATICO) */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <CircleUser size={16} />
                                <span>Cliente</span>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.clienteNombre || ""}
                                    disabled
                                    className="bg-gray-200/70 rounded-xl px-4 py-3 text-sm shadow-md w-full text-gray-500"
                                    placeholder="Se llena automaticamente"
                                />

                                {/* BOTON + PARA CREAR CLIENTE */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16 w-full">

                        {/* FECHA PEDIDO */}
                        <div className="flex flex-col gap-3 w-full">
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
                                // readOnly (Bloquear futuro y pasado, solo HOY)
                                minDate={haceTresDias}
                                maxDate={hoy}
                            />
                        </div>

                        {/* FECHA VENCIMIENTO */}
                        <div className="flex flex-col gap-3 w-full">
                            <Calendar
                                fechaISO={formData.fechaVencimiento}
                                onFechaChange={() => { }}
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
                        <div className="flex flex-col gap-2 w-full">

                            <CustomSelect
                                label="Forma de pago *"
                                icon={CreditCard}
                                value={formData.formaPago}
                                onChange={(value) =>
                                    handleChange({
                                        target: { name: "formaPago", value }
                                    })
                                }
                                options={paymentOptions}
                                placeholder="Seleccionar tipo"
                            />

                            {/* Error inline de crédito — siempre visible si hay problema */}
                            {formData.formaPago === "Credito" && errors.formaPago ? (
                                <div className="flex items-start gap-1.5 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                                    <span className="text-xs text-red-600 leading-snug">{errors.formaPago}</span>
                                </div>
                            ) : (
                                <ValidationMessage
                                    error={errors.formaPago && formData.formaPago !== "Credito" ? errors.formaPago : ""}
                                    success={
                                        formData.formaPago &&
                                        !errors.formaPago
                                    }
                                    successMessage={
                                        formData.formaPago === "Credito"
                                            ? `Crédito aprobado - Cupo disponible: ${formatCurrency(formData.clienteCupoTotal)}`
                                            : "Forma de pago válida"
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* ================= TERCERA FILA ================= */}
                    {/* SECCIÓN DE PRODUCTOS */}
                    <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4 w-full">

                        {/* ENCABEZADO */}
                        <div className="flex flex-col md:flex-row items-start justify-between mb-3 gap-4">
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                                <Boxes size={20} />
                                <span>Productos</span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <PrimaryButton
                                    type="button"
                                    icon={Plus}
                                    onClick={() => setOpenProductModal(true)}
                                    className="w-full md:w-auto justify-center"
                                >
                                    Añadir producto
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* TABLA */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="px-4 py-2 font-semibold">Producto</th>
                                        <th className="px-4 py-2 font-semibold text-center w-24">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold text-center w-28">Precio Unit</th>
                                        <th className="px-4 py-2 font-semibold text-center w-32">Subtotal</th>
                                        <th className="px-4 py-2 font-semibold text-center w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!currentProducts || currentProducts.length === 0) ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-gray-400">
                                                No hay productos agregados.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentProducts.map((producto, index) => {
                                            const realIndex = indexOfFirstItem + index;

                                            return (
                                                <tr key={producto.id || index} className="border-b border-gray-200">
                                                    <td className="px-4 py-2 ">{producto.nombre}</td>
                                                    <td className="px-4 py-2 text-center">{producto.cantidad}</td>
                                                    <td className="px-4 py-2 text-center">{formatCurrency(producto.precio)}</td>
                                                    <td className="px-4 py-2 text-center">{formatCurrency(producto.subtotal)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProduct(realIndex)}
                                                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 cursor-pointer"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* VALIDACION DE PRODUCTOS */}
                        <ValidationMessage
                            error={errors.productos}
                        />

                        {/* ================= TOTALES ================= */}
                        <div className="w-full flex flex-col md:flex-row px-2 md:px-6 py-3 justify-between items-start md:items-center gap-4">
                            <div>
                                {/* PAGINADOR PARA LOS PRODUCTOS */}
                                {(formData?.productos?.length || 0) > itemsPerPage && (
                                    <div className="flex justify-center mt-4 mb-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
                                    </div>
                                )}

                            </div>
                            <div className="flex flex-wrap gap-4 md:gap-6">
                                <span className="text-gray-600 text-sm">Subtotal: <span className="font-bold text-gray-800">{formatCurrency(formData.subtotal)}</span></span>
                                <span className="text-gray-600 text-sm">IVA (19%): <span className="font-bold text-blue-600">{formatCurrency(formData.iva)}</span></span>
                                <span className="text-gray-600 text-sm">Total: <span className="font-bold text-green-600">{formatCurrency(formData.total)}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* ================= BOTONES ================= */}
                    <div className="flex justify-end w-full gap-6 mt-auto">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer hover:shadow-lg"
                        >
                            <X size={16} />
                            Cancelar
                        </button>

                        <PrimaryButton
                            type="submit"
                            disabled={Object.values(errors).some(error => error)}
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
                onConfirm={(productosSeleccionados) => addProduct(productosSeleccionados)}
                products={products}
                getAvailableStock={getAvailableStock}
                title="Agregar Productos al Pedido"
                confirmText="Cargar al pedido"
            />
        </>
    );
}