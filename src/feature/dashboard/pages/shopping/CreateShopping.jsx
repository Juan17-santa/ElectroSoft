import { Plus, Trash, Truck, CalendarDays, ScanBarcode, Boxes } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShopping } from "../shopping/hooks/useShopping";
import { formatCOP, IVA_RATE, getNextNumeroFactura } from "../shopping/helpers/shoppingHelpers";
import AddProductModal from "../shopping/components/AddProductModal";

const ITEMS_PER_PAGE = 3;

export default function CreateShopping() {
    const navigate = useNavigate();

    // ─── Hook — solo necesitamos guardarCompra ─────────────────────────────────
    const { guardarCompra } = useShopping();

    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Formulario superior
    const [proveedor, setProveedor] = useState("Suministros ABC");
    const [fechaFactura, setFechaFactura] = useState("");
    const [numeroFactura] = useState(() => getNextNumeroFactura());

    // Productos en tabla
    const [productos, setProductos] = useState([]);

    // ─── Cálculos ──────────────────────────────────────────────────────────────
    const subtotalSinIVA = productos.reduce((acc, p) => acc + p.subtotal, 0);

    const iva = subtotalSinIVA * IVA_RATE;
    const total = subtotalSinIVA + iva;
    const totalVenta = productos.reduce((acc, p) => acc + p.cantidad * p.precioVenta, 0);

    // ─── Paginación ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);

    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Añadir producto (viene del modal via prop onAnadir) ───────────────────
    const handleAnadirProducto = (nuevoProducto) => {
        const updated = [...productos, nuevoProducto];
        setProductos(updated);
        setCurrentPage(Math.ceil(updated.length / ITEMS_PER_PAGE));
        setShowModal(false);
    };

    // ─── Eliminar producto ─────────────────────────────────────────────────────
    const handleEliminar = (id) => {
        const updated = productos.filter((p) => p.id !== id);
        setProductos(updated);
        const newTotal = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
        if (paginaActual > newTotal) setCurrentPage(newTotal);
    };

    // ─── Crear compra ──────────────────────────────────────────────────────────
    const handleCrearCompra = () => {
        if (!fechaFactura.trim()) {
            alert("Por favor ingresa la fecha de la factura.");
            return;
        }
        if (productos.length === 0) {
            alert("Debes añadir al menos un producto a la compra.");
            return;
        }

        // Los productos se guardan SIN precioVenta (solo visual)
        const productosParaGuardar = productos.map(({ id, nombre, cantidad, precio, subtotal }) => ({
            id, nombre, cantidad, precio, subtotal,
        }));

        // ✅ En lugar de escribir directo a localStorage, se llama al hook
        guardarCompra({
            numeroFactura,
            fechaFactura,
            proveedor,
            total,
            productos: productosParaGuardar,
        });

        alert("Se ha creado la compra exitosamente.");
        navigate("/dashboard/shopping");
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative">

                {/* TITULO */}
                <p className="text-xl font-semibold">
                    <Plus size={20} className="inline mr-2 text-yellow-400" />
                    Nueva Compra
                </p>

                {/* LÍNEA DIVISORA */}
                <div className="h-0.5 bg-linear-to-r from-yellow-400 to-transparent"></div>

                {/* CAMPOS SUPERIORES */}
                <div className="flex flex-wrap gap-6 items-end">

                    {/* PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Truck size={20} />
                            <span>Proveedor *</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={proveedor}
                                onChange={(e) => setProveedor(e.target.value)}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 w-52 cursor-pointer transition-shadow duration-300"
                            >
                                <option>Suministros ABC</option>
                                <option>Distribuidora PDA</option>
                            </select>
                            <button
                                onClick={() => navigate("/dashboard/provider/create")}
                                className="bg-yellow-400 hover:bg-yellow-500 transition duration-300 p-3 rounded-xl shadow-md cursor-pointer"
                            >
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* FECHA FACTURA */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <CalendarDays size={20} />
                            <span>Fecha Factura *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ejemplo: Día/Mes/Año"
                            value={fechaFactura}
                            onChange={(e) => setFechaFactura(e.target.value)}
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 w-52 transition-shadow duration-300"
                        />
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

                        {totalPages > 1 ? (
                            <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={paginaActual === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                                >←</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}

                                        className={`px-3 py-1 rounded-md font-medium transition ${page === paginaActual ? "bg-yellow-400 text-black shadow-sm" : "hover:bg-gray-300"
                                            }`}

                                    >{page}</button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={paginaActual === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                                >→</button>
                            </div>
                        ) : <div />}

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

                {/* ─── MODAL — ahora es un componente separado ─────────────────────────── */}
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