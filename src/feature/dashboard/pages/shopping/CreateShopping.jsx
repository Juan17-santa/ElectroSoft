import { Plus, Trash, Truck, CalendarDays, ScanBarcode, Boxes, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShopping } from "../shopping/hooks/useShopping";
import { formatCOP, IVA_RATE, getNextNumeroFactura } from "../shopping/helpers/shoppingHelpers";
import AddProductModal from "../shopping/components/AddProductModal";
import Pagination from '../../components/ui/Pagination';

const ITEMS_PER_PAGE = 4;

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ─── Validaciones ─────────────────────────────────────────────────────────────
function validarProveedor(valor) {
    if (!valor || valor === "") return { valido: false, mensaje: "Debes seleccionar un proveedor." };
    return { valido: true, mensaje: "" };
}

function validarFecha(fecha) {
    if (!fecha) return { valido: false, mensaje: "" }; // sin tocar aún → neutro
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

// ─── Calendario personalizado ─────────────────────────────────────────────────
function Calendario({ fechaSeleccionada, onSeleccionar, onCerrar }) {
    const hoy = new Date();
    const [viewYear, setViewYear] = useState(fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00").getFullYear() : hoy.getFullYear());
    const [viewMonth, setViewMonth] = useState(fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00").getMonth() : hoy.getMonth());
    const [animDir, setAnimDir] = useState(null); // "left" | "right"
    const [animKey, setAnimKey] = useState(0);

    const navMes = (dir) => {
        setAnimDir(dir === 1 ? "right" : "left");
        setAnimKey(k => k + 1);
        let m = viewMonth + dir;
        let y = viewYear;
        if (m > 11) { m = 0; y++; }
        if (m < 0) { m = 11; y--; }
        setViewMonth(m);
        setViewYear(y);
    };

    const primerDia = new Date(viewYear, viewMonth, 1).getDay();
    const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate();
    const celdas = Array(primerDia).fill(null).concat(Array.from({ length: diasEnMes }, (_, i) => i + 1));

    const esFuturo = (dia) => {
        const fecha = new Date(viewYear, viewMonth, dia);
        fecha.setHours(0, 0, 0, 0);
        const h = new Date(); h.setHours(0, 0, 0, 0);
        return fecha > h;
    };

    const esHoy = (dia) => {
        return dia === hoy.getDate() && viewMonth === hoy.getMonth() && viewYear === hoy.getFullYear();
    };

    const esSeleccionado = (dia) => {
        if (!fechaSeleccionada) return false;
        const s = new Date(fechaSeleccionada + "T00:00:00");
        return dia === s.getDate() && viewMonth === s.getMonth() && viewYear === s.getFullYear();
    };

    const handleDia = (dia) => {
        if (esFuturo(dia)) return;
        const mes = String(viewMonth + 1).padStart(2, "0");
        const d = String(dia).padStart(2, "0");
        onSeleccionar(`${viewYear}-${mes}-${d}`);
        onCerrar();
    };

    return (
        <div
            className="absolute z-50 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72"
            style={{ animation: "fadeSlideDown 0.25s cubic-bezier(.4,0,.2,1)" }}
        >
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={() => navMes(-1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                >
                    <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-gray-700 select-none">
                    {MESES[viewMonth]} {viewYear}
                </span>
                <button
                    onClick={() => navMes(1)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                >
                    <ChevronRight size={18} className="text-gray-500" />
                </button>
            </div>

            {/* Días de semana */}
            <div className="grid grid-cols-7 mb-1">
                {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1 select-none">{d}</div>
                ))}
            </div>

            {/* Celdas del mes */}
            <div
                key={animKey}
                className="grid grid-cols-7 gap-y-0.5"
                style={{ animation: `slideIn${animDir === "right" ? "Right" : animDir === "left" ? "Left" : "Right"} 0.22s cubic-bezier(.4,0,.2,1)` }}
            >
                {celdas.map((dia, i) => {
                    if (!dia) return <div key={`empty-${i}`} />;
                    const futuro = esFuturo(dia);
                    const hoyFlag = esHoy(dia);
                    const sel = esSeleccionado(dia);
                    return (
                        <button
                            key={dia}
                            onClick={() => handleDia(dia)}
                            disabled={futuro}
                            className={`
                                w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium
                                transition-all duration-200 cursor-pointer
                                ${sel ? "bg-yellow-400 text-black shadow-md scale-110" : ""}
                                ${!sel && hoyFlag ? "border border-yellow-400 text-yellow-600" : ""}
                                ${!sel && !hoyFlag && !futuro ? "hover:bg-yellow-100 hover:scale-105 text-gray-700" : ""}
                                ${futuro ? "text-gray-300 cursor-not-allowed" : ""}
                            `}
                        >
                            {dia}
                        </button>
                    );
                })}
            </div>

            {/* Pie: ir a hoy */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center">
                <button
                    onClick={() => {
                        const h = new Date();
                        const mes = String(h.getMonth() + 1).padStart(2, "0");
                        const d = String(h.getDate()).padStart(2, "0");
                        onSeleccionar(`${h.getFullYear()}-${mes}-${d}`);
                        onCerrar();
                    }}
                    className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition duration-300 cursor-pointer"
                >
                    Hoy
                </button>
            </div>
        </div>
    );
}

// ─── Formatea fecha ISO → DD/MM/YYYY ─────────────────────────────────────────
function formatearFecha(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CreateShopping() {
    const navigate = useNavigate();
    const { guardarCompra } = useShopping();

    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCalendario, setShowCalendario] = useState(false);

    // Formulario superior
    const [proveedor, setProveedor] = useState("");
    const [fechaISO, setFechaISO] = useState("");          // YYYY-MM-DD (interno)
    const [proveedorTocado, setProveedorTocado] = useState(false);
    const [fechaTocada, setFechaTocada] = useState(false);
    const [numeroFactura] = useState(() => getNextNumeroFactura());

    // Productos en tabla
    const [productos, setProductos] = useState([]);

    // Ref para cerrar calendario al hacer clic fuera
    const calRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (calRef.current && !calRef.current.contains(e.target)) {
                setShowCalendario(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ─── Validaciones en tiempo real ──────────────────────────────────────────
    const estadoProveedor = proveedorTocado ? validarProveedor(proveedor) : null;
    const estadoFecha = fechaTocada ? validarFecha(fechaISO) : null;

    // ─── Cálculos ─────────────────────────────────────────────────────────────
    const subtotalSinIVA = productos.reduce((acc, p) => acc + p.subtotal, 0);
    const iva = subtotalSinIVA * IVA_RATE;
    const total = subtotalSinIVA + iva;
    const totalVenta = productos.reduce((acc, p) => acc + p.cantidad * p.precioVenta, 0);

    // ─── Paginación ───────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleAnadirProducto = (nuevoProducto) => {
        const updated = [...productos, nuevoProducto];
        setProductos(updated);
        setCurrentPage(Math.ceil(updated.length / ITEMS_PER_PAGE));
        setShowModal(false);
    };

    const handleEliminar = (id) => {
        const updated = productos.filter((p) => p.id !== id);
        setProductos(updated);
        const newTotal = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
        if (paginaActual > newTotal) setCurrentPage(newTotal);
    };

    const handleCrearCompra = () => {
        setProveedorTocado(true);
        setFechaTocada(true);

        const vProv = validarProveedor(proveedor);
        const vFech = validarFecha(fechaISO);

        if (!vProv.valido) { return; }
        if (!fechaISO) { return; }
        if (!vFech.valido) { return; }
        if (productos.length === 0) {
            alert("Debes añadir al menos un producto a la compra.");
            return;
        }

        const productosParaGuardar = productos.map(({ id, nombre, cantidad, precio, subtotal }) => ({
            id, nombre, cantidad, precio, subtotal,
        }));

        guardarCompra({
            numeroFactura,
            fechaFactura: formatearFecha(fechaISO),
            proveedor,
            total,
            productos: productosParaGuardar,
        });

        alert("Se ha creado la compra exitosamente.");
        navigate("/dashboard/shopping");
    };

    return (
        <>
            {/* Animaciones globales del calendario */}
            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative">

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
                                    <option value="Suministros ABC">Suministros ABC</option>
                                    <option value="Distribuidora PDA">Distribuidora PDA</option>
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

                    {/* FECHA FACTURA — con calendario */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <CalendarDays size={20} />
                            <span>Fecha Factura *</span>
                        </div>
                        <div className="relative" ref={calRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCalendario(v => !v);
                                    setFechaTocada(true);
                                }}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-52 text-left transition-all duration-300
                                    focus:outline-none focus:ring-2 cursor-pointer flex items-center justify-between gap-2
                                    ${estadoFecha === null
                                        ? "focus:ring-gray-400 text-gray-400"
                                        : estadoFecha.valido
                                            ? "ring-1 ring-green-300 text-gray-700"
                                            : "ring-1 ring-red-300 text-gray-400"
                                    }`}
                            >
                                <span className={fechaISO ? "text-gray-700" : "text-gray-400"}>
                                    {fechaISO ? formatearFecha(fechaISO) : "Seleccionar fecha"}
                                </span>
                                <CalendarDays size={16} className={`transition duration-300 ${showCalendario ? "text-yellow-500 rotate-6" : "text-gray-400"}`} />
                            </button>
                            <FieldStatus estado={estadoFecha} />

                            {/* CALENDARIO DESPLEGABLE */}
                            {showCalendario && (
                                <Calendario
                                    fechaSeleccionada={fechaISO}
                                    onSeleccionar={(iso) => {
                                        setFechaISO(iso);
                                        setFechaTocada(true);
                                    }}
                                    onCerrar={() => setShowCalendario(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* NÚMERO FACTURA — solo lectura */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <ScanBarcode size={20} />
                            <span>Número Factura</span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={numeroFactura}
                                readOnly
                                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-sm shadow-md w-52 text-gray-500 cursor-not-allowed select-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 italic">auto</span>
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
                                onClick={() => navigate("/dashboard/products/create")}
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
                                    <th className="px-4 py-2 font-semibold text-center">Precio</th>
                                    <th className="px-4 py-2 font-semibold text-center">Precio venta</th>
                                    <th className="px-4 py-2 font-semibold text-center">Subtotal</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
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
                        onClick={() => navigate("/dashboard/shopping")}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <span>✕</span>
                        Cancelar
                    </button>
                    <button
                        onClick={handleCrearCompra}
                        className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <Plus size={16} />
                        Crear Compra
                    </button>
                </div>

                {/* MODAL */}
                {showModal && (
                    <AddProductModal
                        onClose={() => setShowModal(false)}
                        onAnadir={handleAnadirProducto}
                    />
                )}

            </div>
        </>
    );
}
