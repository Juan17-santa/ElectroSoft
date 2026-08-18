import { Plus, Trash2, Truck, ScanBarcode, Boxes, AlertCircle, CheckCircle2, X, Minus } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useShopping } from "../shopping/hooks/useShopping";
import { formatCOP, IVA_RATE } from "../shopping/helpers/shoppingHelpers";
import AddProductModal from "../shopping/components/AddProductModal";
import CreateProductModal from "../shopping/components/CreateProductModal";
import CreateProviderModal from "../shopping/components/CreateProviderModal";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Calendar, { formatearFecha } from "../../components/ui/Calendar";
import PrimaryButton from "../../components/ui/PrimaryButton";
import CustomSelect from "../../components/ui/CustomSelect";
import { ServicesShopping } from "../shopping/services/ServicesShopping";
import { useToast } from "../../../../context/ToastContext";

const ITEMS_PER_PAGE = 4;

// ─── Validaciones ─────────────────────────────────────────────────────────────

function validarProveedor(valor) {
    if (!valor || valor === "") return { valido: false, mensaje: "Debes seleccionar un proveedor." };
    return { valido: true, mensaje: "" };
}

function validarFecha(fecha) {
    if (!fecha) return { valido: false, mensaje: "Debes seleccionar una fecha." };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const sel = new Date(fecha);
    sel.setHours(0, 0, 0, 0);
    if (sel > hoy) return { valido: false, mensaje: "La fecha no puede ser futura." };
    return { valido: true, mensaje: "" };
}

