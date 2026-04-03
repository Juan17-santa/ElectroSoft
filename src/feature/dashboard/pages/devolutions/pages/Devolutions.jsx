import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, Pencil, Ban, RotateCcw, Check, X } from "lucide-react";
import { useDevolutions } from "../hooks/useDevolutions";
import { useDevolutionsReport } from "../hooks/useDevolutionsReport";
import { getEstadoColor } from "../helpers/devolutionsHelpers";
import SearchBar    from "../../../components/ui/Searchbar";
import Pagination   from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert        from "../../../components/ui/Alert";

const ITEMS_PER_PAGE = 8;
const ESTADOS_BLOQUEADOS = ["RESUELTO", "RECHAZADA", "Anulada"];

function formatFechaDisplay(fechaISO) {
    if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return fechaISO || "—";
    const [y, m, d] = fechaISO.split("-");
    return `${d}/${m}/${y}`;
}

export default function Devolutions() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        anularPorVenta,
        recargar,
    } = useDevolutions();

    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert]             = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const { exportReport } = useDevolutionsReport(devolucionesFiltradas, setAlert);

    // Recargar desde localStorage cada vez que se navega a esta página.
    // location.key cambia en cada navegación, incluso si la URL es la misma.
    useEffect(() => {
        recargar();
    }, [location.key]);

    // Agrupar por idVenta — una fila por venta
    const gruposPorVenta = useMemo(() => {
        const map = {};
        devolucionesFiltradas.forEach((d) => {
            const key = String(d.idVenta);
            if (!map[key]) map[key] = [];
            map[key].push(d);
        });
        return Object.values(map).sort((a, b) =>
            (b[0]?.creadoEn ?? "").localeCompare(a[0]?.creadoEn ?? "")
        );
    }, [devolucionesFiltradas]);

    const totalPages   = Math.max(1, Math.ceil(gruposPorVenta.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const itemsPagina  = gruposPorVenta.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

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

    const editBloqueado = (g) =>
        g.every((d) => ESTADOS_BLOQUEADOS.includes(d.estadoResolucion));

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

    const handleAnularGrupo = (grupo) => {
        const idVenta = grupo[0].idVenta;
        setConfirmData({
            type: "warning",
            title: "Anular devolución",
            message: `¿Anular la devolución de la venta #${idVenta}? Se anularán todos los productos devueltos.`,
            onConfirm: () => {
                anularPorVenta(idVenta);
                setAlert({ type: "success", message: "Devolución anulada correctamente." });
                setConfirmData(null);
            },
        });
    };

    const handleGenerarReporte = () => setShowReportModal(true);

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                <p className="text-xl font-semibold flex items-center gap-2">
                    <RotateCcw size={22} className="text-yellow-500" />
                    Gestión De Devoluciones
                </p>

                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar por ID venta, motivo, responsable..."
                    showCreateButton={false}
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold">#</th>
                                    <th className="px-3 py-2 font-semibold">ID Venta</th>
                                    <th className="px-3 py-2 font-semibold">Productos devueltos</th>
                                    <th className="px-3 py-2 font-semibold">Fecha inicio / última actualización</th>
                                    <th className="px-3 py-2 font-semibold">Estado resolución</th>
                                    <th className="px-3 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {itemsPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                            No hay devoluciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    itemsPagina.map((grupo, index) => {
                                        const idVenta    = grupo[0].idVenta;
                                        const reciente   = getMasReciente(grupo);
                                        const estado     = reciente?.estadoResolucion ?? "—";
                                        const producto   = reciente?.producto         ?? "—";
                                        const colorEstado = getEstadoColor(estado);
                                        const textColor   = colorEstado.split(" ").find((c) => c.startsWith("text-")) ?? "text-gray-500";
                                        const fechaInicio = formatFechaDisplay(getFechaInicio(grupo));
                                        const fechaEstado = getFechaEstado(grupo);
                                        const bloqueado   = editBloqueado(grupo);
                                        const anulado     = grupo.every((d) => d.estadoResolucion === "Anulada");

                                        return (
                                            <tr key={idVenta} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-2 font-medium">
                                                    {String((paginaActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                                </td>
                                                <td className="px-4 py-2 font-medium">{idVenta || "—"}</td>
                                                <td className="px-4 py-2">
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        {grupo.length} producto{grupo.length !== 1 ? "s" : ""}
                                                    </span>
                                                </td>

                                                {/* Fecha inicio / última actualización en la misma línea */}
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="text-gray-500">{fechaInicio}</span>
                                                        <span className="text-gray-300">/</span>
                                                        <span className={`font-semibold ${textColor}`}>{fechaEstado}</span>
                                                    </div>
                                                </td>

                                                {/* Estado + nombre del producto más recientemente actualizado */}
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorEstado}`}>
                                                        {estado}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]" title={producto}>
                                                        {producto}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-2">

                                                        {/* VER */}
                                                        <button
                                                            title="Ver detalle"
                                                            onClick={() => navigate("/dashboard/sales-management/return", {
                                                                state: { idVenta, mode: "view-only" },
                                                            })}
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>

                                                        {/* EDITAR / COMPLETADO / ANULADO */}
                                                        <div className="relative group flex items-center">

                                                            <button
                                                                onClick={() =>
                                                                    !bloqueado &&
                                                                    navigate("/dashboard/sales-management/return", {
                                                                        state: { idVenta, mode: "editable" },
                                                                    })
                                                                }
                                                                disabled={bloqueado}
                                                                className={`p-2 rounded-lg transition ${
                                                                    anulado
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
                                                        <button
                                                            title="Anular"
                                                            onClick={() => handleAnularGrupo(grupo)}
                                                            disabled={anulado}
                                                            className={`p-2 rounded-lg transition duration-300 ${
                                                                anulado
                                                                    ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                    : "bg-red-100 hover:bg-red-200 cursor-pointer"
                                                            }`}
                                                        >
                                                            <Ban size={18} className="text-red-600" />
                                                        </button>

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

                <div className="flex justify-end mt-auto">
                    <Pagination
                        currentPage={paginaActual}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

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
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}
        </>
    );
}
