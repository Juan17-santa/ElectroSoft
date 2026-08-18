import { Eye, Undo2, Ban, Wallet } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import CancellationModal from "./components/CancellationModal";
import CancellationInfoTooltip from "../../components/ui/CancellationInfoTooltip";
import { ServicesProducts } from "../products/services/ServicesProducts";
import { useSalesReport } from "./hooks/useSalesReport";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Restricted } from "../../components/ui/Restricted";
import { useToast } from "../../../../context/ToastContext";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

const ITEMS_PER_PAGE = 6;
const ESTADOS_DEVOLUCION_VENTA = ["Devuelto", "Devolución Parcial", "Devolucion Parcial", "DevoluciÃ³n Parcial"];

function esVentaConDevolucion(estado) {
    return ESTADOS_DEVOLUCION_VENTA.includes(estado);
}

function getProductoId(value) {
    return String(value?._id ?? value?.productoId ?? value?.id ?? value ?? "");
}

function hayProductosRetornables(sale, devolucionesContables) {
    const devueltoPorProducto = new Map();

    devolucionesContables.forEach((devolucion) => {
        const producto = devolucion.productoId ?? devolucion.productos?.[0]?.productoId;
        const productoId = getProductoId(producto);
        if (!productoId) return;

        const cantidad = devolucion.cantidad ?? devolucion.productos?.[0]?.cantidad ?? 0;
        devueltoPorProducto.set(
            productoId,
            (devueltoPorProducto.get(productoId) ?? 0) + Number(cantidad),
        );
    });

    return (sale.productos || []).some((producto) => {
        const productoId = getProductoId(producto.productoId ?? producto.id);
        const cantidadDisponible = Number(producto.cantidad ?? 0) - (devueltoPorProducto.get(productoId) ?? 0);
        return cantidadDisponible > 0;
    });
}

/**
 * Determina el estado del botón de devolución para una venta basándose en
 * el estado REAL de sus devoluciones (no en sale.estado).
 *
 *   - "anulada"        → la venta está anulada (botón deshabilitado)
 *   - "sin-devolucion" → no hay devoluciones activas (botón amarillo "Devolver venta")
 *   - "en-proceso"     → hay devoluciones activas pero alguna no está finalizada
 *                        (botón gris "Gestionar devolución")
 *   - "finalizada"     → no quedan cantidades retornables y todo está RESUELTO
 *                        (botón azul "Ver devolución")
 *
 * Devoluciones con estadoResolucion === "Anulada" o "RECHAZADA" se ignoran:
 * ambas se tratan como si no existieran para la disponibilidad de la venta.
 */
function getEstadoDevolucionVenta(sale, devoluciones) {
    if (sale.estado === "Anulado" || sale.estado === "ANULADA") return "anulada";

    if (devoluciones === undefined) {
        if (sale.estado === "Devuelto") return "finalizada";
        return esVentaConDevolucion(sale.estado) ? "en-proceso" : "sin-devolucion";
    }

    const contables = devoluciones.filter(
        (d) => d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA",
    );
    const algunaEnProceso = contables.some((d) => d.estadoResolucion !== "RESUELTO");
    if (algunaEnProceso) return "en-proceso";

    if (!hayProductosRetornables(sale, contables)) return "finalizada";
    return "sin-devolucion";
}

function validarAnulacion(sale) {
    if (["ANULADA", "Anulado"].includes(sale.estado) || esVentaConDevolucion(sale.estado)) {
        return { puedeAnularse: false, razon: "La venta ya no puede ser anulada por su estado." };
    }

    const now = new Date();

    // Validar fecha de creación (48 horas límite)
    if (sale.fechaCreacion) {
        const createdAt = new Date(sale.fechaCreacion);
        if (!Number.isNaN(createdAt.getTime())) {
            const elapsed = (now - createdAt) / (1000 * 60 * 60);
            if (elapsed >= 48) {
                return { puedeAnularse: false, razon: "La venta ha superado el plazo de 48 horas desde su registro y no se puede anular." };
            }
        }
    }

    // Validar fecha de venta/factura (48 horas límite desde el final del día)
    if (sale.fecha && /^\d{4}-\d{2}-\d{2}$/.test(sale.fecha)) {
        const [year, month, day] = sale.fecha.split("-").map(Number);
        const fechaVentaEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        if (!Number.isNaN(fechaVentaEndOfDay.getTime())) {
            const elapsed = (now - fechaVentaEndOfDay) / (1000 * 60 * 60);
            if (elapsed >= 48) {
                return { puedeAnularse: false, razon: "La venta ha superado el plazo de 48 horas desde la fecha facturada y no se puede anular." };
            }
        }
    } else if (sale.fecha && sale.fecha.includes("/")) {
        // En caso de que el formato sea DD/MM/YYYY
        const parts = sale.fecha.split("/");
        if (parts.length === 3) {
            const [day, month, year] = parts.map(Number);
            const fechaVentaEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
            if (!Number.isNaN(fechaVentaEndOfDay.getTime())) {
                const elapsed = (now - fechaVentaEndOfDay) / (1000 * 60 * 60);
                if (elapsed >= 48) {
                    return { puedeAnularse: false, razon: "La venta ha superado el plazo de 48 horas desde la fecha facturada y no se puede anular." };
                }
            }
        }
    }

    return { puedeAnularse: true };
}

