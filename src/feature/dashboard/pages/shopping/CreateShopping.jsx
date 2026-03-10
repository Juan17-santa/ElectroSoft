import { Plus, Ban, Eye, Truck, ScanBarcode, Boxes, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShopping } from "../shopping/hooks/useShopping";
import { formatCOP, IVA_RATE, numeroFacturaYaExiste } from "../shopping/helpers/shoppingHelpers";
import AddProductModal from "../shopping/components/AddProductModal";
import CreateProductModal from "../shopping/components/CreateProductModal";
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from "../../components/ui/ConfirmModal";
import { ServicesProviders } from "../providers/services/ServicesProviders";
import Alert from "../../components/ui/Alert";
import Calendar, { formatearFecha } from "../../components/ui/Calendar";
import PrimaryButton from "../../components/ui/PrimaryButton";
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

function validarNumeroFactura(valor) {
    if (!valor || valor === "") return { valido: false, mensaje: "Debes ingresar un número de factura." };
    if (!/^\d+$/.test(valor)) return { valido: false, mensaje: "Solo se permiten números." };
    if (numeroFacturaYaExiste(valor)) return { valido: false, mensaje: "Este número de factura ya está en uso." };
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
    const { guardarCompra } = useShopping();

    const [showModal, setShowModal] = useState(false);
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [proveedoresList, setProveedoresList] = useState([]);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);

    // Formulario superior
    const [proveedor, setProveedor] = useState("");
    const [fechaISO, setFechaISO] = useState("");          // YYYY-MM-DD (interno)
    const [numeroFactura, setNumeroFactura] = useState("");
    const [proveedorTocado, setProveedorTocado] = useState(false);
    const [fechaTocada, setFechaTocada] = useState(false);
    const [numeroFacturaTocado, setNumeroFacturaTocado] = useState(false);

    // Productos en tabla
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const data = ServicesProviders.get();
        setProveedoresList(data);
    }, []);

    // ─── Validaciones en tiempo real ──────────────────────────────────────────
    const estadoProveedor = proveedorTocado ? validarProveedor(proveedor) : null;
    const estadoFecha = fechaTocada ? validarFecha(fechaISO) : null;
    const estadoNumeroFactura = numeroFacturaTocado ? validarNumeroFactura(numeroFactura) : null;

    // ─── Cálculos ─────────────────────────────────────────────────────────────
    // Solo contar productos activos (no anulados) en los cálculos
    const productosActivos = productos.filter((p) => !p.anulado);
    // Subtotal y IVA se calculan en base al precio (no coste)
    const subtotalSinIVA = productosActivos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
    const iva = subtotalSinIVA * IVA_RATE;
    const total = subtotalSinIVA + iva;
    const totalVenta = productosActivos.reduce((acc, p) => acc + p.cantidad * p.precioVenta, 0);

    // ─── Paginación ───────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleAnadirProducto = (nuevoProducto) => {
        // Agregar estado anulado como false al nuevo producto
        const productoConEstado = {
            ...nuevoProducto,
            anulado: false
        };
        const updated = [...productos, productoConEstado];
        setProductos(updated);
        setCurrentPage(Math.ceil(updated.length / ITEMS_PER_PAGE));
        setShowModal(false);
    };

    const handleAnularProducto = (id) => {
        // Marcar producto como anulado en lugar de eliminarlo
        const updated = productos.map((p) =>
            p.id === id ? { ...p, anulado: true } : p
        );
        setProductos(updated);
    };

    const handleCrearCompra = () => {
        setProveedorTocado(true);
        setFechaTocada(true);
        setNumeroFacturaTocado(true);
        setConfirmData(null); // cierra el modal de confirmación

        const vProv = validarProveedor(proveedor);
        const vFech = validarFecha(fechaISO);
        const vNumFact = validarNumeroFactura(numeroFactura);

        if (!vProv.valido || !fechaISO || !vFech.valido || !vNumFact.valido) return;

        const productosActuales = productos.filter((p) => !p.anulado);
        if (productosActuales.length === 0) {
            setAlert({ type: "error", message: "Debes añadir al menos un producto activo a la compra." });
            return;
        }

        // Guardar productos con todos sus campos incluído costeProducto y precioVenta
        const productosParaGuardar = productosActuales.map(({ id, nombre, cantidad, precio, costeProducto, precioVenta, subtotal }) => ({
            id, 
            nombre, 
            cantidad, 
            precio, 
            costeProducto: costeProducto || precio,
            precioVenta: precioVenta || precio,
            subtotal,
        }));

        guardarCompra({
            numeroFactura,
            fechaFactura: formatearFecha(fechaISO),
            proveedor,
            total,
            productos: productosParaGuardar,
        });

        // Desactivar validación del campo para evitar mostrar error después de guardar
        setNumeroFacturaTocado(false);

        setAlert({ type: "success", message: "La compra fue registrada correctamente." });
        setTimeout(() => navigate("/dashboard/shopping"), 1500);
    };

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative">

                {/* TITULO */}
                <p className="text-xl font-semibold">
                    <Plus size={20} className="inline mr-2 text-yellow-400" />
                    Nueva Compra
                </p>

                {/* LÍNEA DIVISORA */}
                <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>

                {/* CAMPOS SUPERIORES */}
                <div className="flex flex-wrap gap-6 items-start">

                    {/* PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Truck size={20} />
                            <span>Proveedor *</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <select
                                    value={proveedor}
                                    onChange={(e) => {
                                        setProveedor(e.target.value);
                                        setProveedorTocado(true);
                                    }}
                                    onBlur={() => setProveedorTocado(true)}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-52 cursor-pointer transition-all duration-300
                                        ${estadoProveedor === null
                                            ? "focus:ring-gray-400 text-gray-500"
                                            : estadoProveedor.valido
                                                ? "focus:ring-green-400 ring-1 ring-green-300 text-gray-700"
                                                : "focus:ring-red-400 ring-1 ring-red-300 text-gray-500"
                                        }`}
                                >
                                    <option value="">— No seleccionado —</option>
                                    {proveedoresList.map((p) => (
                                        <option key={p.id} value={p.nombreProveedor}>{p.nombreProveedor}</option>
                                    ))}
                                </select>
                                <FieldStatus estado={estadoProveedor} />
                            </div>
                            <button
                                onClick={() => navigate("/dashboard/provider/create")}
                                className="bg-yellow-400 hover:bg-yellow-500 transition duration-300 p-3 rounded-xl shadow-md cursor-pointer self-start"
                            >
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* FECHA FACTURA */}
                    <div className="flex flex-col gap-2">
                        <Calendar
                            fechaISO={fechaISO}
                            onFechaChange={(iso) => {
                                setFechaISO(iso);
                                setFechaTocada(true);
                            }}
                            label="Fecha Factura"
                            required={true}
                        />
                        <FieldStatus estado={estadoFecha} />
                    </div>

                    {/* NÚMERO FACTURA — manual */}
                    <div className="flex flex-col gap-2">
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
                                onBlur={() => setNumeroFacturaTocado(true)}
                                placeholder="Ej: 12345"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-52 transition-all duration-300
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

                    {/* ENCABEZADO */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base">
                            <Boxes size={20} />
                            <span>Productos</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateProductModal(true)}
                                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 transition duration-300 px-4 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                            >
                                <Plus size={16} />
                                Crear producto
                            </button>
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
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr className="text-left border-b border-gray-200">
                                    <th className="px-4 py-2 font-semibold">Producto</th>
                                    <th className="px-4 py-2 font-semibold text-center">Cantidad</th>
                                    <th className="px-4 py-2 font-semibold text-center">Precio unitario</th>
                                    <th className="px-4 py-2 font-semibold text-center">Coste</th>
                                    <th className="px-4 py-2 font-semibold text-center">Precio Venta</th>
                                    <th className="px-4 py-2 font-semibold text-center">Subtotal</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {productosPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                            Añade productos a la compra.
                                        </td>
                                    </tr>
                                ) : (
                                    productosPagina.map((producto) => (
                                        <tr key={producto.id} className={producto.anulado ? "opacity-50 bg-gray-50" : ""}>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                <span className="flex items-center gap-2">
                                                    {producto.nombre}
                                                    {producto.anulado && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Anulado</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{producto.cantidad}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{formatCOP(producto.precio)}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-gray-600">
                                                {formatCOP(producto.costeProducto || producto.precio)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center text-blue-500 font-medium">
                                                {formatCOP(producto.precioVenta || producto.precio)}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">{formatCOP(producto.subtotal)}</td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                {producto.anulado ? (
                                                    <button
                                                        onClick={() => {
                                                            setConfirmData({
                                                                type: "info",
                                                                title: "Reactivar producto",
                                                                message: `¿Deseas reactivar "${producto.nombre}" en la compra?`,
                                                                onConfirm: () => {
                                                                    const updated = productos.map((p) =>
                                                                        p.id === producto.id ? { ...p, anulado: false } : p
                                                                    );
                                                                    setProductos(updated);
                                                                    setConfirmData(null);
                                                                }
                                                            });
                                                        }}
                                                        className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                        title="Reactivar producto"
                                                    >
                                                        <Eye size={16} className="text-blue-600" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmData({
                                                            type: "delete",
                                                            title: "Anular producto",
                                                            message: `¿Seguro que deseas anular "${producto.nombre}"? Se excluirá de los totales pero seguirá registrado.`,
                                                            onConfirm: () => {
                                                                handleAnularProducto(producto.id);
                                                                setConfirmData(null);
                                                            }
                                                        })}
                                                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition duration-300 cursor-pointer"
                                                        title="Anular producto"
                                                    >
                                                        <Ban size={16} className="text-red-600" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINADOR E IVA/TOTAL */}
                    <div className="flex items-center justify-between mt-2">

                        <Pagination
                            currentPage={paginaActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />

                        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
                            <span>Total venta: <span className="font-semibold text-blue-500">{formatCOP(Math.round(totalVenta))}</span></span>
                            <span>IVA (19%): <span className="font-semibold">{formatCOP(Math.round(iva))}</span></span>
                            <span>Total: <span className="font-bold text-base">{formatCOP(Math.round(total))}</span></span>
                        </div>

                    </div>
                </div>

                {/* BOTONES CANCELAR Y CREAR */}
                <div className="flex justify-end gap-3 mt-2">
                    <button
                        onClick={() => setConfirmData({
                            type: "warning",
                            title: "¿Cancelar compra?",
                            message: "Si cancelas ahora perderás los datos ingresados. ¿Estás seguro?",
                            onConfirm: () => navigate("/dashboard/shopping")
                        })}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <span>✕</span>
                        Cancelar
                    </button>
                    <PrimaryButton icon={Plus} onClick={() => setConfirmData({
                        type: "info",
                        title: "Confirmar compra",
                        message: `¿Deseas registrar la compra con ${productosActivos.length} producto(s)?`,
                        onConfirm: handleCrearCompra
                    })}>
                        Crear Compra
                    </PrimaryButton>
                </div>
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
                        onSuccess={() => {
                            // El componente AddProductModal se encargará de recargar la lista
                            // Esta modal solo notifica el cierre
                        }}
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

            </div>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}