// ─── Mini-componente: Indicador de validación ─────────────────────────────────
function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div
            className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${estado.valido ? "text-green-500 opacity-100" : "text-red-500 opacity-100"
                }`}
            style={{ minHeight: "16px" }}
        >
            {estado.valido
                ? <><CheckCircle2 size={12} /> <span>Listo</span></>
                : <><AlertCircle size={12} /> <span>{estado.mensaje}</span></>
            }
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CreateShopping() {
    const navigate = useNavigate();
    const { guardarCompra, saving } = useShopping();
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [proveedoresList, setProveedoresList] = useState([]);
    const [confirmData, setConfirmData] = useState(null);
    const [navegarACompras, setNavegarACompras] = useState(false);
    const [, setCatalogLoading] = useState(false);

    // Formulario superior
    const [proveedorId, setProveedorId] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [fechaISO, setFechaISO] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [proveedorTocado, setProveedorTocado] = useState(false);
    const [fechaTocada, setFechaTocada] = useState(false);
    const [numeroFacturaTocado, setNumeroFacturaTocado] = useState(false);

    // Productos en tabla
    const [productos, setProductos] = useState([]);

    // Estado de validación del número de factura consultado al servidor.
    const [estadoNumeroFactura, setEstadoNumeroFactura] = useState(null);
    const facturaTimerRef = useRef(null);
    const facturaCheckRef = useRef("");

    const validarNumeroFacturaAsync = useCallback(async (valor) => {
        if (!valor || valor === "") return { valido: false, mensaje: "Debes ingresar un número de factura." };
        if (!/^\d+$/.test(valor)) return { valido: false, mensaje: "Solo se permiten números." };
        const existe = await ServicesShopping.checkInvoiceExists(valor);
        if (existe) return { valido: false, mensaje: "Este numero de factura ya esta en uso." };
        return { valido: true, mensaje: "" };
    }, []);

    // Validación en tiempo real con debounce para no saturar el servidor.
    useEffect(() => {
        if (!numeroFacturaTocado || !numeroFactura) {
            setEstadoNumeroFactura(null);
            return;
        }

        facturaCheckRef.current = numeroFactura;
        if (facturaTimerRef.current) clearTimeout(facturaTimerRef.current);

        facturaTimerRef.current = setTimeout(async () => {
            const valorActual = facturaCheckRef.current;
            if (valorActual !== numeroFactura) return;
            const res = await validarNumeroFacturaAsync(numeroFactura);
            if (facturaCheckRef.current !== numeroFactura) return;
            setEstadoNumeroFactura(res);
        }, 300);

        return () => {
            if (facturaTimerRef.current) clearTimeout(facturaTimerRef.current);
        };
    }, [numeroFactura, numeroFacturaTocado, validarNumeroFacturaAsync]);

    useEffect(() => {
        let mounted = true;
        setCatalogLoading(true);
        ServicesShopping.fetchProviders()
            .then((data) => {
                if (mounted) setProveedoresList(data.filter((p) => p.estado !== false));
            })
            .catch((err) => {
                if (mounted) {
                    setProveedoresList([]);
                    showToast("error", err.message || "No se pudieron cargar los proveedores.");
                }
            })
            .finally(() => {
                if (mounted) setCatalogLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [showToast]);

    // Navegación reactiva: se dispara cuando finalizarCompra marca navegarACompras=true.
    // Usar useEffect en lugar de setTimeout dentro de un closure evita problemas
    // con batching de React 18 y closures stale.
    useEffect(() => {
        if (!navegarACompras) return;
        const timer = setTimeout(() => {
            setProveedorId("");
            setProveedor("");
            setFechaISO("");
            setNumeroFactura("");
            setProductos([]);
            navigate("/dashboard/shopping");
        }, 1500);
        return () => clearTimeout(timer);
    }, [navegarACompras, navigate]);

    // ─── Protección de navegación ─────────────────────────────────────────────
    // Protección contra cierre de pestaña / refresh del navegador
    useEffect(() => {
        const tieneDatos = proveedorId || fechaISO || numeroFactura || productos.length > 0;
        if (!tieneDatos) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [proveedorId, fechaISO, numeroFactura, productos]);

    // ─── Validaciones en tiempo real ──────────────────────────────────────────
    const estadoProveedor = proveedorTocado ? validarProveedor(proveedorId) : null;
    const estadoFecha = fechaTocada ? validarFecha(fechaISO) : null;

    // ─── Cálculos ─────────────────────────────────────────────────────────────
    const productosActivos = productos;

    /**
     * #3: El subtotal de la compra se calcula sobre costeProducto, que es lo que
     * realmente se le paga al proveedor en esta transacción, no sobre el precio
     * de Inventario (que es el precio de VENTA al cliente).
     */
    const subtotal = productosActivos.reduce(
        (acc, p) => acc + p.cantidad * p.costeProducto,
        0
    );
    const iva = subtotal * IVA_RATE;
    const total = subtotal; // Total es el subtotal de la tabla (sin IVA)

    // Total venta = subtotal - IVA (para mostrar como "Subtotal")
    const totalVenta = subtotal - iva;

    // ─── Paginación ───────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────

    // #7: Al cambiar el select guardamos tanto el ID como el nombre del proveedor
    const handleSelectProveedor = (id) => {
        const found = proveedoresList.find((p) => String(p.id) === String(id));
        setProveedorId(id);
        setProveedor(found?.nombreProveedor || "");
        setProveedorTocado(true);
    };

    // Al crear un proveedor desde la modal: añadirlo al select y auto-seleccionarlo
    const handleProveedorCreado = (nuevoProveedor) => {
        setProveedoresList((prev) => [...prev, nuevoProveedor]);
        setProveedorId(String(nuevoProveedor.id));
        setProveedor(nuevoProveedor.nombreProveedor);
        setProveedorTocado(true);
    };

    const handleAnadirProducto = (nuevoProducto) => {
        const { esActualizacion, sobreescribirConSugerido, isNew, nombre, categoriaId, serial, garantia, tipoStock, caracteristicas, ...producto } = nuevoProducto;
        const productoConEstado = { ...producto, sobreescribirConSugerido, isNew: !!isNew, nombre, categoriaId, serial, garantia, tipoStock, caracteristicas };

        if (esActualizacion) {
            // Actualizar el producto ya existente en la tabla
            setProductos((prev) =>
                prev.map((p) =>
                    String(p.id) === String(producto.id)
                        ? productoConEstado
                        : p
                )
            );
        } else {
            const updated = [...productos, productoConEstado];
            setProductos(updated);
            setCurrentPage(Math.ceil(updated.length / ITEMS_PER_PAGE));
        }
        setShowModal(false);
    };

    const handleEliminarProducto = (id) => {
        setProductos((prev) => prev.filter((p) => p.id !== id));
    };

    const handleQuantityChange = (productId, newQuantity) => {
        const productInfo = productos.find(p => p.id === productId);
        const maxStock = 9999;

        if (newQuantity === "") {
            setProductos(prev => prev.map(p => p.id === productId ? { ...p, cantidad: "" } : p));
            return;
        }

        let validQuantity = parseInt(newQuantity, 10);
        if (isNaN(validQuantity)) return;

        if (validQuantity > maxStock) {
            validQuantity = maxStock;
            showToast("error", `La cantidad máxima disponible para ${productInfo?.nombre || 'este producto'} es ${maxStock}`);
        }

        setProductos(prev => prev.map(p =>
            p.id === productId
                ? { ...p, cantidad: validQuantity, subtotal: validQuantity * p.costeProducto }
                : p
        ));
    };

    const handleQuantityBlur = (productId) => {
        setProductos(prev => prev.map(p => {
            if (p.id === productId) {
                const num = parseInt(p.cantidad, 10);
                if (isNaN(num) || num < 1) return { ...p, cantidad: 1, subtotal: 1 * p.costeProducto };
            }
            return p;
        }));
    };

    const finalizarCompra = async (productosParaGuardar) => {
        try {
            await guardarCompra({
                numeroFactura,
                fechaFactura: formatearFecha(fechaISO),
                proveedor,
                proveedorId,
                total,
                productos: productosParaGuardar,
            });

            showToast("success", `Compra registrada exitosamente. Numero de factura: ${numeroFactura}`);
            setNumeroFacturaTocado(false);
            setNavegarACompras(true);
        } catch (err) {
            showToast("error", err.message || "No se pudo registrar la compra.");
        }
    };

    const handleCrearCompra = async () => {
        setProveedorTocado(true);
        setFechaTocada(true);
        setNumeroFacturaTocado(true);
        setConfirmData(null);

        const vProv = validarProveedor(proveedorId);
        const vFech = validarFecha(fechaISO);
        const vNumFact = await validarNumeroFacturaAsync(numeroFactura);
        setEstadoNumeroFactura(vNumFact);

        if (!vProv.valido || !vFech.valido || !vNumFact.valido) return;

        const productosActuales = productos;
        if (productosActuales.length === 0) {
            setConfirmData({
                type: "warning",
                title: "Sin productos",
                message: "Debes añadir al menos un producto activo a la compra.",
                onConfirm: () => setConfirmData(null),
            });
            return;
        }

        const productosParaGuardar = productosActuales.map(
            ({ id, nombre, cantidad, precio, costeProducto, precioVenta, precioVentaOriginal, subtotal, sobreescribirConSugerido, usarPrecioSugerido, isNew, categoriaId, serial, garantia, tipoStock, caracteristicas }) => {
                const base = {
                    id, nombre, cantidad, precio,
                    costeProducto: costeProducto || precio,
                    precioVenta: precioVenta || precio,
                    precioVentaOriginal: precioVentaOriginal || precioVenta || precio,
                    subtotal,
                    sobreescribirConSugerido: !!(usarPrecioSugerido ?? sobreescribirConSugerido),
                    usarPrecioSugerido: !!(usarPrecioSugerido ?? sobreescribirConSugerido),
                };
                if (isNew) {
                    base.isNew = true;
                    base.newProduct = {
                        name: nombre,
                        categoryId: categoriaId,
                        serial: serial || "",
                        warranty: garantia || "",
                        typeStock: tipoStock || "unidad",
                        characteristics: (caracteristicas || []).map((c) => ({
                            name: c.nombre ?? c.name,
                            unit: c.medida ?? c.unit ?? "-",
                            value: c.valor ?? c.value ?? "",
                            visible: c.visible !== false,
                        })),
                    };
                }
                return base;
            }
        );

        // Confirmar antes de guardar
        setConfirmData({
            type: "info",
            title: "Confirmar compra",
            message: `¿Confirmar la compra de ${productosActuales.length} producto(s) por un total de ${formatCOP(Math.round(total))}?`,
            onConfirm: async () => {
                setConfirmData(null);
                await finalizarCompra(productosParaGuardar);
            },
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative overflow-y-auto">

                {/* TITULO */}
                <div className="flex justify-between">
                    <p className="text-xl font-semibold">
                        Nueva Compra
                    </p>

                    <button
                        onClick={() => {
                            const tieneDatos = proveedorId || fechaISO || numeroFactura || productos.length > 0;
                            if (tieneDatos) {
                                setConfirmData({
                                    type: "info",
                                    title: "¿Salir sin guardar?",
                                    message: "Tienes datos sin guardar en la compra. Si sales ahora perderás el progreso.",
                                    onConfirm: () => navigate("/dashboard/shopping"),
                                });
                            } else {
                                navigate("/dashboard/shopping");
                            }
                        }}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* LÍNEA DIVISORA */}
                <div className="h-0.5 bg-linear-to-r from-yellow-400 to-transparent"></div>

                {/* CAMPOS SUPERIORES */}

                <div className="flex flex-wrap gap-6 items-start">

                    {/* --- SECCIÓN PROVEEDOR --- */}
                    <div className="flex flex-col w-full md:w-64">
                        <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                                <CustomSelect
                                    label="Proveedor *"
                                    icon={Truck}
                                    options={proveedoresList.map(p => ({
                                        value: String(p.id),
                                        label: p.nombreProveedor
                                    }))}
                                    value={proveedorId}
                                    onChange={(val) => handleSelectProveedor(val)}
                                    placeholder={"No seleccionado"}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateProviderModal(true)}
                                className="bg-yellow-400 hover:bg-yellow-500 transition duration-300 p-3 rounded-xl shadow-md cursor-pointer mt-7"
                                title="Crear nuevo proveedor"
                            >
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>
                        <div className="mt-2">
                            <FieldStatus estado={estadoProveedor} />
                        </div>
                    </div>

                    {/* FECHA FACTURA */}
                    <div className="flex flex-col gap-2 w-full md:w-56">
                        {/*
                         * Solución para bloquear fechas futuras:
                         * 1. Pasamos maxDate como prop (soportado si Calendar lo acepta).
                         * 2. El ref callback inyecta el atributo `max` directamente en el
                         *    input[type=date] subyacente — funciona independientemente de
                         *    cómo esté implementado Calendar, sin modificarlo.
                         * 3. onFechaChange filtra programáticamente fechas futuras.
                         * 4. validarFecha() rechaza fechas futuras al enviar el formulario.
                         */}
                        <div
                            ref={(el) => {
                                if (!el) return;
                                const today = new Date().toISOString().split("T")[0];
                                const input = el.querySelector('input[type="date"]');
                                if (input && input.max !== today) input.max = today;
                            }}
                        >
                            <Calendar
                                fechaISO={fechaISO}
                                onFechaChange={(iso) => {
                                    const today = new Date().toISOString().split("T")[0];
                                    // Bloqueo funcional: ignorar fechas futuras
                                    if (iso && iso > today) return;
                                    setFechaISO(iso);
                                    setFechaTocada(true);
                                }}
                                label="Fecha Factura"
                                required={true}
                                maxDate={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                        <FieldStatus estado={estadoFecha} />
                    </div>

                    {/* NÚMERO FACTURA */}
                    <div className="flex flex-col gap-2 w-full md:w-56">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <ScanBarcode size={20} />
                            <span>Número Factura *</span>
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={numeroFactura}
                                onChange={(e) => {
                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                    setNumeroFactura(valor);
                                    setNumeroFacturaTocado(true);
                                }}
                                maxLength="10"
                                onBlur={() => setNumeroFacturaTocado(true)}
                                placeholder="Ej: 12345"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoNumeroFactura === null
                                        ? "focus:ring-gray-400 text-gray-500"
                                        : estadoNumeroFactura.valido
                                            ? "focus:ring-green-400 ring-1 ring-green-300 text-gray-700"
                                            : "focus:ring-red-400 ring-1 ring-red-300 text-gray-500"
                                    }`}
                            />
                            <FieldStatus estado={estadoNumeroFactura} />
                        </div>
                    </div>

                </div>

                {/* SECCIÓN PRODUCTOS */}
                <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4">

                    <div className="flex md:flex-row md:justify-between flex-col gap-4">

                        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                            <Boxes size={20} />
                            <span>Productos</span>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-4 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                            >
                                <Plus size={16} />
                                Añadir producto
                            </button>
                        </div>
                    </div>

                    {/* TABLA */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr className="text-left border-b border-gray-200">
                                    <th className="px-4 py-2 font-semibold">Producto</th>
                                    <th className="px-4 py-2 font-semibold text-center">Cantidad</th>
                                    <th className="px-4 py-2 font-semibold text-center">Precio inventario</th>
                                    <th className="px-4 py-2 font-semibold text-center">Coste compra</th>
                                    <th className="px-4 py-2 font-semibold text-center">Precio venta</th>
                                    <th className="px-4 py-2 font-semibold text-center">Subtotal</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {productosPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-5 text-center text-gray-400">
                                            Añade productos a la compra.
                                        </td>
                                    </tr>
                                ) : (
                                    productosPagina.map((producto) => (
                                        <tr key={producto.id}>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                <span className="flex items-center gap-2">
                                                    {producto.nombre}
                                                </span>
                                            </td>
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
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-gray-400">
                                                {formatCOP(producto.precio)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-gray-600 font-medium">
                                                {formatCOP(producto.costeProducto)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-blue-500 font-medium">
                                                {formatCOP(producto.precioVenta)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                {formatCOP(producto.subtotal)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                <button
                                                    onClick={() => setConfirmData({
                                                        type: "delete",
                                                        title: "Eliminar producto",
                                                        message: `¿Seguro que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
                                                        onConfirm: () => {
                                                            handleEliminarProducto(producto.id);
                                                            setConfirmData(null);
                                                            showToast("success", "El producto fue eliminado de la compra.");
                                                        }
                                                    })}
                                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition duration-300 cursor-pointer"
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINADOR Y TOTALES */}
                    <div className={`flex items-center mt-2 ${productosPagina.length > 0 ? 'justify-between' : 'justify-end'}`}>
                        {productosPagina.length > 0 && (
                            <Pagination
                                currentPage={paginaActual}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                        <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm font-medium text-gray-700">
                            <span>
                                Subtotal:
                                <span className="font-semibold ml-1">
                                    {formatCOP(Math.round(totalVenta))}
                                </span>
                            </span>
                            <span>
                                IVA (19%):
                                <span className="font-semibold ml-1">{formatCOP(Math.round(iva))}</span>
                            </span>
                            <span>
                                Total:
                                <span className="font-bold text-base ml-1">{formatCOP(Math.round(total))}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* BOTONES CANCELAR Y CREAR */}
                <div className="flex justify-end gap-3 mt-auto">
                    <button
                        onClick={() => setConfirmData({
                            type: "info",
                            title: "¿Cancelar compra?",
                            message: "Si cancelas ahora perderás los datos ingresados. ¿Estás seguro?",
                            onConfirm: () => navigate("/dashboard/shopping")
                        })}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <span>✕</span>
                        Cancelar
                    </button>
                    <PrimaryButton
                        onClick={handleCrearCompra}
                        disabled={saving}
                    >
                        {saving ? "Creando..." : "Crear Compra"}
                    </PrimaryButton>
                </div>

            </div>

            {/* ── MODALES GLOBALES ─────────────────────────────────────────────
                Montados FUERA del div scrollable para que los modales con
                `fixed inset-0` cubran toda la ventana (navbar + sidebar).
                ConfirmModal y Alert ya usan `fixed` internamente.
            ────────────────────────────────────────────────────────────────── */}

            {/* MODAL AÑADIR PRODUCTO */}
            {showModal && (
                <AddProductModal
                    onClose={() => setShowModal(false)}
                    onAnadir={handleAnadirProducto}
                    productosYaAgregados={productos}
                />
            )}

            {/* MODAL CREAR PRODUCTO */}
            {showCreateProductModal && (
                <CreateProductModal
                    onClose={() => setShowCreateProductModal(false)}
                    onSuccess={() => { }}
                />
            )}

            {/* MODAL CREAR PROVEEDOR */}
            {showCreateProviderModal && (
                <CreateProviderModal
                    onClose={() => setShowCreateProviderModal(false)}
                    onSuccess={handleProveedorCreado}
                />
            )}

            {/* MODAL CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
        </>
    );
}