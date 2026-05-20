import { useState, useRef } from "react";
import { Eye, Ban, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShopping } from "../shopping/hooks/useShopping";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/Alert";
import CancellationModal from "../../components/ui/CancellationModal";
import CancellationInfoTooltip from "../../components/ui/CancellationInfoTooltip";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Restricted } from "../../components/ui/Restricted";
import { useShoppingReport } from "../shopping/hooks/useShoppingReport";

const ITEMS_PER_PAGE = 11;

// ─── Botón anular con tooltip informativo cuando no se puede anular ───────────
function BanButton({ puedeAnularse, onClick }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const handleMouseEnter = () => {
        if (!puedeAnularse && buttonRef.current) {
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
                onClick={puedeAnularse ? onClick : undefined}
                className={`p-2 rounded-lg transition duration-300 ${puedeAnularse
                        ? "bg-red-100 hover:bg-red-200 cursor-pointer"
                        : "bg-red-100 opacity-40 cursor-not-allowed"
                    }`}
            >
                <Ban size={18} className="text-red-600" />
            </button>

            {showTooltip && (
                <div
                    className="fixed z-50 bg-gray-50 text-gray-400 rounded-xl shadow-2xl p-4 w-64 border border-gray-400"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                >
                    <div className="space-y-3">
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
                                La compra ha superado el plazo de 48 horas y no se puede anular.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Shopping() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const { comprasFiltradas, searchTerm, setSearchTerm, handleAnular, validarAnulacion, loading, error, clearError } = useShopping();
    const [currentPage, setCurrentPage] = useState(1);
    const [cancelModalData, setCancelModalData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const showAlert = (type, message) => setAlert({ type, message });

    const { exportReport } = useShoppingReport(comprasFiltradas, setAlert);

    // Paginación
    const comprasOrdenadas = [...comprasFiltradas];
    const totalPages = Math.max(1, Math.ceil(comprasOrdenadas.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const comprasPagina = comprasOrdenadas.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleGenerarReporte = () => setShowReportModal(true);

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                {/* TITULO */}
                <p className="text-xl font-semibold flex items-center gap-2">
                    Control de Compras
                </p>

                {/* BUSCADOR, REPORTE Y BOTON CREAR */}
                <Searchbar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar compras..."
                    onCreateClick={() => navigate("/dashboard/shopping/create")}
                    createButtonText="Nueva Compra"
                    showCreateButton={hasPermission("Compras", "Crear")}
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-4 py-2 font-semibold">ID</th>
                                    <th className="px-4 py-2 font-semibold">Número de Factura</th>
                                    <th className="px-4 py-2 font-semibold">Fecha de compra</th>
                                    <th className="px-4 py-2 font-semibold">Proveedor</th>
                                    <th className="px-4 py-2 font-semibold">Total</th>
                                    <th className="px-4 py-2 font-semibold">Estado</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                                            Cargando compras...
                                        </td>
                                    </tr>
                                ) : comprasPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                                            No hay compras registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    comprasPagina.map((compra, index) => {
                                        const validacion = validarAnulacion(compra);
                                        return (
                                            <tr key={compra.id}>
                                                <td className="px-4 py-1 border-b border-gray-300">
                                                    {String((paginaActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                                </td>
                                                <td className="px-4 py-1 border-b border-gray-300">{compra.numeroFactura}</td>
                                                <td className="px-4 py-1 border-b border-gray-300">{compra.fechaCompra}</td>
                                                <td className="px-4 py-1 border-b border-gray-300">{compra.proveedor}</td>
                                                <td className="px-4 py-1 border-b border-gray-300">{compra.total}</td>
                                                <td className="px-4 py-1 border-b border-gray-300">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${compra.estado === "Activo"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                        }`}>
                                                        {compra.estado}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-1 border-b border-gray-300">
                                                    <div className="flex justify-center gap-4">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/shopping/details/${compra.id}`)}
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>

                                                        {compra.estado === "Anulada" ? (
                                                            <CancellationInfoTooltip cancelInfo={compra.infoAnulacion} />
                                                        ) : (
                                                            <Restricted scope="Compras" action="Eliminar">
                                                                <BanButton
                                                                    puedeAnularse={validacion.puedeAnularse}
                                                                    onClick={() => setCancelModalData(compra)}
                                                                />
                                                            </Restricted>
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
                </div>

                {/* PAGINADOR */}
                {/* PAGINADOR */}
                {comprasFiltradas.length > 0 && (
                    <div className="flex justify-end mt-auto">
                        <Pagination
                            currentPage={paginaActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* MODAL DE REPORTE CON RANGO DE FECHAS */}
            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte de compras"
                    message="Selecciona el rango de fechas para exportar el reporte"
                    showDateFilter={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ fechaInicio, fechaFin }) => {
                        exportReport(fechaInicio, fechaFin);
                        setShowReportModal(false);
                    }}
                />
            )}

            {/* MODAL DE ANULACION */}
            {cancelModalData && (
                <CancellationModal
                    title="Anular Compra"
                    infoData={[
                        { label: "Factura", value: cancelModalData?.numeroFactura ?? "" },
                        { label: "Proveedor", value: cancelModalData?.proveedor ?? "" },
                    ]}
                    placeholder="Describe el motivo de la anulación..."
                    minLength={20}
                    onConfirm={async () => {
                        try {
                            await handleAnular(cancelModalData.id);
                            setCancelModalData(null);
                            showAlert("success", "La compra fue anulada correctamente.");
                        } catch (err) {
                            setCancelModalData(null);
                            showAlert("error", err.message || "No se pudo anular la compra.");
                        }
                    }}
                    onCancel={() => setCancelModalData(null)}
                />
            )}

            {/* ALERTA */}
            {(alert || error) && (
                <Alert
                    type={alert?.type || "error"}
                    message={alert?.message || error}
                    onClose={() => {
                        setAlert(null);
                        clearError();
                    }}
                />
            )}
        </>
    );
}
