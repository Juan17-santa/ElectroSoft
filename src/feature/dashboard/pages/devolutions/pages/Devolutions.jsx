import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Ban, RotateCcw } from "lucide-react";
import { useDevolutions } from "../hooks/useDevolutions";
import { getEstadoColor } from "../helpers/devolutionsHelpers";
import SearchBar    from "../../../components/ui/Searchbar";
import Pagination   from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert        from "../../../components/ui/Alert";
import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";

const ITEMS_PER_PAGE = 8;
const ESTADOS_BLOQUEADOS = ["RESUELTO", "RECHAZADA", "Anulada"];

export default function Devolutions() {
    const navigate = useNavigate();
    const {
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        anularPorVenta,
    } = useDevolutions();

    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert]             = useState(null);

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

    // Helpers de grupo
    const getFechaInicio = (g) =>
        g.reduce((min, d) => {
            const f = d.fechaISO ?? d.fecha ?? "";
            return (!min || f < min) ? f : min;
        }, null) ?? "—";

    const getFechaEstado = (g) =>
        g.reduce((max, d) => {
            const f = d.fechaEstado ?? "";
            return (!max || f > max) ? f : max;
        }, null) ?? "—";

    const getEstadoGrupo = (g) => {
        const sorted = [...g].sort((a, b) =>
            (b.creadoEn ?? "").localeCompare(a.creadoEn ?? "")
        );
        return sorted[0]?.estadoResolucion ?? "—";
    };

    const editBloqueado = (g) =>
        g.every((d) => ESTADOS_BLOQUEADOS.includes(d.estadoResolucion));

    const getPrimeraEditable = (g) =>
        g.find((d) => !ESTADOS_BLOQUEADOS.includes(d.estadoResolucion));

    // Handlers
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

    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte Excel",
            message: "¿Deseas descargar el reporte de devoluciones en Excel?",
            onConfirm: () => {
                generateExcelReport({
                    title: "Gestión de Devoluciones — Reporte",
                    fileName: "reporte_devoluciones.xlsx",
                    columns: ["#", "ID Venta", "Productos devueltos", "Motivos", "Fecha inicio", "Fecha estado", "Estado"],
                    data: gruposPorVenta.map((g, i) => [
                        String(i + 1).padStart(2, "0"),
                        g[0].idVenta ?? "—",
                        String(g.length),
                        g.map((d) => d.motivo).filter(Boolean).join(" / ") || "—",
                        getFechaInicio(g),
                        getFechaEstado(g),
                        getEstadoGrupo(g),
                    ]),
                });
                setAlert({ type: "success", message: "Reporte Excel generado correctamente." });
                setConfirmData(null);
            },
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                <p className="text-xl font-semibold flex items-center gap-2">
                    <RotateCcw size={22} className="text-yellow-500" />
                    Gestión De Devoluciones
                </p>

                {/* Sin botón Crear — corrección 1 */}
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
                                    <th className="px-3 py-2 font-semibold">Fecha inicio / Fecha estado</th>
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
                                        const idVenta     = grupo[0].idVenta;
                                        const estadoGrupo = getEstadoGrupo(grupo);
                                        const colorEstado = getEstadoColor(estadoGrupo);
                                        const fechaInicio = getFechaInicio(grupo);
                                        const fechaEstado = getFechaEstado(grupo);
                                        const bloqueado   = editBloqueado(grupo);
                                        const editable    = getPrimeraEditable(grupo);
                                        const anulado     = grupo.every((d) => d.estadoResolucion === "Anulada");
                                        // Color de texto del estado para la fechaEstado
                                        const textColor   = colorEstado.split(" ").find((c) => c.startsWith("text-")) ?? "text-gray-500";

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

                                                {/* Fecha inicio arriba, Fecha estado abajo con color del estado — corrección 3 */}
                                                <td className="px-4 py-2 leading-relaxed">
                                                    <p className="text-xs text-gray-500">{fechaInicio}</p>
                                                    <p className={`text-xs font-semibold ${textColor}`}>{fechaEstado}</p>
                                                </td>

                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorEstado}`}>
                                                        {estadoGrupo}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-2">

                                                        {/* VER → Devolución de venta */}
                                                        <button
                                                            title="Ver detalle"
                                                            onClick={() => navigate("/dashboard/sales-management/return", {
                                                                state: { idVenta, fromDevolutions: true },
                                                            })}
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>

                                                        {/* EDITAR — desactivado si RESUELTO o RECHAZADA — corrección 4 */}
                                                        <button
                                                            title={bloqueado ? "No se puede editar (resuelta o rechazada)" : "Editar"}
                                                            onClick={() =>
                                                                !bloqueado && editable &&
                                                                navigate(`/dashboard/devolutions/edit/${editable.id}`, {
                                                                    state: { idVenta },
                                                                })
                                                            }
                                                            disabled={bloqueado}
                                                            className={`p-2 rounded-lg transition ${
                                                                bloqueado
                                                                    ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                    : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                                                            }`}
                                                        >
                                                            <Pencil size={18} className="text-yellow-600" />
                                                        </button>

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

                <div className="flex justify-end">
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
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}
        </>
    );
}
