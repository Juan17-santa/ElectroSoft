/**
 * ReturnSalesPage.jsx — "Devolución de venta"
 *
 * Esta página es el centro del flujo de devoluciones. Se accede desde dos lugares:
 *   1. SalesManagement → "devolver venta" → guarda la venta en localStorage + navega aquí
 *   2. Devolutions → "ver detalles" → navega con state: { idVenta, fromDevolutions: true }
 *   3. CreateDevolution (después de guardar) → navega con state: { idVenta }
 *
 * Flujo principal (desde ventas):
 *   - Muestra info de la venta
 *   - Tabla de productos: "Devolver" (→ CreateDevolution) y "Ver detalle" (→ DevolutionProductDetails)
 *   - Tabla "Productos devueltos": listado de devoluciones ya registradas para esta venta
 *   - "Registrar devolución": finaliza el proceso → cambia estado de la venta a Devuelto
 *
 * Modo vista (desde Devoluciones o venta ya devuelta):
 *   - Solo muestra información, sin acciones de registro
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, Pencil, Trash2, Undo2, X} from "lucide-react";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { getEstadoColor } from "../devolutions/helpers/devolutionsHelpers";
import Alert       from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";

const formatCOP = (v) => "$" + Number(v || 0).toLocaleString("es-CO");
const PROD_PER_PAGE = 5;
const DEV_PER_PAGE = 5;

export default function ReturnSalesPage() {
    const navigate  = useNavigate();
    const location  = useLocation();

    const [sale, setSale]                           = useState(null);
    const [devolucionesVenta, setDevolucionesVenta] = useState([]);
    const [alertMsg, setAlertMsg]                   = useState(null);
    const [confirmData, setConfirmData]             = useState(null);
    const [prodPage, setProdPage]                   = useState(1);
    const [devPage, setDevPage]                     = useState(1);

    // Detectar modo: si venimos desde Devolutions o venta ya registrada
    const fromDevolutions = !!location.state?.fromDevolutions;

    // ─── Cargar venta ──────────────────────────────────────────────────────────
    useEffect(() => {
        const idVentaState = location.state?.idVenta;

        if (idVentaState) {
            // Llegamos desde Devolutions, CreateDevolution, o EditDevolution
            const ventas = JSON.parse(localStorage.getItem("sales") || "[]");
            const found  = ventas.find((v) => String(v.id) === String(idVentaState));
            setSale(found ?? null);
        } else {
            // Llegamos desde SalesManagement → localStorage
            const data = localStorage.getItem("saleToReturn");
            if (data) setSale(JSON.parse(data));
        }
    // location.key garantiza recarga en cada navegación a esta página
    }, [location.key]);

    // ─── Recargar devoluciones de la venta ────────────────────────────────────
    const recargarDevoluciones = useCallback(() => {
        if (sale?.id) setDevolucionesVenta(ServicesDevolutions.getByIdVenta(sale.id));
    }, [sale?.id]);

    useEffect(() => { recargarDevoluciones(); }, [recargarDevoluciones]);

    if (!sale) return null;

    const productos      = sale.productos || [];
    const yaDevueltos    = devolucionesVenta.map((d) => d.producto);
    const isYaDevuelto   = sale.estado === "Devuelto";
    const modoVista      = fromDevolutions || isYaDevuelto;

    // ─── Paginación productos de la venta ────────────────────────────────────
    const totalProdPages = Math.max(1, Math.ceil(productos.length / PROD_PER_PAGE));
    const prodActual     = Math.min(prodPage, totalProdPages);
    const paginatedProds = productos.slice((prodActual - 1) * PROD_PER_PAGE, prodActual * PROD_PER_PAGE);

    // ─── Paginación devoluciones registradas ─────────────────────────────────
    const totalDevPages  = Math.max(1, Math.ceil(devolucionesVenta.length / DEV_PER_PAGE));
    const devActual      = Math.min(devPage, totalDevPages);
    const paginatedDevs  = devolucionesVenta.slice((devActual - 1) * DEV_PER_PAGE, devActual * DEV_PER_PAGE);

    const ESTADOS_BLOQUEADOS = ["RESUELTO", "RECHAZADA", "Anulada"];

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleDevolver = (producto) => {
        navigate("/dashboard/devolutions/create", {
            state: { idVenta: sale.id, fromReturn: true },
        });
    };

    const handleVerDetalle = (devolucion) => {
        navigate(`/dashboard/devolutions/product-details/${devolucion.id}`);
    };

    const handleEditar = (devolucion) => {
        navigate(`/dashboard/devolutions/edit/${devolucion.id}`, {
            state: { idVenta: sale.id },
        });
    };

    const handleEliminarDevolucion = (devolucion) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar devolución",
            message: `¿Eliminar la devolución del producto "${devolucion.producto}"? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                ServicesDevolutions.delete(devolucion.id);
                setDevolucionesVenta((prev) => prev.filter((d) => String(d.id) !== String(devolucion.id)));
                setAlertMsg({ type: "success", message: "Devolución eliminada." });
                setConfirmData(null);
            },
        });
    };

    const handleRegistrarDevolucion = () => {
        if (devolucionesVenta.length === 0) {
            setAlertMsg({ type: "error", message: "Debes devolver al menos un producto antes de registrar." });
            return;
        }
        setConfirmData({
            type: "warning",
            title: "Registrar devolución",
            message: "¿Estás seguro de registrar esta devolución? El estado de la venta cambiará a 'Devuelto'.",
            onConfirm: () => {
                SalesService.returnSale(sale.id, esParcial);
                localStorage.removeItem("saleToReturn");
                setAlertMsg({ type: "success", message: "Devolución registrada correctamente." });
                setConfirmData(null);
                setTimeout(() => navigate("/dashboard/sales-management"), 1500);
            },
        });
    };

    const handleCerrar = () => {
        if (fromDevolutions) {
            navigate("/dashboard/devolutions");
        } else {
            localStorage.removeItem("saleToReturn");
            navigate("/dashboard/sales-management");
        }
    };

    // Paginador reutilizable
    const Paginator = ({ currentPage, totalPages: tp, onPageChange }) => {
        if (tp <= 1) return null;
        return (
            <div className="flex justify-end mt-3">
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow">
                    <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-300 transition disabled:opacity-40">←</button>
                    {Array.from({ length: tp }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => onPageChange(p)}
                            className={`px-2.5 py-1 rounded text-sm transition ${currentPage === p ? "bg-yellow-400 font-medium shadow-sm" : "hover:bg-gray-300"}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => onPageChange(Math.min(tp, currentPage + 1))} disabled={currentPage === tp} className="p-1.5 rounded hover:bg-gray-300 transition disabled:opacity-40">→</button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-5 w-full h-full shadow-inner overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Devolución de venta
                        {isYaDevuelto && (
                            <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                                Devuelta
                            </span>
                        )}
                    </h2>
                    <button onClick={handleCerrar} className="p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer" title="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                {/* Información venta */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">Información venta</p>
                    <div className="bg-white rounded-xl border-l-4 border-yellow-400 px-5 py-4 flex flex-wrap items-center gap-8 shadow-sm">
                        <div>
                            <p className="text-xs text-gray-400">ID venta</p>
                            <p className="font-bold text-gray-800">{sale.numeroDocumento ?? sale.id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Fecha creación</p>
                            <p className="font-semibold text-gray-800">{sale.fecha ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Subtotal</p>
                            <p className="font-bold text-gray-800">{formatCOP(sale.subtotal)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">IVA</p>
                            <p className="font-bold text-gray-800">{formatCOP(sale.iva)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="font-bold text-gray-800 text-base">{formatCOP(sale.total)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Estado</p>
                            <p className="font-semibold text-gray-700">{sale.estado ?? "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Productos de la venta */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">Productos de la venta</p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-4 py-2.5 font-semibold">Producto</th>
                                    <th className="px-4 py-2.5 font-semibold">Precio</th>
                                    <th className="px-4 py-2.5 font-semibold">Cantidad</th>
                                    <th className="px-4 py-2.5 font-semibold">Subtotal</th>
                                    <th className="px-4 py-2.5 font-semibold text-center">Estado</th>
                                    {!modoVista && <th className="px-4 py-2.5 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProds.map((prod, i) => {
                                    const devuelto = yaDevueltos.includes(prod.nombre);
                                    return (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2.5">{prod.nombre}</td>
                                            <td className="px-4 py-2.5">{formatCOP(prod.precio)}</td>
                                            <td className="px-4 py-2.5">{prod.cantidad}</td>
                                            <td className="px-4 py-2.5">{formatCOP(prod.precio * prod.cantidad)}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                {devuelto ? (
                                                    <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                                                        Devuelto
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-green-100 text-green-600 font-medium px-2 py-0.5 rounded-full">
                                                        Disponible
                                                    </span>
                                                )}
                                            </td>
                                            {!modoVista && (
                                                <td className="px-4 py-2.5 text-center">
                                                    {!devuelto ? (
                                                        <button
                                                            onClick={() => handleDevolver(prod)}
                                                            title="Devolver este producto"
                                                            className="text-yellow-600 hover:text-yellow-800 transition cursor-pointer"
                                                        >
                                                            <Undo2 size={16} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300 cursor-not-allowed">
                                                            <Undo2 size={16} />
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Paginator currentPage={prodActual} totalPages={totalProdPages} onPageChange={setProdPage} />
                </div>

                {/* Productos devueltos */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">
                        Productos devueltos
                        <span className="ml-2 text-xs font-normal text-gray-400">({devolucionesVenta.length})</span>
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-3 py-2.5 font-semibold">Producto</th>
                                    <th className="px-3 py-2.5 font-semibold">Motivo</th>
                                    <th className="px-3 py-2.5 font-semibold">Condición</th>
                                    <th className="px-3 py-2.5 font-semibold">Gestión</th>
                                    <th className="px-3 py-2.5 font-semibold">Estado resolución</th>
                                    <th className="px-3 py-2.5 font-semibold text-center w-28">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDevs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">
                                            {modoVista
                                                ? "No hay productos devueltos para esta venta."
                                                : "Usa el botón ↩ para agregar productos a devolver."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDevs.map((dev) => {
                                        const bloqueado = ESTADOS_BLOQUEADOS.includes(dev.estadoResolucion);
                                        return (
                                            <tr key={dev.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-2.5 text-xs font-medium">{dev.producto}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.motivo?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.condicionProducto?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.gestion?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(dev.estadoResolucion)}`}>
                                                        {dev.estadoResolucion || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <div className="flex justify-center gap-1.5">
                                                        {/* Ver detalle */}
                                                        <button
                                                            title="Ver detalle"
                                                            onClick={() => handleVerDetalle(dev)}
                                                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        >
                                                            <Eye size={14} className="text-blue-600" />
                                                        </button>

                                                        {/* Editar — desactivado si bloqueado */}
                                                        {!modoVista && (
                                                            <button
                                                                title={bloqueado ? "No se puede editar" : "Editar"}
                                                                onClick={() => !bloqueado && handleEditar(dev)}
                                                                disabled={bloqueado}
                                                                className={`p-1.5 rounded-lg transition ${
                                                                    bloqueado
                                                                        ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                        : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                                                                }`}
                                                            >
                                                                <Pencil size={14} className="text-yellow-600" />
                                                            </button>
                                                        )}

                                                        {/* Eliminar — solo en modo edición */}
                                                        {!modoVista && (
                                                            <button
                                                                title="Eliminar devolución"
                                                                onClick={() => handleEliminarDevolucion(dev)}
                                                                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                            >
                                                                <Trash2 size={14} className="text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Paginator currentPage={devActual} totalPages={totalDevPages} onPageChange={setDevPage} />
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-auto">
                    <button
                        onClick={handleCerrar}
                        className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-sm font-medium shadow cursor-pointer transition"
                    >
                        {fromDevolutions ? "Volver a devoluciones" : "Cancelar"}
                    </button>

                    {/* Botón Registrar — solo visible si NO es modo vista y la venta no está ya devuelta */}
                    {!modoVista && (
                        <button
                            onClick={handleRegistrarDevolucion}
                            className="px-6 py-2.5 bg-linear-to-r from-white to-yellow-300 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer font-medium text-sm"
                        >
                            Registrar devolución
                        </button>
                    )}
                </div>

            </div>

            {alertMsg && (
                <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />
            )}
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
