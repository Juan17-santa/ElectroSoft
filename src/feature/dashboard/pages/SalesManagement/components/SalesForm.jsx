import { User, FileText, X, Plus, Trash, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import AddProductModal from "../../../components/ui/AddProductModal";
import Pagination from "../../../components/ui/Pagination";
import Alert from "../../../components/ui/Alert";

export default function SalesForm({
    formData,
    tocado,
    handleChange,
    handleSelectChange,
    handleForm,
    productos,
    handleSaveProduct,
    handleRemoveProduct,
    handleProductChange,
    clienteNombre,
    opcionesTipoVenta,
    getAvailableStock,
    availableProducts,
    subtotal,
    iva,
    total,
    productosError,
    setProductosError,
    estadoNumDoc,
    onCancel,
    buttonText,
    formError,
    setFormError,
    validarDocumentoCliente
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Pagination for products
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.max(1, Math.ceil(productos.length / itemsPerPage));
    const paginatedProducts = productos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const ringClass = (valido, isTocado) => {
        if (!isTocado) return "focus:ring-yellow-400 bg-gray-200";
        return valido ? "ring-1 ring-green-400 focus:ring-green-500 bg-green-50" : "ring-1 ring-red-300 focus:ring-red-400 bg-red-50";
    };

    const estadoNumDocParsed = tocado.numeroDocumento ? estadoNumDoc : null;
    const isFechaValida = formData.fecha && formData.fecha.trim() !== "";

    return (
        <form onSubmit={handleForm} className="flex flex-col gap-6 h-full">
            {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

            {/* FILA 1 — 3 columnas */}
            <div className="grid grid-cols-3 gap-6">
                {/* Número Documento */}
                <div className="flex flex-col gap-0 relative">
                    <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-1.5 mt-0.5">
                        <FileText size={16} /><span>Nº Documento *</span>
                    </div>
                    <input
                        type="text"
                        name="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={handleChange}
                        placeholder="Ej: 1234567890"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoNumDocParsed?.valido, tocado.numeroDocumento)}`}
                    />
                    <div className="absolute top-full left-0 mt-1">
                        {tocado.numeroDocumento && (
                            <ValidationMessage
                                error={!estadoNumDocParsed?.valido ? estadoNumDocParsed?.mensaje : null}
                                success={estadoNumDocParsed?.valido}
                                successMessage="Listo"
                            />
                        )}
                    </div>
                </div>

                {/* Cliente auto-llenado */}
                <div className="flex flex-col gap-0 relative">
                    <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-1.5 mt-0.5"><User size={16} /><span>Cliente</span></div>
                    <input
                        type="text"
                        readOnly
                        value={clienteNombre}
                        placeholder={formData.numeroDocumento ? "No encontrado" : "Se llena automáticamente"}
                        className="bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-inner text-gray-500 cursor-default outline-none"
                    />
                    <div className="absolute top-full left-0 mt-1">
                        {formData.numeroDocumento && !clienteNombre && (
                            <div className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle size={12} /><span>Cliente no encontrado</span>
                            </div>
                        )}
                        {clienteNombre && (
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle2 size={12} /><span>{clienteNombre} ({estadoNumDoc.cliente?.totalCompras ? 'Total compras:' + estadoNumDoc.cliente.totalCompras : 'Nuevo cliente'})</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tipo de Venta (CustomSelect) */}
                <div className="flex flex-col gap-0">
                    <CustomSelect
                        label="Tipo Venta *"
                        icon={FileText}
                        options={opcionesTipoVenta}
                        value={formData.tipoVenta}
                        onChange={(val) => handleSelectChange("tipoVenta", val)}
                        placeholder="Seleccione tipo"
                    />
                </div>
            </div>

            <div className="mb-2"></div>

            {/* FILA 2 */}
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-0 relative">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-1.5 mt-0.5"><FileText size={16} /><span>Fecha *</span></div>
                    <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(isFechaValida, tocado.fecha)}`}
                    />
                    <div className="absolute top-full left-0 mt-1">
                        {tocado.fecha && (
                            <ValidationMessage
                                error={!isFechaValida ? "La fecha es requerida" : null}
                                success={isFechaValida}
                                successMessage="Listo"
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-0">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-1.5 mt-0.5"><FileText size={16} /><span>Estado *</span></div>
                    <input
                        type="text"
                        readOnly
                        value={formData.estado}
                        className="bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-inner text-gray-500 cursor-default outline-none"
                    />
                </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <FileText size={16} /><span>Productos *</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 text-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                    >
                        <Plus size={16} />Agregar Producto
                    </button>
                </div>

                {productosError && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle size={14} /><span>{productosError}</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-5 py-3 text-left font-semibold text-gray-700">Producto</th>
                                <th className="px-5 py-3 text-center font-semibold text-gray-700 w-28">Cantidad</th>
                                <th className="px-5 py-3 text-right font-semibold text-gray-700 w-36">Precio</th>
                                <th className="px-5 py-3 text-right font-semibold text-gray-700 w-36">Subtotal</th>
                                <th className="px-5 py-3 text-center font-semibold text-gray-700 w-16">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                                        No hay productos agregados. Haga clic en "Agregar Producto".
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((producto, localIndex) => {
                                    const globalIndex = (currentPage - 1) * itemsPerPage + localIndex;
                                    return (
                                        <tr key={producto.id || globalIndex} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-5 py-3 text-gray-800 font-medium">{producto.nombre}</td>
                                            <td className="px-5 py-3 text-center">
                                                <input
                                                    type="number"
                                                    value={producto.cantidad}
                                                    onChange={(e) => handleProductChange(globalIndex, "cantidad", e.target.value)}
                                                    min="1"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-right text-gray-600">${parseFloat(producto.precio).toLocaleString("es-CO")}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-800">${(producto.cantidad * producto.precio).toLocaleString("es-CO")}</td>
                                            <td className="px-5 py-3 text-center">
                                                <button type="button" onClick={() => handleRemoveProduct(globalIndex)} className="p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer">
                                                    <Trash size={17} className="text-red-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {productos.length > 0 && (
                    <div className="flex justify-end mt-1">
                         <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* TOTALES */}
            <div className="grid grid-cols-3 gap-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex flex-col items-center">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Subtotal</p>
                    <p className="text-2xl font-bold text-gray-800">${subtotal.toLocaleString("es-CO")}</p>
                </div>
                <div className="flex flex-col items-center border-l border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">IVA (19%)</p>
                    <p className="text-2xl font-bold text-blue-600">${iva.toLocaleString("es-CO")}</p>
                </div>
                <div className="flex flex-col items-center border-l border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Total</p>
                    <p className="text-2xl font-bold text-green-600">${total.toLocaleString("es-CO")}</p>
                </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-6 mt-auto pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer hover:shadow-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                    <X size={16} />
                    Cancelar
                </button>
                <PrimaryButton type="submit">
                    {buttonText}
                </PrimaryButton>
            </div>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleSaveProduct}
                products={availableProducts}
                getAvailableStock={getAvailableStock}
            />
        </form>
    );
}
