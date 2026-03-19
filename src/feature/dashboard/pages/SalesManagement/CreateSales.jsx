import { User, FileText, X, Plus, Trash, AlertCircle, CheckCircle2, ChevronDown, Boxes } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/ui/CustomSelect";
import { SalesService } from "./services/SalesService";
import { ServicesProducts } from "../products/services/ServicesProducts";
import { ClientsService } from "../Clients/services/ClientsService";
import AddProductModal from "../../components/ui/AddProductModal";
import Alert from "../../components/ui/Alert";
import ValidationMessage from "../../components/ui/ValidationMessage";
import Calendar from "../../components/ui/Calendar";
import Pagination from "../../components/ui/Pagination";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Validations } from "../../../../utils/validations";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);
};

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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
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

    // Opciones de tipo de venta según el historial (1M) y el cupo asignado
    const totalComprasCliente = Number(resultadoDoc.cliente?.totalCompras) || 0;
    const clienteTieneCupo = resultadoDoc.cliente?.cupoActivo;
    const puedeTenerCredito = totalComprasCliente > 1000000 && clienteTieneCupo;
    
    const opcionesTipoVenta = puedeTenerCredito
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

    // Si el cliente cambia y ya no cumple los requisitos, resetear tipoVenta a Contado
    useEffect(() => {
        const canCredit = (Number(resultadoDoc.cliente?.totalCompras) || 0) > 1000000 && resultadoDoc.cliente?.cupoActivo;
        if (!canCredit && formData.tipoVenta === "Credito") {
            setFormData(prev => ({ ...prev, tipoVenta: "Contado" }));
        }
    }, [resultadoDoc.cliente?.cupoActivo, resultadoDoc.cliente?.totalCompras, formData.tipoVenta]);

    // Automatizar Estado del Pedido
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            estado: formData.tipoVenta === "Contado" ? "Finalizado" : "Vigente"
        }));
    }, [formData.tipoVenta]);

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

    const handleProductChange = (productId, field, value) => {
        const newProductos = [...productos];
        const index = newProductos.findIndex(p => p.id === productId);
        if (index !== -1) {
            newProductos[index][field] = field === "cantidad" ? parseFloat(value) || 0 : value;
            setProductos(newProductos);
        }
    };

    const getAvailableStock = (product) => {
        const productInSale = productos.find(p => p.nombre === product.nombre);
        const usedStock = productInSale ? productInSale.cantidad : 0;
        return (product.stock || 0) - usedStock;
    };

    const handleSaveProduct = (productosNuevos, quantity) => {
        // Normalizar entrada: siempre trabajamos con un array
        const itemsToProcess = Array.isArray(productosNuevos)
            ? productosNuevos
            : [{ ...productosNuevos, cantidad: quantity }];

        setProductos(prev => {
            let updated = [...prev];

            itemsToProcess.forEach(item => {
                if (!item || !item.nombre) return;

                const nombre = item.nombre;
                const cant = parseFloat(item.cantidad) || 0;
                const precio = parseFloat(item.precio) || 0;

                if (cant <= 0) return;

                const existingIndex = updated.findIndex(p => p.nombre === nombre);

                if (existingIndex !== -1) {
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        cantidad: updated[existingIndex].cantidad + cant
                    };
                } else {
                    updated.push({
                        id: Date.now() + Math.random(), // ID más único
                        nombre,
                        cantidad: cant,
                        precio
                    });
                }
            });

            return updated;
        });

        setProductosError("");
    };

    const handleRemoveProduct = (productId) => {
        setProductos(productos.filter(p => p.id !== productId));
        // Ajustar página si se queda vacía
        const totalAfterRemove = productos.length - 1;
        const totalPagesAfterRemove = Math.max(1, Math.ceil(totalAfterRemove / ITEMS_PER_PAGE));
        if (currentPage > totalPagesAfterRemove) {
            setCurrentPage(totalPagesAfterRemove);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const calcularTotales = () => {
        const subtotal = productos.reduce((sum, p) => sum + p.cantidad * p.precio, 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        return { subtotal, iva, total };
    };

    const { subtotal, iva, total } = calcularTotales();

    // Lógica de Paginación
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginatedProducts = productos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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

        if (formData.tipoVenta === "Credito" && total > (resultadoDoc.cliente?.cupoTotal || 0)) {
            setAlert({ type: "error", message: `El total de la venta ($${total.toLocaleString("es-CO")}) supera el cupo asignado ($${(resultadoDoc.cliente?.cupoTotal || 0).toLocaleString("es-CO")}).` });
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
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
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

                        {/* Tipo Venta (Standard CustomSelect) */}
                        <div className="flex flex-col gap-0">
                            <CustomSelect
                                label="Tipo Venta *"
                                icon={FileText}
                                options={opcionesTipoVenta}
                                value={formData.tipoVenta}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, tipoVenta: val }));
                                    tocar("tipoVenta");
                                }}
                            />
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
                        <Calendar
                            fechaISO={formData.fecha}
                            onFechaChange={(val) => {
                                setFormData(prev => ({ ...prev, fecha: val }));
                                tocar("fecha");
                            }}
                            label="Fecha"
                            required={true}
                        />

                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Estado</span></div>
                            <input
                                type="text"
                                readOnly
                                value={formData.estado}
                                className="bg-gray-200/70 rounded-xl px-4 py-3 text-sm shadow-inner text-gray-500 cursor-default outline-none"
                            />
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS */}
                    <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4 w-full">
                        {/* ENCABEZADO */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                                <Boxes size={20} />
                                <span>Productos</span>
                            </div>
                            <div className="flex gap-3">
                                <PrimaryButton
                                    type="button"
                                    icon={Plus}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Agregar Producto
                                </PrimaryButton>
                            </div>
                        </div>

                        {productosError && (
                            <div className="flex items-center gap-1 text-xs text-red-500 mb-2">
                                <AlertCircle size={12} /><span>{productosError}</span>
                            </div>
                        )}

                        {/* TABLA */}
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="px-4 py-2 font-semibold">Producto</th>
                                        <th className="px-4 py-2 font-semibold text-center w-24">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold text-center w-28">Precio Unit</th>
                                        <th className="px-4 py-2 font-semibold text-center w-32">Subtotal</th>
                                        <th className="px-4 py-2 font-semibold text-center w-16">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-400">
                                                No hay productos agregados. Haga clic en "Agregar Producto".
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedProducts.map((producto) => (
                                            <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-800">{producto.nombre}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={producto.cantidad}
                                                        onChange={(e) => handleProductChange(producto.id, "cantidad", e.target.value)}
                                                        min="1"
                                                        className="w-full bg-gray-100 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">{formatCOP(producto.precio)}</td>
                                                <td className="px-4 py-3 text-center font-semibold">{formatCOP(producto.cantidad * producto.precio)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveProduct(producto.id)} 
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 cursor-pointer">
                                                        <Trash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {formData.tipoVenta === "Credito" && total > (resultadoDoc.cliente?.cupoTotal || 0) && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 border-t border-red-200">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">EL total supera el cupo asignado de {formatCurrency(resultadoDoc.cliente?.cupoTotal || 0)}. Ajuste las cantidades.</span>
                            </div>
                        )}
                        {/* PIE DE TABLA (TOTALES Y PAGINACIÓN INTEGRADOS) */}
                        <div className="w-full flex px-6 py-3 justify-between items-center bg-gray-50 border-t border-gray-200">
                            <div>
                                {productos.length > ITEMS_PER_PAGE && (
                                    <div className="flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-6">
                                <span className="text-gray-600 text-sm">Subtotal: <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span></span>
                                <span className="text-gray-600 text-sm">IVA (19%): <span className="font-bold text-blue-600">{formatCurrency(iva)}</span></span>
                                <span className="text-gray-600 text-sm font-bold">Total: <span className="font-bold text-green-600 text-lg">{formatCurrency(total)}</span></span>
                            </div>
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
                    onConfirm={handleSaveProduct}
                    products={availableProducts}
                    getAvailableStock={getAvailableStock}
                    title="Agregar Productos a la Venta"
                    confirmText="Cargar a la venta"
                    isCredit={formData.tipoVenta === "Credito"}
                    quotaAmount={resultadoDoc.cliente?.cupoTotal || 0}
                    currentSaleTotal={total}
                />
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}
