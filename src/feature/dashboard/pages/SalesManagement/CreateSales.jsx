import { User, FileText, X, Plus, Minus, Trash, AlertCircle, CheckCircle2, ChevronDown, Boxes } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/ui/CustomSelect";
import { SalesService } from "./services/SalesService";
import { ServicesProducts } from "../products/services/ServicesProducts";
import { ClientsService } from "../Clients/services/ClientsService";
import paymentsService from "../payments/services/paymentsService";
import AddProductModal from "../../components/ui/AddProductModal";
import Alert from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNoCupoModal, setShowNoCupoModal] = useState(false);

    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const clientDropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const now = new Date();
    const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - 3);

    const [formData, setFormData] = useState({
        numeroDocumento: "",
        tipoVenta: "",
        diasPlazo: "",
        fecha: (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        })(),
        estado: "Vigente"
    });

    const [tocado, setTocado] = useState({ numeroDocumento: false, fecha: false, tipoVenta: false, diasPlazo: false, montoCredito: false });
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

    const [montoCredito, setMontoCredito] = useState("");
    const [cupoResumen, setCupoResumen] = useState(null);

    // Cuando hay un cliente válido seleccionado, obtener su cupo disponible real
    useEffect(() => {
        if (resultadoDoc.cliente && resultadoDoc.valido) {
            paymentsService.getResumenCliente(resultadoDoc.cliente.documento)
                .then(resumen => setCupoResumen(resumen))
                .catch(() => setCupoResumen(null));
        } else {
            setCupoResumen(null);
        }
    }, [resultadoDoc.cliente?.id]);

    // Opciones siempre visibles — el bloqueo se hace con alerta inline
    const clienteTieneCupo = resultadoDoc.cliente?.cupoActivo && (resultadoDoc.cliente?.cupoTotal || 0) > 0;
    // Usar el cupoDisponible real del resumen (que descuenta la deuda activa)
    const cupoDisponible = cupoResumen
        ? Math.max(0, cupoResumen.cupoDisponible)
        : (clienteTieneCupo ? (resultadoDoc.cliente?.cupoTotal || 0) : 0);
    const cupoTotal = cupoResumen?.cupoCredito || resultadoDoc.cliente?.cupoTotal || 0;

    const opcionesTipoVenta = [
        { value: "Contado", label: "Contado" },
        { value: "Credito", label: "Crédito" },
        { value: "Mixto", label: "Mixto" }
    ];

    const calcularTotales = () => {
        const tot = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
        const sub = tot / 1.19;
        const iv = tot - sub;
        return { subtotal: sub, iva: iv, total: tot };
    };
    const { subtotal, iva, total } = calcularTotales();

    const isCreditBlocked = (formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") && resultadoDoc.valido && !clienteTieneCupo;
    // Verificar que el total no supere el cupo DISPONIBLE (cupoTotal menos deuda activa)
    const isQuotaExceeded = formData.tipoVenta === "Credito" && resultadoDoc.valido && clienteTieneCupo && total > cupoDisponible;
    const isLowCreditAmount = (formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") && total > 0 && total < 10000;

    // Validación de montoCredito para tipo Mixto
    const montoCreditoNum = parseFloat(String(montoCredito).replace(/\D/g, "")) || 0;
    const montoContado = total > 0 ? Math.max(0, total - montoCreditoNum) : 0;
    const errorMontoCredito = formData.tipoVenta === "Mixto"
        ? (!montoCreditoNum || montoCreditoNum < 10000)
            ? "El monto a crédito debe ser mínimo de $ 10.000"
            : montoCreditoNum % 50 !== 0
                ? "El monto debe ser en múltiplos de $ 50"
                : montoCreditoNum > cupoDisponible
                    ? `No puede superar el cupo disponible (${formatCOP(cupoDisponible)})`
                    : (total > 0 && montoCreditoNum >= total)
                        ? "Si paga todo a crédito, selecciona tipo Crédito"
                        : (total > 0 && (total - montoCreditoNum) < 10000)
                            ? "La parte de contado debe ser mínimo de $ 10.000"
                            : null
        : null;

    useEffect(() => {
        // Limpiar montoCredito si cambia el tipo de venta
        if (formData.tipoVenta !== "Mixto") setMontoCredito("");
        setTocado(prev => ({ ...prev, diasPlazo: false, montoCredito: false }));
    }, [formData.tipoVenta]);

    const errorCredito = isCreditBlocked
        ? "Este cliente no tiene cupo de crédito asignado. Asígnale uno desde el módulo de Clientes."
        : isQuotaExceeded
            ? `El total (${formatCOP(total)}) supera el cupo disponible (${formatCOP(cupoDisponible)}). Reduce los productos o usa tipo Mixto.`
            : isLowCreditAmount
                ? `El monto total (${formatCOP(total)}) es inferior a $10.000. No se otorgan créditos por montos tan bajos; cóbralo de Contado.`
                : null;

    const validarTipoVenta = () => {
        if (!formData.tipoVenta) return { valido: false, mensaje: "Seleccione un tipo de venta." };
        return { valido: true };
    };

    const validarDiasPlazo = () => {
        if (formData.tipoVenta === "Contado") return { valido: true };
        const dias = Number(formData.diasPlazo);
        if (formData.diasPlazo === "" || isNaN(dias)) {
            return { valido: false, mensaje: "Ingresa el plazo en días" };
        }
        if (dias < 0 || dias > 60) {
            return { valido: false, mensaje: "El plazo máximo es de 60 días" };
        }
        return { valido: true };
    };

    const estadoTipoVenta = tocado.tipoVenta ? validarTipoVenta() : null;
    const estadoDiasPlazo = tocado.diasPlazo ? validarDiasPlazo() : null;
    const estadoFecha = { valido: true };

    const ringClass = () => "focus:ring-yellow-400";

    useEffect(() => {
        // ServicesProducts.get() es async, hay que usar await o .then()
        ServicesProducts.get()
            .then(prods => setAvailableProducts(prods.filter(p => p.estado && (p.stock || 0) > 0)))
            .catch(console.error);
        // ClientsService.get() también es async
        ClientsService.get().then(setClients).catch(console.error);
    }, []);

    // Ya no forzamos resetear a Contado — el usuario ve el error inline y decide

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
        // clients ya es state actualizado async
        const found = clients.find(c => c.documento === formData.numeroDocumento);
        setClienteNombre(found ? `${found.nombres} ${found.apellidos}` : "");
    }, [formData.numeroDocumento, clients]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "numeroDocumento") value = value.slice(0, 50);
        if (name === "diasPlazo") {
            value = value.replace(/\D/g, "");
            if (value !== "" && Number(value) > 60) value = "60";
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleQuantityChange = (productId, newQuantity) => {
        const productInfo = availableProducts.find(p => (p.id || p._id) === productId);
        const maxStock = productInfo ? (productInfo.stock || 999999) : 999999;

        if (newQuantity === "") {
            setProductos(prev => prev.map(p => p.id === productId ? { ...p, cantidad: "" } : p));
            return;
        }

        let validQuantity = parseInt(newQuantity, 10);
        if (isNaN(validQuantity)) return;

        if (validQuantity > maxStock) {
            validQuantity = maxStock;
            setAlert({ type: "error", message: `La cantidad máxima disponible para ${productInfo?.nombre || 'este producto'} es ${maxStock}` });
        }

        setProductos(prev => prev.map(p => p.id === productId ? { ...p, cantidad: validQuantity } : p));
    };

    const handleQuantityBlur = (productId) => {
        setProductos(prev => prev.map(p => {
            if (p.id === productId) {
                const num = parseInt(p.cantidad, 10);
                if (isNaN(num) || num < 1) return { ...p, cantidad: 1 };
            }
            return p;
        }));
    };

    const getAvailableStock = (product) => {
        const productInSale = productos.find(p => p.nombre === product.nombre);
        const usedStock = productInSale ? productInSale.cantidad : 0;
        return (product.stock || 0) - usedStock;
    };

    const handleSaveProduct = (productosNuevos, quantity) => {
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

                //   FIX CRÍTICO: preservar el id real del producto (ObjectId de MongoDB)
                // Antes se sobreescribía con Date.now() + Math.random(), causando el error
                // "Uno o más productoId no son ObjectId válidos" al crear la venta.
                const productoId = item.id || item.productoId || item.idProducto;

                if (cant <= 0) return;

                const existingIndex = updated.findIndex(p => p.nombre === nombre);

                if (existingIndex !== -1) {
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        cantidad: updated[existingIndex].cantidad + cant
                    };
                } else {
                    updated.push({
                        id: productoId,          // ObjectId real de MongoDB
                        productoId: productoId,  // Alias explícito para SalesService.create()
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
        const totalAfterRemove = productos.length - 1;
        const totalPagesAfterRemove = Math.max(1, Math.ceil(totalAfterRemove / ITEMS_PER_PAGE));
        if (currentPage > totalPagesAfterRemove) {
            setCurrentPage(totalPagesAfterRemove);
        }
    };

    // Totales ya están calculados arriba para la validación de cupo

    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginatedProducts = productos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleForm = async (e) => {
        e.preventDefault();
        setTocado({ numeroDocumento: true, fecha: true, tipoVenta: true, diasPlazo: true, montoCredito: true });

        const vDoc = validarDocumentoCliente(formData.numeroDocumento);
        const vTipoVenta = validarTipoVenta();
        const vDiasPlazo = validarDiasPlazo();
        const vFech = Validations.campoRequerido(formData.fecha) ? { valido: true } : { valido: false };

        if (productos.length === 0) {
            setProductosError("Debe agregar al menos un producto.");
        } else {
            setProductosError("");
        }

        if (!vDoc.valido || !vFech.valido || !vTipoVenta.valido || !vDiasPlazo.valido || productos.length === 0) return;

        // Bloquear si hay error de crédito (sin cupo)
        if (errorCredito) {
            setAlert({ type: "error", message: errorCredito });
            return;
        }

        // Bloquear si tipo Mixto con montoCredito inválido
        if (formData.tipoVenta === "Mixto" && errorMontoCredito) {
            setAlert({ type: "error", message: errorMontoCredito });
            return;
        }

        setIsSubmitting(true);

        try {
            const datosVenta = {
                numeroDocumento: resultadoDoc.cliente?.id,
                tipoVenta: formData.tipoVenta === "Credito" ? "Crédito" : formData.tipoVenta,
                diasPlazo: (formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") ? Number(formData.diasPlazo) : null,
                cliente: clienteNombre,
                fecha: formData.fecha,
                estado: formData.estado,
                productos,
                subtotal,
                iva,
                total,
                montoPagado: formData.tipoVenta === "Contado" ? total : formData.tipoVenta === "Mixto" ? montoContado : 0,
                montoPorPagar: formData.tipoVenta === "Contado" ? 0 : formData.tipoVenta === "Mixto" ? montoCreditoNum : total,
                montoCredito: formData.tipoVenta === "Mixto" ? montoCreditoNum : (formData.tipoVenta === "Credito" ? total : 0),
                montoContado: formData.tipoVenta === "Mixto" ? montoContado : (formData.tipoVenta === "Contado" ? total : 0)
            };
            await SalesService.create(datosVenta);
            setAlert({ type: "success", message: "Venta registrada correctamente." });
            setTimeout(() => navigate("/dashboard/sales-management"), 1500);
        } catch (error) {
            console.error(error);
            const rawError = error?.response?.data?.error || error.message;
            let friendlyError = "Error al registrar la venta: " + rawError;

            // Traducir errores técnicos del backend a lenguaje amigable
            if (rawError.includes("ObjectId válidos") || rawError.includes("productoId no son ObjectId")) {
                friendlyError = "Hay productos en la lista que no son válidos. Por favor, elimínelos y vuelva a agregarlos.";
            } else if (rawError.includes("clienteId no es un ObjectId")) {
                friendlyError = "El cliente seleccionado no es válido.";
            }

            setAlert({ type: "error", message: friendlyError });

            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Nueva venta</p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer" onClick={() => navigate("/dashboard/sales-management")}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleForm} className="flex flex-col gap-6">

                    {/* FILA 1 — 3 columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Número Documento */}
                        <div className="flex flex-col gap-0 relative" ref={clientDropdownRef}>
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium mb-2"><FileText size={14} /><span>Buscar cliente *</span></div>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="numeroDocumento"
                                    value={formData.numeroDocumento}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setIsClientDropdownOpen(true);
                                    }}
                                    onFocus={(e) => {
                                        setIsClientDropdownOpen(true);
                                        e.target.select();
                                    }}
                                    onClick={(e) => {
                                        setIsClientDropdownOpen(true);
                                        e.target.select();
                                    }}
                                    onBlur={() => tocar("numeroDocumento")}
                                    placeholder="Buscar por cédula o nombre..."
                                    className={`w-full bg-gray-200 rounded-xl px-3 py-3 pr-8 text-sm shadow-md focus:outline-none transition-all duration-300 ${ringClass(estadoNumDoc)}`}
                                />
                                {formData.numeroDocumento && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, numeroDocumento: "" }));
                                            setClienteNombre("");
                                            setIsClientDropdownOpen(true);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {isClientDropdownOpen && formData.numeroDocumento && (
                                <div className="absolute top-18.75 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-60 overflow-y-auto">
                                    {clients.filter(c =>
                                        (c.documento?.toLowerCase() || "").includes(formData.numeroDocumento.toLowerCase()) ||
                                        (`${c.nombres} ${c.apellidos}`.toLowerCase()).includes(formData.numeroDocumento.toLowerCase())
                                    ).map(c => (
                                        <div
                                            key={c.id}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, numeroDocumento: c.documento }));
                                                setClienteNombre(`${c.nombres} ${c.apellidos}`);
                                                setIsClientDropdownOpen(false);
                                            }}
                                        >
                                            <p className="text-sm font-medium text-gray-800">{c.nombres} {c.apellidos}</p>
                                            <p className="text-xs text-gray-500">C.C. {c.documento}</p>
                                        </div>
                                    ))}
                                    {clients.filter(c =>
                                        (c.documento?.toLowerCase() || "").includes(formData.numeroDocumento.toLowerCase()) ||
                                        (`${c.nombres} ${c.apellidos}`.toLowerCase()).includes(formData.numeroDocumento.toLowerCase())
                                    ).length === 0 && (
                                            <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                                No se encontraron resultados
                                            </div>
                                        )}
                                </div>
                            )}
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
                                className="bg-gray-200/70 rounded-xl px-3 py-3 text-sm shadow-md text-gray-500 cursor-default outline-none"
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
                                    // Si selecciona crédito o mixto pero no hay cupo disponible, mostrar alerta
                                    const MIN_VENTA_CREDITO = 10000;
                                    const sinCupo = resultadoDoc.valido && (
                                        !clienteTieneCupo ||                                                // sin cupo asignado
                                        (cupoResumen !== null && cupoDisponible === 0) ||                   // cupo agotado
                                        (cupoResumen !== null && cupoDisponible < MIN_VENTA_CREDITO)        // cupo demasiado bajo
                                    );
                                    if ((val === "Credito" || val === "Mixto") && sinCupo) {
                                        setShowNoCupoModal(true);
                                        return; // No cambiar el tipo de venta todavía
                                    }
                                    setFormData(prev => ({ ...prev, tipoVenta: val }));
                                    tocar("tipoVenta");
                                }}
                                placeholder="Seleccionar tipo"
                            />
                            {estadoTipoVenta && (
                                <ValidationMessage
                                    error={!estadoTipoVenta.valido ? estadoTipoVenta.mensaje : null}
                                    success={estadoTipoVenta.valido && !errorCredito}
                                    successMessage="Listo"
                                />
                            )}
                            {/* Error inline de crédito — siempre visible si hay problema */}
                            {errorCredito && (
                                <div className="flex items-start gap-1.5 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                                    <span className="text-xs text-red-600 leading-snug">{errorCredito}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FILA 2 */}
                    <div className={`grid gap-6 ${(formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                        <div className="flex flex-col gap-0">
                            <Calendar
                                fechaISO={formData.fecha}
                                onFechaChange={(val) => {
                                    setFormData(prev => ({ ...prev, fecha: val }));
                                    tocar("fecha");
                                }}
                                label="Fecha"
                                required={true}
                                minDate={hoy}
                                maxDate={hoy}
                                className="gap-3"
                            />
                            <div className="mt-1">
                                <ValidationMessage
                                    success={true}
                                    successMessage="Listo"
                                />
                            </div>
                        </div>

                        {(formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") && (
                            <div className="flex flex-col gap-0">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Plazo días *</span></div>
                                <input
                                    type="text"
                                    name="diasPlazo"
                                    value={formData.diasPlazo}
                                    onChange={handleChange}
                                    onBlur={() => tocar("diasPlazo")}
                                    disabled={isCreditBlocked}
                                    placeholder={isCreditBlocked ? "No disponible sin cupo" : "Ej: 45 (Máx 60)"}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoDiasPlazo)} ${isCreditBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {!isCreditBlocked && (
                                    <div className="mt-1">
                                        <ValidationMessage
                                            error={!estadoDiasPlazo?.valido ? estadoDiasPlazo?.mensaje : null}
                                            success={estadoDiasPlazo?.valido}
                                            successMessage="Listo"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {formData.tipoVenta === "Mixto" && (
                            <div className="flex flex-col gap-0">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Monto a crédito *</span></div>
                                <input
                                    type="text"
                                    value={montoCredito}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        if (!raw) {
                                            setMontoCredito("");
                                        } else {
                                            let num = parseInt(raw, 10);
                                            if (num > cupoDisponible) {
                                                num = cupoDisponible;
                                            }
                                            setMontoCredito(new Intl.NumberFormat("es-CO").format(num));
                                        }
                                    }}
                                    disabled={isCreditBlocked}
                                    placeholder={isCreditBlocked ? "No disponible sin cupo" : `Máx. cupo: ${formatCOP(cupoDisponible)}`}
                                    onBlur={() => tocar("montoCredito")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${isCreditBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {!isCreditBlocked && montoCreditoNum > 0 && !errorMontoCredito && total > 0 && (
                                    <div className="mt-1.5 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <p className="text-xs text-yellow-700">Crédito: <span className="font-bold">{formatCOP(montoCreditoNum)}</span> · Paga ahora: <span className="font-bold">{formatCOP(montoContado)}</span></p>
                                    </div>
                                )}
                                {!isCreditBlocked && tocado.montoCredito && errorMontoCredito && (
                                    <div className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle size={12} className="text-red-500 shrink-0" />
                                        <span className="text-xs text-red-600">{errorMontoCredito}</span>
                                    </div>
                                )}
                            </div>
                        )}



                        <div className="flex flex-col gap-0">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Estado</span></div>
                            <input
                                type="text"
                                readOnly
                                value={formData.estado}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-inner text-gray-500 cursor-default outline-none"
                            />
                            <div className="mt-1">
                                <ValidationMessage
                                    success={true}
                                    successMessage="Listo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS */}
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
                                    onClick={() => !isCreditBlocked && setIsModalOpen(true)}
                                    className={`w-full md:w-auto justify-center ${isCreditBlocked ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''}`}
                                    title={isCreditBlocked ? "El cliente no tiene cupo de crédito" : "Añadir producto"}
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
                                        <th className="px-4 py-2 font-semibold text-center w-36">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold text-center w-28">Precio Unit</th>
                                        <th className="px-4 py-2 font-semibold text-center w-32">Subtotal</th>
                                        <th className="px-4 py-2 font-semibold text-center w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-gray-400">
                                                No hay productos agregados.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedProducts.map((producto) => (
                                            <tr key={producto.id} className="border-b border-gray-200">
                                                <td className="px-4 py-2">{producto.nombre}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="inline-flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-0.5 shadow-inner">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(producto.id, Math.max(1, (parseInt(producto.cantidad, 10) || 1) - 1))}
                                                            className="p-1 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-sm active:scale-95"
                                                            title="Disminuir cantidad"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={producto.cantidad}
                                                            onChange={(e) => handleQuantityChange(producto.id, e.target.value)}
                                                            onBlur={() => handleQuantityBlur(producto.id)}
                                                            className="w-12 text-center bg-transparent font-semibold text-sm focus:outline-none focus:bg-white rounded px-1 transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(producto.id, (parseInt(producto.cantidad, 10) || 0) + 1)}
                                                            className="p-1 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-sm active:scale-95"
                                                            title="Aumentar cantidad"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">{formatCOP(producto.precio)}</td>
                                                <td className="px-4 py-2 text-center font-semibold">{formatCOP((parseInt(producto.cantidad, 10) || 0) * producto.precio)}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(producto.id)}
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 cursor-pointer"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>


                        {/* PIE DE TABLA (TOTALES Y PAGINACIÓN INTEGRADOS) */}
                        <div className="w-full flex flex-col md:flex-row px2 md:px-6 py-3 justify-between items-start md:items-center gap-4">
                            <ValidationMessage
                                error={productosError}
                            />
                            <div>
                                {productos.length > ITEMS_PER_PAGE && (
                                    <div className="flex justify-center mt-4 mb-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex flex-wrap gap-4 md:gap-6 items-center justify-end">
                                    <span className="text-gray-600 text-sm">Subtotal: <span className="font-bold text-gray-800">{formatCOP(subtotal)}</span></span>
                                    <span className="text-gray-600 text-sm">IVA (19%): <span className="font-bold text-blue-600">{formatCOP(iva)}</span></span>
                                    <span className="text-gray-600 text-sm">Total: <span className="font-bold text-green-600 text-lg">{formatCOP(total)}</span></span>
                                </div>
                                {errorCredito && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-medium shadow-2xs max-w-lg text-right animate-pulse">
                                        <AlertCircle size={15} className="text-red-500 shrink-0" />
                                        <span><strong>Venta no permitida:</strong> {errorCredito}</span>
                                    </div>
                                )}
                                {errorMontoCredito && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-medium shadow-2xs max-w-lg text-right animate-pulse mt-2">
                                        <AlertCircle size={15} className="text-red-500 shrink-0" />
                                        <span><strong>Venta no permitida:</strong> {errorMontoCredito}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-end w-full gap-6 mt-auto">
                        <button type="button" onClick={() => navigate("/dashboard/sales-management")}
                            className="px-5 py-2.5 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer hover:shadow-lg">
                            <X size={16} />
                            Cancelar
                        </button>
                        <PrimaryButton
                            type="submit"
                            disabled={!!errorCredito || !!errorMontoCredito || isSubmitting}
                            loading={isSubmitting}
                        >
                            Crear venta
                        </PrimaryButton>
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
                    quotaAmount={cupoDisponible}
                    currentSaleTotal={total}
                    onSwitchToMixed={() => setFormData(prev => ({ ...prev, tipoVenta: "Mixto" }))}
                />
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Modal: sin cupo disponible al seleccionar Crédito/Mixto */}
            {showNoCupoModal && (
                <ConfirmModal
                    type="warning"
                    title="Sin cupo disponible"
                    message={
                        !clienteTieneCupo
                            ? `Este cliente no tiene un cupo de crédito asignado. ¿Desea realizar la venta de Contado en su lugar?`
                            : cupoDisponible === 0
                                ? `Este cliente no tiene cupo disponible. Cupo total: ${formatCOP(cupoTotal)} — Cupo ocupado: ${formatCOP(cupoResumen?.cupoOcupado || 0)}. ¿Desea realizar la venta de Contado?`
                                : `El cupo disponible (${formatCOP(cupoDisponible)}) es insuficiente para realizar ventas a crédito (mínimo ${formatCOP(10000)}). ¿Desea realizar la venta de Contado?`
                    }
                    labelConfirmar="Sí, realizar de Contado"
                    labelCancelar="No, cancelar"
                    onConfirm={() => {
                        setFormData(prev => ({ ...prev, tipoVenta: "Contado" }));
                        tocar("tipoVenta");
                        setShowNoCupoModal(false);
                    }}
                    onCancel={() => {
                        // Limpiar el tipo de venta si fue la primera selección
                        if (!formData.tipoVenta || formData.tipoVenta === "Credito" || formData.tipoVenta === "Mixto") {
                            setFormData(prev => ({ ...prev, tipoVenta: "" }));
                        }
                        setShowNoCupoModal(false);
                    }}
                />
            )}
        </>
    );
}