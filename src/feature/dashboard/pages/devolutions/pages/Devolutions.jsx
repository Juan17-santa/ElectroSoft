import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Ban, RotateCcw } from "lucide-react";
import { useDevolutions } from "../hooks/useDevolutions";
import { getEstadoColor } from "../helpers/devolutionsHelpers";
import SearchBar    from "../../../components/ui/Searchbar";
import Pagination   from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert        from "../../../components/ui/Alert";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";

const ITEMS_PER_PAGE = 8;

export default function Devolutions() {
    const navigate = useNavigate();
    const {
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        anularDevolucion,
    } = useDevolutions();

    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert]             = useState(null);

    // ─── Paginación ───────────────────────────────────────────────────────────
    const devolucionesOrdenadas = [...devolucionesFiltradas].reverse();
    const totalPages   = Math.max(1, Math.ceil(devolucionesOrdenadas.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const itemsPagina  = devolucionesOrdenadas.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleAnular = (devolucion) => {
        setConfirmData({
            type: "warning",
            title: "Anular devolución",
            message: `¿Estás seguro de que deseas anular la devolución #${String(devolucion.id).slice(-4)}?`,
            onConfirm: () => {
                anularDevolucion(devolucion.id);
                setAlert({ type: "success", message: "Devolución anulada correctamente." });
                setConfirmData(null);
            },
        });
    };

    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de devoluciones?",
            onConfirm: () => {
                generatePDFReport({
                    title: "Gestión de Devoluciones — Reporte",
                    fileName: "reporte_devoluciones.pdf",
                    columns: ["ID", "ID Venta", "Motivo", "Condición", "Gestión", "Responsable", "Fecha", "Estado"],
                    data: devolucionesFiltradas.map((d, i) => [
                        String(i + 1).padStart(2, "0"),
                        d.idVenta             || "—",
                        d.motivo              || "—",
                        d.condicionProducto   || "—",
                        d.gestion             || "—",
                        d.responsable         || "—",
                        d.fecha               || "—",
                        d.estadoResolucion    || "—",
                    ]),
                });
                setAlert({ type: "success", message: "Reporte generado correctamente." });
                setConfirmData(null);
            },
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                {/* TÍTULO */}
                <p className="text-xl font-semibold flex items-center gap-2">
                    <RotateCcw size={22} className="text-yellow-500" />
                    Gestión De Devoluciones
                </p>

                {/* BUSCADOR */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar por ID, por devolución, por cliente..."
                    onCreateClick={() => navigate("/dashboard/devolutions/create")}
                    createButtonText="Crear Devolución"
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold">ID</th>
                                    <th className="px-3 py-2 font-semibold">ID_venta</th>
                                    <th className="px-3 py-2 font-semibold">Motivo</th>
                                    <th className="px-3 py-2 font-semibold">Condición producto</th>
                                    <th className="px-3 py-2 font-semibold">Gestión</th>
                                    <th className="px-3 py-2 font-semibold">Responsable</th>
                                    <th className="px-3 py-2 font-semibold">Fecha inicio</th>
                                    <th className="px-3 py-2 font-semibold">Estado resolución</th>
                                    <th className="px-3 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {itemsPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                                            No hay devoluciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    itemsPagina.map((d, index) => (
                                        <tr key={d.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-1.5">
                                                {String((paginaActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                            </td>
                                            <td className="px-4 py-1">{d.idVenta || "—"}</td>
                                            <td className="px-4 py-1">{d.motivo || "—"}</td>
                                            <td className="px-4 py-1">{d.condicionProducto || "—"}</td>
                                            <td className="px-4 py-1">{d.gestion || "—"}</td>
                                            <td className="px-4 py-1">{d.responsable || "—"}</td>
                                            <td className="px-4 py-1">{d.fecha || "—"}</td>
                                            <td className="px-4 py-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(d.estadoResolucion)}`}>
                                                    {d.estadoResolucion || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1">
                                                <div className="flex justify-center gap-2">

                                                    {/* VER */}
                                                    <button
                                                        title="Ver detalle"
                                                        onClick={() => navigate(`/dashboard/devolutions/details/${d.id}`)}
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* EDITAR */}
                                                    <button
                                                        title="Editar"
                                                        onClick={() => navigate(`/dashboard/devolutions/edit/${d.id}`)}
                                                        disabled={d.estadoResolucion === "Anulada"}
                                                        className={`p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer ${
                                                            d.estadoResolucion === "Anulada"
                                                                ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                : "bg-blue-100 hover:bg-blue-200"
                                                        }`}
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>

                                                    {/* ANULAR */}
                                                    <button
                                                        title="Anular"
                                                        onClick={() => handleAnular(d)}
                                                        disabled={d.estadoResolucion === "Anulada"}
                                                        className={`p-2 rounded-lg transition duration-300 cursor-pointer bg-red-100 hover:bg-red-200 ${
                                                            d.estadoResolucion === "Anulada"
                                                                ? "bg-gray-100 opacity-40 cursor-not-allowed"
                                                                : "bg-red-100 hover:bg-red-200"
                                                        }`}
                                                    >
                                                        <Ban size={18} className="text-red-600" />
                                                    </button>

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
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}