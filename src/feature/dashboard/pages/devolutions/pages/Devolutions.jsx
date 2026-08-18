import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Ban, RotateCcw, Check, X } from "lucide-react";
import { useDevolutions, ITEMS_PER_PAGE } from "../hooks/useDevolutions";
import { useDevolutionsReport } from "../hooks/useDevolutionsReport";
import { SalesService } from "../../SalesManagement/services/SalesService";
import { getEstadoColor } from "../helpers/devolutionsHelpers";
import SearchBar from "../../../components/ui/Searchbar";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { Restricted } from "../../../components/ui/Restricted";
import { useToast } from "../../../../../context/ToastContext";
import { usePermissions } from "../../../../../hooks/usePermissions";

const ESTADOS_BLOQUEADOS = ["RESUELTO", "RECHAZADA", "Anulada"];

function getProductoId(value) {
    return String(value?._id ?? value?.productoId ?? value?.id ?? value ?? "");
}

function hayProductosRetornables(sale, devolucionesContables) {
    const devueltoPorProducto = new Map();

    devolucionesContables.forEach((devolucion) => {
        const productoId = getProductoId(devolucion.productoId);
        if (!productoId) return;
        devueltoPorProducto.set(
            productoId,
            (devueltoPorProducto.get(productoId) ?? 0) + Number(devolucion.cantidad ?? 0),
        );
    });

    return (sale?.productos || []).some((producto) => {
        const productoId = getProductoId(producto.productoId ?? producto.id);
        const cantidadDisponible = Number(producto.cantidad ?? 0) - (devueltoPorProducto.get(productoId) ?? 0);
        return cantidadDisponible > 0;
    });
}

function formatFechaDisplay(fechaISO) {
    if (!fechaISO) return "—";
    const match = fechaISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return fechaISO;
    const [_, y, m, d] = match;
    return `${d}/${m}/${y}`;
}

function formatFechaEstadoDisplay(fechaISO) {
    if (!fechaISO) return "—";
    const match = fechaISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return fechaISO;
    const [_, y, m, d] = match;
    return `${d}-${m}-${y}`;
}

