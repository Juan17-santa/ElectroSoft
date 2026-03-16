/**
 * SalesManagement.jsx
 *
 * Página principal de gestión de ventas.
 * Muestra una tabla con todas las ventas registradas, permite buscar,
 * paginar, generar reportes PDF y ejecutar acciones por venta:
 * - Ver detalles (ojo) → navega a SaleDetailsPage
 * - Ver crédito (tarjeta) → navega a CreditDetailsPage (solo créditos vigentes)
 * - Devolver (undo) → navega a ReturnSalesPage
 * - Anular (ban) → cambia el estado a "Anulado"
 */
import { Eye, Undo2, Ban, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/Alert";
import { generatePDFReport } from "../../../../utils/PDFReportGenerator";
import { generateExcelReport } from "../../../../utils/ExcelReportGenerator";
import CancellationModal from "./components/CancellationModal";
import { ServicesProducts } from "../products/services/ServicesProducts";

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0);
};

const ITEMS_PER_PAGE = 8;

export default function SalesManagement() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [cancelModalSale, setCancelModalSale] = useState(null);

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

    useEffect(() => { getSales(); }, []);

    const getSales = () => {
        try {
            const response = SalesService.get();
            const clients = JSON.parse(localStorage.getItem("clients") || "[]");
            const salesConCliente = response.map(sale => {
                if (!sale.cliente) {
                    const found = clients.find(c => c.documento === sale.numeroDocumento);
                    if (found) return { ...sale, cliente: `${found.nombres} ${found.apellidos}` };
                }
                return sale;
            });
            setSales(salesConCliente);
        } catch (error) {
            console.error(error);
        }
    };

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

    const confirmAnull = (motivo) => {
        const availableProducts = ServicesProducts.get();
        cancelModalSale.productos?.forEach(p => {
             const currentProd = availableProducts.find(ap => ap.nombre === p.nombre);
             if (currentProd) {
                  ServicesProducts.update({ ...currentProd, stock: (currentProd.stock || 0) + p.cantidad });
             }
        });

        const allSales = SalesService.get();
        const saleIndex = allSales.findIndex(s => s.id === cancelModalSale.id);
        if (saleIndex !== -1) {
             allSales[saleIndex].estado = "Anulado";
             allSales[saleIndex].motivoAnulacion = motivo;
             allSales[saleIndex].fechaAnulacion = new Date().toISOString().split("T")[0];
             localStorage.setItem("sales", JSON.stringify(allSales));
             setSales(allSales.map(sale => {
                 if (!sale.cliente) {
                     const clients = JSON.parse(localStorage.getItem("clients") || "[]");
                     const found = clients.find(c => c.documento === sale.numeroDocumento);
                     if (found) return { ...sale, cliente: `${found.nombres} ${found.apellidos}` };
                 }
                 return sale;
             }));
        }
        
        showAlert("success", "Venta anulada y productos devueltos al stock correctamente.");
        setCancelModalSale(null);
    };

    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de ventas?",
            onConfirm: () => {
                const reportTitle = "Gestión de Ventas - Reporte";
                const columns = ["# Venta", "Cliente", "Fecha", "Tipo", "Total", "Pagado", "Por Pagar", "Estado"];
                const data = filteredSales.map(sale => [
                    String(sale.numeroVenta || "").padStart(2, '0'),
                    sale.cliente || "-",
                    sale.fecha,
                    sale.tipoVenta,
                    formatCOP(sale.total),
                    formatCOP(sale.montoPagado),
                    formatCOP(sale.montoPorPagar),
                    sale.estado
                ]);

                generateExcelReport({
                    title: reportTitle,
                    fileName: "reporte_ventas.xlsx",
                    columns: columns,
                    data: data
                });

                showAlert("success", "Reporte Excel generado correctamente.");
                setConfirmData(null);
            }
        });
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
                <p className="text-xl font-semibold">Gestión de Ventas</p>

                {/* BUSCADOR */}
                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar por documento, cliente..."
                    onCreateClick={() => navigate("/dashboard/sales-management/create")}
                    createButtonText="Nueva Venta"
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-white rounded-2xl border-none overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-3 font-semibold"># venta</th>
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
                                {paginatedSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                                            No hay ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSales.map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-3 py-3 font-medium">#{String(sale.numeroVenta || "").padStart(2, '0') || '-'}</td>
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
                                                <div className="flex justify-center gap-1.5">
                                                    {/* DEVOLVER */}
                                                    <button
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                        onClick={() => handleReturn(sale)}
                                                        title="Devolver venta"
                                                        disabled={sale.estado === "Devuelto" || sale.estado === "Anulado"}
                                                    >
                                                        <Undo2 size={18} className="text-yellow-600" />
                                                    </button>

                                                    {/* VER DETALLES */}
                                                    <button
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        onClick={() => handleViewDetails(sale)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* ANULAR */}
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                        onClick={() => handleAnull(sale)}
                                                        title="Anular venta"
                                                        disabled={sale.estado === "Anulado" || sale.estado === "Devuelto"}
                                                    >
                                                        <Ban size={18} className="text-red-500" />
                                                    </button>

                                                    {/* CREDITO */}
                                                    {sale.tipoVenta === "Credito" && sale.estado === "Vigente" && (
                                                        <button
                                                            className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                            onClick={() => handleViewCredit(sale)}
                                                            title="Detalles del crédito"
                                                        >
                                                            <CreditCard size={17} className="text-yellow-600" />
                                                        </button>
                                                    )}
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
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={pageActual}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
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