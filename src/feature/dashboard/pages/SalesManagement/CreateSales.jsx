import { User, FileText, X, Plus, Trash, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import { ServicesProducts } from "../products/services/ServicesProducts";
import { ClientsService } from "../Clients/services/ClientsService";
import AddProductModal from "../../components/ui/AddProductModal";
import Alert from "../../components/ui/Alert";
import ValidationMessage from "../../components/ui/ValidationMessage";
import { Validations } from "../../../../utils/validations";

export default function CreateSales() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        numeroDocumento: "",
        tipoVenta: "Contado",
        fecha: new Date().toISOString().split("T")[0],
        estado: "Vigente"
    });

    const [tocado, setTocado] = useState({ numeroDocumento: false, fecha: false, tipoVenta: false });
    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    const [productos, setProductos] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [clienteNombre, setClienteNombre] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productosError, setProductosError] = useState("");

    const validarDocumentoCliente = (documento) => {
        const vBasica = Validations.validarNumeroVenta(documento);
        if (!vBasica.valido) return { ...vBasica, cliente: null };

        if (documento && clients.length > 0) {
            const cliente = clients.find(c => c.documento === documento);
            if (!cliente) return { valido: false, mensaje: "El cliente no existe.", cliente: null };
            return { ...vBasica, cliente };
        }
        return { ...vBasica, cliente: null };
    };

    const resultadoDoc = validarDocumentoCliente(formData.numeroDocumento);
    const estadoNumDoc = tocado.numeroDocumento ? resultadoDoc : null;

    // Opciones de tipo de venta según historial de compras del cliente
    const totalComprasCliente = Number(resultadoDoc.cliente?.totalCompras) || 0;
    const opcionesTipoVenta = totalComprasCliente > 1000000
        ? [
            { value: "Contado", label: "Contado" },
            { value: "Credito", label: "Crédito" }
        ]
        : [
            { value: "Contado", label: "Contado" }
        ];

    const validarTipoVenta = () => {
        if (!formData.tipoVenta) return { valido: false, mensaje: "Seleccione un tipo de venta." };
        return { valido: true };
    };

    const estadoTipoVenta = tocado.tipoVenta ? validarTipoVenta() : null;
    const estadoFecha = tocado.fecha ? (Validations.campoRequerido(formData.fecha) ? { valido: true } : { valido: false, mensaje: "La fecha es requerida." }) : null;

    const ringClass = (estado) => {
        if (!estado) return "focus:ring-yellow-400";
        return estado.valido ? "ring-1 ring-green-400 focus:ring-green-500" : "ring-1 ring-red-300 focus:ring-red-400";
    };

    useEffect(() => {
        setAvailableProducts(ServicesProducts.get().filter(p => p.estado));
        setClients(ClientsService.get());
    }, []);

    // Si el cliente cambia y ya no cumple el mínimo, resetear tipoVenta a Contado
    useEffect(() => {
        if (totalComprasCliente <= 1000000 && formData.tipoVenta === "Credito") {
            setFormData(prev => ({ ...prev, tipoVenta: "Contado" }));
        }
    }, [totalComprasCliente]);

    // Auto-llenar nombre del cliente cuando cambia el número de documento
    useEffect(() => {
        if (!formData.numeroDocumento) {
            setClienteNombre("");
            return;
        }
        const allClients = ClientsService.get();
        const found = allClients.find(c => c.documento === formData.numeroDocumento);
        setClienteNombre(found ? `${found.nombres} ${found.apellidos}` : "");
    }, [formData.numeroDocumento]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        // Forzar solo dígitos en campos numéricos
        if (name === "numeroDocumento") value = value.replace(/\D/g, "").slice(0, 10);
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleProductChange = (index, field, value) => {
        const newProductos = [...productos];
        newProductos[index][field] = field === "cantidad" ? parseFloat(value) || 0 : value;
        setProductos(newProductos);
    };

    const getAvailableStock = (product) => {
        const productInSale = productos.find(p => p.nombre === product.nombre);
        const usedStock = productInSale ? productInSale.cantidad : 0;
        return (product.stock || 0) - usedStock;
    };

    const handleSaveProduct = (selectedProduct, quantity) => {
        setProductos(prev => [...prev, {
            id: Date.now(),
            nombre: selectedProduct.nombre,
            cantidad: quantity,
            precio: selectedProduct.precio
        }]);
        setProductosError("");
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (index) => {
        setProductos(productos.filter((_, i) => i !== index));
    };

    const calcularTotales = () => {
        const subtotal = productos.reduce((sum, p) => sum + p.cantidad * p.precio, 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        return { subtotal, iva, total };
    };

    const { subtotal, iva, total } = calcularTotales();

    const handleForm = (e) => {
        e.preventDefault();
        setTocado({ numeroDocumento: true, fecha: true, tipoVenta: true });

        const vDoc = validarDocumentoCliente(formData.numeroDocumento);
        const vTipoVenta = validarTipoVenta();
        const vFech = Validations.campoRequerido(formData.fecha) ? { valido: true } : { valido: false };

        if (!vDoc.valido || !vFech.valido || !vTipoVenta.valido) return;

        if (productos.length === 0) {
            setProductosError("Debe agregar al menos un producto.");
            return;
        }

        try {
            const datosVenta = {
                ...formData,
                cliente: clienteNombre,
                productos,
                subtotal,
                iva,
                total,
                montoPagado: formData.tipoVenta === "Contado" ? total : 0,
                montoPorPagar: formData.tipoVenta === "Contado" ? 0 : total
            };
            SalesService.create(datosVenta);
            ClientsService.sumarCompra(formData.numeroDocumento, total);
            setAlert({ type: "success", message: "Venta registrada correctamente." });
            setTimeout(() => navigate("/dashboard/sales-management"), 1500);
        } catch (error) {
            console.error(error);
            setAlert({ type: "error", message: "Error al registrar la venta." });
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nueva <span className="text-yellow-400">venta</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer" onClick={() => navigate("/dashboard/sales-management")}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleForm} className="flex flex-col gap-6">

                    {/* FILA 1 — 3 columnas */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Número Documento */}
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-2"><FileText size={14} /><span>Nº Documento *</span></div>
                            <input
                                type="text"
                                name="numeroDocumento"
                                value={formData.numeroDocumento}
                                onChange={handleChange}
                                onBlur={() => tocar("numeroDocumento")}
                                placeholder="Ej: 1234567890"
                                className={`bg-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoNumDoc)}`}
                            />
                            {tocado.numeroDocumento && (
                                <ValidationMessage
                                    error={!estadoNumDoc?.valido ? estadoNumDoc?.mensaje : null}
                                    success={estadoNumDoc?.valido}
                                    successMessage="Listo"
                                />
                            )}
                        </div>

                        {/* Cliente auto-llenado */}
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-2"><User size={14} /><span>Cliente</span></div>
                            <input
                                type="text"
                                readOnly
                                value={clienteNombre}
                                placeholder={formData.numeroDocumento ? "No encontrado" : "Se llena automáticamente"}
                                className="bg-gray-200/70 rounded-xl px-3 py-2.5 text-sm shadow-inner text-gray-500 cursor-default outline-none"
                            />
                            {formData.numeroDocumento && !clienteNombre && (
                                <div className="flex items-center gap-1 text-xs mt-1 text-red-500">
                                    <AlertCircle size={12} /><span>Cliente no encontrado</span>
                                </div>
                            )}
                            {clienteNombre && (
                                <div className="flex items-center gap-1 text-xs mt-1 text-green-500">
                                    <CheckCircle2 size={12} /><span>Cliente encontrado</span>
                                </div>
                            )}
                        </div>

                        {/* Tipo Venta */}
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-2"><FileText size={14} /><span>Tipo Venta *</span></div>
                            <select
                                name="tipoVenta"
                                value={formData.tipoVenta}
                                onChange={handleChange}
                                onBlur={() => tocar("tipoVenta")}
                                className={`bg-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoTipoVenta)}`}
                            >
                                {opcionesTipoVenta.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {estadoTipoVenta && (
                                <ValidationMessage
                                    error={!estadoTipoVenta.valido ? estadoTipoVenta.mensaje : null}
                                    success={estadoTipoVenta.valido}
                                    successMessage="Listo"
                                />
                            )}
                        </div>
                    </div>

                    {/* FILA 2 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Fecha *</span></div>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                onBlur={() => tocar("fecha")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoFecha)}`}
                            />
                            {tocado.fecha && (
                                <ValidationMessage
                                    error={!estadoFecha?.valido ? estadoFecha?.mensaje : null}
                                    success={estadoFecha?.valido}
                                    successMessage="Listo"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Estado *</span></div>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="Vigente">Vigente</option>
                                <option value="Finalizado">Finalizado</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS */}
                    <div className="flex flex-col gap-3">
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
                                <AlertCircle size={12} /><span>{productosError}</span>
                            </div>
                        )}

                        <div className="bg-white rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200 border-b border-gray-300">
                                        <th className="px-4 py-3 text-left font-semibold">Producto</th>
                                        <th className="px-4 py-3 text-center font-semibold w-24">Cantidad</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Precio</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Subtotal</th>
                                        <th className="px-4 py-3 text-center font-semibold w-12">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                                No hay productos agregados. Haga clic en "Agregar Producto".
                                            </td>
                                        </tr>
                                    ) : (
                                        productos.map((producto, index) => (
                                            <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-800">{producto.nombre}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={producto.cantidad}
                                                        onChange={(e) => handleProductChange(index, "cantidad", e.target.value)}
                                                        min="1"
                                                        className="w-full bg-gray-100 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">${parseFloat(producto.precio).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">${(producto.cantidad * producto.precio).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="p-1 hover:bg-red-100 rounded transition cursor-pointer">
                                                        <Trash size={16} className="text-red-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TOTALES */}
                    <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">Subtotal</p>
                            <p className="text-2xl font-bold text-gray-800">${subtotal.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">IVA (19%)</p>
                            <p className="text-2xl font-bold text-blue-600">${iva.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">Total</p>
                            <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => navigate("/dashboard/sales-management")}
                            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition cursor-pointer font-medium">
                            Cancelar
                        </button>
                        <button type="submit"
                            className="px-6 py-2 rounded-lg bg-linear-to-r from-white to-yellow-300 shadow-md hover:shadow-lg transition cursor-pointer font-medium">
                            Registrar Venta
                        </button>
                    </div>
                </form>

                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleSaveProduct}
                    products={availableProducts}
                    getAvailableStock={getAvailableStock}
                />
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}