export default function Devolutions() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [confirmData, setConfirmData] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [ventasMap, setVentasMap] = useState(null);
    const { hasPermission } = usePermissions();
    
    const {
        groups,
        searchTerm,
        setSearchTerm,
        page,
        totalPages,
        handlePageChange,
        anularPorVenta,
        loading,
        error,
    } = useDevolutions();

    useEffect(() => {
        SalesService.get().then((ventas) => {
            const map = {};
            ventas.forEach((v) => { map[v.id] = v; });
            setVentasMap(map);
        }).catch(() => { });
    }, []);

    const { exportReport } = useDevolutionsReport(showToast);

    useEffect(() => {
        if (error) showToast("error", error);
    }, [error, showToast]);

    // ─── Helpers de grupo ────────────────────────────────────────────────────

    const getFechaInicio = (g) =>
        g.reduce((min, d) => {
            const f = d.fechaDevolucion ?? "";
            return (!min || f < min) ? f : min;
        }, null) ?? "—";

    const getFechaEstado = (g) =>
        g.reduce((max, d) => {
            const f = d.fechaEstado ?? "";
            return (!max || f > max) ? f : max;
        }, null) ?? "—";

    /**
     * Devuelve la devolución más recientemente EDITADA del grupo.
     * Usa actualizadoEn (ISO timestamp completo) para precisión exacta al segundo,
     * evitando el empate que ocurre cuando varias devoluciones comparten la misma
     * fechaEstado (solo fecha, sin hora). Fallback a creadoEn si falta actualizadoEn.
     */
    const getMasReciente = (g) =>
        [...g].sort((a, b) => {
            const ta = a.actualizadoEn ?? a.creadoEn ?? "";
            const tb = b.actualizadoEn ?? b.creadoEn ?? "";
            return tb.localeCompare(ta);
        })[0];

    const editBloqueado = (g) => {
        if (g.every((d) => d.estadoResolucion === "Anulada")) return true;
        const todasFinales = g.every((d) => ESTADOS_BLOQUEADOS.includes(d.estadoResolucion));
        if (!todasFinales) return false;
        const contables = g.filter(
            (d) => d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA",
        );
        const sale = ventasMap?.[g[0].idVenta];
        return !hayProductosRetornables(sale, contables);
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleSearch = (e) => { setSearchTerm(e.target.value); };

    const handleAnularGrupo = (grupo) => {
        const idVenta = grupo[0].idVenta;
        const numeroVenta = ventasMap && ventasMap[idVenta] != null
            ? String(ventasMap[idVenta].numeroVenta).padStart(2, "0")
            : idVenta;
        setConfirmData({
            type: "warning",
            title: "Anular devolución",
            message: `¿Anular la devolución de la venta #${numeroVenta}? Se anularán todos los productos devueltos.`,
            onConfirm: async () => {
                try {
                    await anularPorVenta(idVenta);
                showToast("success", "Devolución anulada correctamente.");
                setConfirmData(null);
                } catch (err) {
                    showToast("error", err.message);
                    setConfirmData(null);
                }
            },
        });
    };

    const handleGenerarReporte = () => setShowReportModal(true);

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                <p className="text-xl font-semibold flex items-center gap-2">
                    Control de devoluciones
                </p>

                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar devoluciones..."
                    showCreateButton={false}
                    showReportButton={hasPermission("Devoluciones", "Reporte")}
                    onReportClick={handleGenerarReporte}
                />

                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl overflow-auto">
                        <table className="min-w-250 w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-2 py-2 font-semibold">#</th>
                                    <th className="px-2 py-2 font-semibold">ID Venta</th>
                                    <th className="px-2 py-2 font-semibold">Productos devueltos</th>
                                    <th className="px-2 py-2 font-semibold">Fecha inicio / última actualización</th>
                                    <th className="px-2 py-2 font-semibold">Estado resolución</th>
                                    <th className="px-2 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                 {loading ? (
                                     <tr>
                                         <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                                             <div className="flex items-center justify-center gap-2">
                                                 <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                 Cargando devoluciones...
                                             </div>
                                         </td>
                                     </tr>
                                ) : groups.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                                            No hay devoluciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    groups.map((grupo, index) => {
                                        const idVenta = grupo[0].idVenta;
                                        const reciente = getMasReciente(grupo);
                                        const estado = reciente?.estadoResolucion ?? "—";
                                        const producto = reciente?.producto ?? "—";
                                        const colorEstado = getEstadoColor(estado);
                                        const textColor = colorEstado.split(" ").find((c) => c.startsWith("text-")) ?? "text-gray-500";
                                        const fechaInicio = formatFechaDisplay(getFechaInicio(grupo));
                                        const fechaEstado = formatFechaEstadoDisplay(getFechaEstado(grupo));
                                        const bloqueado = editBloqueado(grupo);
                                        const anulado = grupo.every((d) => d.estadoResolucion === "Anulada");

                                        const cantidadContable = grupo
                                            .filter((d) => d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA")
                                            .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
                                        const cantidadRechazada = grupo
                                            .filter((d) => d.estadoResolucion === "RECHAZADA")
                                            .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
                                        const cantidadAnulada = grupo
                                            .filter((d) => d.estadoResolucion === "Anulada")
                                            .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
                                        const cantidadDevuelta = cantidadContable + cantidadRechazada;

                                        // Si alguna devolución quedó en estado final, la tanda no se puede anular (R2)
                                        const tandaConFinal = grupo.some((d) =>
                                            ["RESUELTO", "RECHAZADA"].includes(d.estadoResolucion),
                                        );

                                        return (
                                            <tr key={idVenta} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-2 font-medium">
                                                    {String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                                </td>
                                                <td className="px-2 py-2 ">{ventasMap ? (ventasMap[idVenta] ? String(ventasMap[idVenta].numeroVenta).padStart(2, "0") : "—") : "—"}</td>
                                                <td className="px-2 py-2">
                                                    <span className="px-2 py-0.5 rounded-full">
                                                        {cantidadDevuelta} producto{cantidadDevuelta !== 1 ? "s" : ""}
                                                        {cantidadRechazada > 0 && (
                                                            <span className="ml-1 text-red-500">({cantidadRechazada} rechazado{cantidadRechazada !== 1 ? "s" : ""})</span>
                                                        )}
                                                        {cantidadAnulada > 0 && cantidadContable === 0 && cantidadRechazada === 0 && (
                                                            <span className="ml-1 text-gray-500">({cantidadAnulada} anulado{cantidadAnulada !== 1 ? "s" : ""})</span>
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Fecha inicio / última actualización en la misma línea */}
                                                <td className="px-2 py-2">
                                                    <div className="flex items-center gap-1.5 text-s">
                                                        <span className="text-gray-500">{fechaInicio}</span>
                                                        <span className="text-gray-300">/</span>
                                                        <span className={`font-semibold ${textColor}`}>{fechaEstado}</span>
                                                    </div>
                                                </td>

                                                {/* Estado + nombre del producto más recientemente actualizado */}
                                                 <td className="px-1 py-2 max-w-55">
                                                     <div className="max-w-39.5 min-w-0">
                                                         <span className={`inline-block max-w-full px-2 py-0.5 rounded-full text-xs font-medium whitespace-normal wrap-break-word ${colorEstado}`}>
                                                             {estado.replace(/_/g, " ")}
                                                         </span>
                                                         <p className="text-xs text-gray-400 mt-0.5 truncate max-w-35" title={producto}>
                                                             {producto}
                                                         </p>
                                                     </div>
                                                 </td>

                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-2">

                                                        {/* VER */}
                                                        <Restricted scope="Devoluciones" action="Ver">
                                                            <button
                                                                title="Ver detalle"
                                                                onClick={() => navigate("/dashboard/sales-management/return", {
                                                                    state: { idVenta, mode: "view-only" },
                                                                })}
                                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                            >
                                                                <Eye size={18} className="text-blue-600" />
                                                            </button>
                                                        </Restricted>

                                                        {/* EDITAR / COMPLETADO / ANULADO */}
                                                        <div className="relative group flex items-center">

                                                            <Restricted scope="Devoluciones" action="Editar">
                                                                <button
                                                                    onClick={() =>
                                                                        !bloqueado &&
                                                                        navigate("/dashboard/sales-management/return", {
                                                                            state: { idVenta, mode: "editable" },
                                                                        })
                                                                    }
                                                                    disabled={bloqueado}
                                                                    className={`p-2 rounded-lg transition ${anulado
                                                                        ? "bg-red-100 cursor-default"
                                                                        : bloqueado
                                                                            ? "bg-green-100 cursor-default"
                                                                            : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                                                                        }`}
                                                                >
                                                                    {anulado ? (
                                                                        <X size={18} className="text-red-500" />
                                                                    ) : bloqueado ? (
                                                                        <Check size={18} className="text-green-600" />
                                                                    ) : (
                                                                        <Pencil size={18} className="text-yellow-600" />
                                                                    )}
                                                                </button>
                                                            </Restricted>

                                                            {bloqueado && (
                                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                        opacity-0 group-hover:opacity-100 pointer-events-none
                                                                        transition-all duration-200 transform group-hover:-translate-y-1
                                                                        bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                                                    {anulado ? "✕ Devolución Anulada" : "✔ Devolución completada"}
                                                                </div>
                                                            )}

                                                        </div>

                                                        {/* ANULAR */}
                                                        <Restricted scope="Devoluciones" action="anular">
                                                            <button
                                                                title={tandaConFinal ? "No se puede anular: hay devoluciones en estado final" : "Anular"}
                                                                onClick={() => handleAnularGrupo(grupo)}
                                                                disabled={anulado || tandaConFinal}
                                                                className={`p-2 rounded-lg transition duration-300 ${(anulado || tandaConFinal)
                                                                        ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                        : "bg-red-100 hover:bg-red-200 cursor-pointer"
                                                                    }`}
                                                            >
                                                                <Ban size={18} className="text-red-600" />
                                                            </button>
                                                        </Restricted>

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {groups.length > 0 && (
                    <div className="flex justify-end mt-auto">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

            </div>

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte de devoluciones"
                    message="Selecciona el rango de fechas para exportar el reporte"
                    showDateFilter={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ fechaInicio, fechaFin }) => {
                        exportReport(fechaInicio, fechaFin);
                        setShowReportModal(false);
                    }}
                />
            )}
        </>
    );
}