// ─── Botón anular con tooltip informativo cuando no se puede anular ───────────
function BanButton({ validacion, onClick }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const handleMouseEnter = () => {
        if (!validacion.puedeAnularse && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top - 20,
                left: rect.left - 270,
            });
            setShowTooltip(true);
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                ref={buttonRef}
                onClick={validacion.puedeAnularse ? onClick : undefined}
                className={`p-2 rounded-lg transition duration-300 ${validacion.puedeAnularse
                    ? "bg-red-100 hover:bg-red-200 cursor-pointer"
                    : "bg-red-100 opacity-40 cursor-not-allowed"
                    }`}
                title={validacion.puedeAnularse ? "Anular venta" : ""}
            >
                <Ban size={18} className="text-red-500" />
            </button>

            {showTooltip && !validacion.puedeAnularse && (
                <div
                    className="fixed z-50 bg-gray-50 text-gray-400 rounded-xl shadow-2xl p-4 w-64 border border-gray-400"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                >
                    <div className="space-y-3 text-left">
                        <div>
                            <p className="text-xs tracking-wide text-gray-500 font-semibold">
                                Anulación no disponible
                            </p>
                        </div>
                        <div className="border-t-2 border-yellow-300 pt-3">
                            <p className="text-xs tracking-wide text-gray-500 font-semibold">
                                Motivo
                            </p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed wrap-break-word">
                                {validacion.razon}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
const formatFechaConSlash = (fechaStr) => {
    if (!fechaStr) return "";
    if (fechaStr.includes("/")) return fechaStr;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        const [year, month, day] = fechaStr.split("-");
        return `${day}/${month}/${year}`;
    }
    return fechaStr.replaceAll("-", "/");
};

export default function SalesManagement() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [cancelModalSale, setCancelModalSale] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    // Devoluciones por venta para determinar el estado real del botón de devolución.
    const [devolucionesPorVenta, setDevolucionesPorVenta] = useState({});

    const { exportReport } = useSalesReport(sales, showToast);

    const showAlert = (type, message) => showToast(type, message);

    const filteredSales = sales.filter(sale => {
        const fechaSlash = formatFechaConSlash(sale.fecha);
        return (sale.numeroDocumento?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (sale.numeroVenta?.toString() || '').includes(search) ||
            (sale.cliente?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (sale.fecha?.includes(search)) ||
            (fechaSlash?.includes(search)) ||
            (sale.tipoVenta?.toLowerCase().includes(search.toLowerCase())) ||
            (sale.total?.toString().includes(search)) ||
            (sale.montoPagado?.toString().includes(search)) ||
            (sale.montoPorPagar?.toString().includes(search)) ||
            (sale.estado?.toLowerCase().includes(search.toLowerCase()));
    });

    const totalPages = Math.max(1, Math.ceil(filteredSales.length / ITEMS_PER_PAGE));
    const pageActual = Math.min(currentPage, totalPages);
    const paginatedSales = filteredSales.slice(
        (pageActual - 1) * ITEMS_PER_PAGE,
        pageActual * ITEMS_PER_PAGE
    );

    const getSales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await SalesService.get();
            const sortedSales = response.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setSales(sortedSales);
        } catch (err) {
            const message = "No se pudieron cargar las ventas." || err.message;
            showToast("error", message);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { getSales(); }, [getSales]);

    //   Refresca la tabla automáticamente cuando se registra un abono desde el módulo de Pagos
    useEffect(() => {
        window.addEventListener("payments-updated", getSales);
        return () => window.removeEventListener("payments-updated", getSales);
    }, [getSales]);

    // Fetch de devoluciones para las ventas visibles de la página actual.
    // Esto permite que el botón de devolución refleje el estado REAL de las
    // devoluciones (no solo sale.estado). Se ejecuta al cambiar página, búsqueda
    // o recargar ventas.
    const visibleSaleIds = paginatedSales.map((s) => s.id).join(",");

    const devolucionesUrls = paginatedSales;

    useEffect(() => {
        if (!visibleSaleIds) return undefined;
        let cancelled = false;

        Promise.all(
            devolucionesUrls.map((sale) =>
                ServicesDevolutions.getBySaleId(sale.id)
                    .then((devs) => ({ saleId: sale.id, devs: devs || [] }))
                    .catch(() => ({ saleId: sale.id, devs: [] })),
            ),
        ).then((results) => {
            if (cancelled) return;
            const map = {};
            results.forEach(({ saleId, devs }) => {
                map[saleId] = devs;
            });
            setDevolucionesPorVenta(map);
        });

        return () => {
            cancelled = true;
        };
    }, [visibleSaleIds, devolucionesUrls]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleViewDetails = (sale) => {
        localStorage.setItem("saleToView", JSON.stringify(sale));
        navigate("/dashboard/sales-management/details");
    };

    const handleViewCredit = (sale) => {
        localStorage.setItem("saleToView", JSON.stringify(sale));
        navigate("/dashboard/sales-management/credit-details");
    };

    const handleReturn = (sale, mode) => {
        localStorage.setItem("saleToReturn", JSON.stringify(sale));
        navigate("/dashboard/sales-management/return", {
            state: { idVenta: sale.id, mode, origin: "sales" },
        });
    };

    const handleAnull = (sale) => {
        setCancelModalSale(sale);
    };

    const confirmAnull = async (motivo) => {
        try {
            await SalesService.anullSale(cancelModalSale.id, motivo);
            // Stock is returned by the backend (impactApplied)
            await getSales();
            showAlert("success", "Venta anulada correctamente.");
        } catch (error) {
            console.error("Error anulling sale:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al anular la venta.";
            showAlert("error", errorMsg);
        }
        setCancelModalSale(null);
    };

    const handleGenerarReporte = () => {
        setShowReportModal(true);
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case "Finalizado": case "Finalizadas": return "bg-green-100 text-green-700";
            case "Vigente": return "bg-yellow-100 text-yellow-700";
            case "Anulado": case "ANULADA": return "bg-red-100 text-red-700";
            case "Devuelto": return "bg-gray-100 text-gray-700";
            case "Devolución Parcial": return "bg-amber-100 text-amber-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de Ventas</p>

                {/* BUSCADOR */}
                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar ventas..."
                    onCreateClick={() => navigate("/dashboard/sales-management/create")}
                    createButtonText="Nueva Venta"
                    showCreateButton={hasPermission("Ventas", "Crear")}
                    showReportButton={hasPermission("Ventas", "Reporte")}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-white rounded-2xl border-none overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-3 font-semibold">#</th>
                                    <th className="px-3 py-3 font-semibold">Documento</th>
                                    <th className="px-3 py-3 font-semibold">Cliente</th>
                                    <th className="px-3 py-3 font-semibold">Fecha</th>
                                    <th className="px-3 py-3 font-semibold">Tipo de venta</th>
                                    <th className="px-3 py-3 font-semibold">Total</th>
                                    <th className="px-3 py-3 font-semibold">Monto Pagado</th>
                                    <th className="px-3 py-3 font-semibold">Monto Por Pagar</th>
                                    <th className="px-3 py-3 font-semibold text-center">Estado</th>
                                    <th className="px-3 py-3 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-4 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                Cargando ventas...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-4 text-center text-gray-400">
                                            No hay ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSales.map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-3 py-3 font-medium">{String(sale.numeroVenta || "").padStart(2, '0') || '-'}</td>
                                            <td className="px-3 py-3">{sale.numeroDocumento || "-"}</td>
                                            <td className="px-3 py-3">{sale.cliente || "-"}</td>
                                            <td className="px-3 py-3">{formatFechaConSlash(sale.fecha)}</td>
                                            <td className="px-3 py-3">{sale.tipoVenta}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.total)}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.montoPagado)}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.montoPorPagar)}</td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium whitespace-normal wrap-break-words leading-tight max-w-27.5 ${(sale.estado === "Finalizado" || sale.estado === "Finalizadas") ? "bg-green-100 text-green-700" :
                                                    sale.estado === "Vigente" ? "bg-yellow-100 text-yellow-600" :
                                                        (sale.estado === "Devuelto" || sale.estado === "Devolución Parcial") ? "bg-amber-100 text-amber-600" :
                                                            "bg-red-100 text-red-600"
                                                    }`}>
                                                    {sale.estado}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-center flex-nowrap gap-1.5 h-9">
                                                    {/* DEVOLVER */}
                                                    <Restricted scope="Ventas" action="Devolver">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            {(() => {
                                                                const estadoDev = getEstadoDevolucionVenta(sale, devolucionesPorVenta[sale.id]);

                                                                if (estadoDev === "anulada") {
                                                                    return (
                                                                        <button
                                                                            disabled
                                                                            title="Venta anulada"
                                                                            className="p-2 rounded-lg bg-gray-100 opacity-50 cursor-not-allowed"
                                                                        >
                                                                            <Undo2 size={18} className="text-gray-400" />
                                                                        </button>
                                                                    );
                                                                }

                                                                if (estadoDev === "finalizada") {
                                                                    return (
                                                                        <button
                                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                                            onClick={() => handleReturn(sale, "view-only")}
                                                                            title="Ver devolución"
                                                                        >
                                                                            <Undo2 size={18} className="text-blue-600" />
                                                                        </button>
                                                                    );
                                                                }

                                                                if (estadoDev === "en-proceso") {
                                                                    return (
                                                                        <button
                                                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 cursor-pointer"
                                                                            onClick={() => handleReturn(sale, "editable")}
                                                                            title="Gestionar devolución"
                                                                        >
                                                                            <Undo2 size={18} className="text-gray-600" />
                                                                        </button>
                                                                    );
                                                                }

                                                                // sin-devolucion
                                                                return (
                                                                    <button
                                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition duration-300 cursor-pointer"
                                                                        onClick={() => handleReturn(sale, "from-sales")}
                                                                        title="Devolver venta"
                                                                    >
                                                                        <Undo2 size={18} className="text-yellow-600" />
                                                                    </button>
                                                                );
                                                            })()}
                                                        </div>
                                                    </Restricted>

                                                    {/* VER DETALLES */}
                                                    <div className="flex-none flex items-center justify-center w-9 h-9">
                                                        <Restricted scope="Ventas" action="Ver">
                                                            <button
                                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                                onClick={() => handleViewDetails(sale)}
                                                                title="Ver detalles"
                                                            >
                                                                <Eye size={18} className="text-blue-600" />
                                                            </button>
                                                        </Restricted>
                                                    </div>

                                                    {/* ANULAR */}
                                                    <Restricted scope="Ventas" action="anular">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            {sale.estado === "Anulado" || sale.estado === "ANULADA" ? (
                                                                <CancellationInfoTooltip cancelInfo={{
                                                                    fechaAnulacion: sale.anuladaEn || sale.fecha,
                                                                    motivo: sale.observaciones || "Anulación registrada sin motivo."
                                                                }} />
                                                            ) : (
                                                                <BanButton
                                                                    validacion={validarAnulacion(sale)}
                                                                    onClick={() => handleAnull(sale)}
                                                                />
                                                            )}
                                                        </div>
                                                    </Restricted>

                                                    {/* CREDITO */}
                                                    <div className="flex-none flex items-center justify-center w-9 h-9">
                                                        {(() => {
                                                            const isCreditDisabled = !(sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito" || sale.tipoVenta === "Mixto") || sale.estado === "Anulado" || sale.estado === "Devuelto";
                                                            return (
                                                                <Restricted scope="Ventas" action="Abonar">
                                                                    <button
                                                                        className={`p-2 rounded-lg transition duration-300 ${isCreditDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"}`}
                                                                        onClick={() => handleViewCredit(sale)}
                                                                        title={isCreditDisabled ? "Crédito no disponible" : "Detalles del crédito"}
                                                                        disabled={isCreditDisabled}
                                                                    >
                                                                        <Wallet size={18} className={isCreditDisabled ? "text-gray-400" : "text-yellow-600"} />
                                                                    </button>
                                                                </Restricted>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                {paginatedSales.length > 0 && (
                    <div className="flex justify-end mt-auto pt-4">
                        <Pagination
                            currentPage={pageActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* MODAL DE CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {/* MODAL DE REPORTE CON FILTRO DE FECHAS */}
            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte de ventas"
                    message="Selecciona el rango de fechas para exportar el reporte"
                    showDateFilter={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ fechaInicio, fechaFin }) => {
                        exportReport(fechaInicio, fechaFin);
                        setShowReportModal(false);
                    }}
                />
            )}

            {/* MODAL DE CONFIRMACION ANULACION */}
            {cancelModalSale && (
                <CancellationModal
                    saleId={cancelModalSale.numeroVenta || cancelModalSale.id}
                    onConfirm={confirmAnull}
                    onCancel={() => setCancelModalSale(null)}
                />
            )}
        </>
    );
}
