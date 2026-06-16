import { Eye, Undo2, Ban, Wallet } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/Alert";
import CancellationModal from "./components/CancellationModal";
import { ServicesProducts } from "../products/services/ServicesProducts";
import { useSalesReport } from "./hooks/useSalesReport";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Restricted } from "../../components/ui/Restricted";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

const ITEMS_PER_PAGE = 8;

export default function SalesManagement() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [cancelModalSale, setCancelModalSale] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const { exportReport } = useSalesReport(sales, setAlert);

    const showAlert = (type, message) => setAlert({ type, message });

    const filteredSales = sales.filter(sale =>
        (sale.numeroDocumento?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (sale.cliente?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (sale.fecha?.includes(search)) ||
        (sale.tipoVenta?.toLowerCase().includes(search.toLowerCase())) ||
        (sale.total?.toString().includes(search)) ||
        (sale.montoPagado?.toString().includes(search)) ||
        (sale.montoPorPagar?.toString().includes(search)) ||
        (sale.estado?.toLowerCase().includes(search.toLowerCase()))
    );

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
            const message = err.message || "No se pudieron cargar las ventas.";
            showAlert("error", message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { getSales(); }, [getSales]);

    // ✅ Refresca la tabla automáticamente cuando se registra un abono desde el módulo de Pagos
    useEffect(() => {
        window.addEventListener("payments-updated", getSales);
        return () => window.removeEventListener("payments-updated", getSales);
    }, [getSales]);

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

    const handleReturn = (sale) => {
        localStorage.setItem("saleToReturn", JSON.stringify(sale));
        navigate("/dashboard/sales-management/return");
    };

    const handleAnull = (sale) => {
        setCancelModalSale(sale);
    };

    const confirmAnull = async (motivo) => {
        try {
            await SalesService.anullSale(cancelModalSale.id);
            // Stock is returned by the backend (impactApplied)
            await getSales();
            showAlert("success", "Venta anulada correctamente.");
        } catch (error) {
            console.error("Error anulling sale:", error);
            showAlert("error", "Error al anular la venta.");
        }
        setCancelModalSale(null);
    };

    const handleGenerarReporte = () => {
        setShowReportModal(true);
    };

    const getEstadoDot = (estado) => {
        switch (estado) {
            case "Finalizado": case "Finalizadas": return "bg-green-500";
            case "Vigente": return "bg-yellow-500";
            case "Anulado": return "bg-red-500";
            case "Devuelto": return "bg-gray-100 text-gray-600";
            case "Devolución Parcial": return "bg-amber-100 text-amber-600";
            default: return "bg-gray-100 text-gray-600";
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
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-white rounded-2xl border-none overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-3 font-semibold">ID</th>
                                    <th className="px-3 py-3 font-semibold">Cliente</th>
                                    <th className="px-3 py-3 font-semibold">Fecha</th>
                                    <th className="px-3 py-3 font-semibold">Tipo de venta</th>
                                    <th className="px-3 py-3 font-semibold">Total</th>
                                    <th className="px-3 py-3 font-semibold">Monto Pagado</th>
                                    <th className="px-3 py-3 font-semibold">Monto Por Pagar</th>
                                    <th className="px-3 py-3 font-semibold">Estado</th>
                                    <th className="px-3 py-3 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                Cargando ventas...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-4 text-center text-gray-400">
                                            No hay ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSales.map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-3 py-3 font-medium">{String(sale.numeroVenta || "").padStart(2, '0') || '-'}</td>
                                            <td className="px-3 py-3">{sale.cliente || "-"}</td>
                                            <td className="px-3 py-3">{sale.fecha}</td>
                                            <td className="px-3 py-3">{sale.tipoVenta}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.total)}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.montoPagado)}</td>
                                            <td className="px-3 py-3">{formatCOP(sale.montoPorPagar)}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${getEstadoDot(sale.estado)}`}></span>
                                                    <span className="text-sm">{sale.estado}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-center flex-nowrap gap-1.5 h-9">
                                                    {/* DEVOLVER */}
                                                    <Restricted scope="Ventas" action="Editar">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            <button
                                                                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                                onClick={() => handleReturn(sale)}
                                                                title="Devolver venta"
                                                                disabled={sale.estado === "Devuelto" || sale.estado === "Anulado"}
                                                            >
                                                                <Undo2 size={18} className="text-yellow-600" />
                                                            </button>
                                                        </div>
                                                    </Restricted>

                                                    {/* VER DETALLES */}
                                                    <div className="flex-none flex items-center justify-center w-9 h-9">
                                                        <button
                                                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                            onClick={() => handleViewDetails(sale)}
                                                            title="Ver detalles"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>
                                                    </div>

                                                    {/* ANULAR */}
                                                    <Restricted scope="Ventas" action="Eliminar">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            <button
                                                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                                onClick={() => handleAnull(sale)}
                                                                title="Anular venta"
                                                                disabled={sale.estado === "Anulado" || sale.estado === "Devuelto"}
                                                            >
                                                                <Ban size={18} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                    </Restricted>

                                                    {/* CREDITO */}
                                                    <div className="flex-none flex items-center justify-center w-9 h-9">
                                                        {(sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito") && (sale.estado === "Vigente" || sale.estado === "Finalizado") && (
                                                            <button
                                                                className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                                onClick={() => handleViewCredit(sale)}
                                                                title="Detalles del crédito"
                                                            >
                                                                <Wallet size={17} className="text-yellow-600" />
                                                            </button>
                                                        )}
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

            {/* ALERTA */}
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
