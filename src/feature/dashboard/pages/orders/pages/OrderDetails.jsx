import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info, X, Package, Calendar as CalendarIcon, User, FileText } from "lucide-react";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Pagination from "../../../components/ui/Pagination";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { ServicesOrders } from "../services/ServicesOrders";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        const loadOrderDetails = async () => {
            try {
                setLoading(true);
                const res = await ServicesOrders.getOrderById(id);
                if (res) setOrder(res.data || res);
            } catch (error) {
                console.error("Error al cargar los detalles:", error);
                setAlert({ type: "error", message: "No se pudieron cargar los detalles del pedido." });
            } finally {
                setLoading(false);
            }
        };
        if (id) loadOrderDetails();
    }, [id]);

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-";
    const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
    const handleBack = () => navigate("/dashboard/orders");

    if (loading) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm animate-pulse">Cargando detalles del pedido...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-center justify-center h-full shadow-inner gap-4">
                <p className="text-gray-500 text-sm font-medium">No se encontró la información del pedido.</p>
                <button onClick={handleBack} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Volver a la lista</button>
            </div>
        );
    }

    const client = order.client || {};
    const clientName = client.firstName ? `${client.firstName} ${client.lastName || ""}`.trim() : "Sin nombre";
    const docType = client.documentType?.abbreviation || "CE";
    const docNumber = client.documentNumber || "-";
    const paymentMethod = order.paymentMethod || "-";
    const status = order.status || "-";
    const visualId = order._id ? order._id.slice(-6).toUpperCase() : "-";

    // Paginación de productos de tu array "products"
    const products = order.products || [];
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleReport = () => {
        const columns = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
        const dataReport = products.map(prod => [prod.name, prod.quantity, formatCurrency(prod.price), formatCurrency(prod.lineTotal)]);

        generatePDFReport({
            title: `Reporte del Pedido #${visualId}`,
            fileName: `pedido_${visualId}.pdf`,
            columns,
            data: dataReport,
            extraInfo: [
                `Fecha del pedido: ${formatDate(order.orderDate)}`,
                `Documento: ${docType} - ${docNumber}`,
                `Cliente: ${clientName}`,
                `Forma de pago: ${paymentMethod}`
            ],
            totals: [
                `Subtotal: ${formatCurrency(order.subtotal)}`,
                `IVA incluido (19%): ${formatCurrency(order.iva)}`,
                `Total: ${formatCurrency(order.total)}`
            ]
        });

        setShowPrintModal(false);
        setAlert({ type: "success", message: "El reporte del pedido se generó correctamente." });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner min-h-full overflow-y-auto">
                <div className="relative bg-white rounded-3xl p-8 shadow-lg flex-1"
                    style={{ backgroundImage: "url(/background-details.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
                    <div className="absolute inset-0 bg-white/40 rounded-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col gap-6">
                        {/* ENCABEZADO */}
                        <div className="flex flex-col md:flex-row gap-3 justify-between">
                            <div className="flex items-center gap-2">
                                <Info size={22} className="text-gray-700" />
                                <h2 className="text-base sm:text-xl font-semibold text-gray-800 break-all">Ver información del Pedido #{visualId}</h2>
                            </div>
                            <button onClick={() => setShowPrintModal(true)} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 transition shadow-sm cursor-pointer w-fit">
                                <FileText size={18} className="text-gray-500" /> Imprimir
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* COLUMNA IZQUIERDA: CLIENTE Y PEDIDO */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><User size={14} /> Datos del Cliente</h3>
                                    <p className="text-sm text-yellow-500 font-medium">Nombre completo</p>
                                    <p className="text-base font-semibold text-gray-800 mb-3 capitalize">{clientName}</p>
                                    <p className="text-sm text-yellow-500 font-medium">Documento</p>
                                    <p className="text-base font-semibold text-gray-800">{docType} - {docNumber}</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><CalendarIcon size={14} /> Datos del pedido</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-yellow-500 font-medium">Fecha Pedido</p>
                                            <p className="text-sm font-semibold text-gray-800">{formatDate(order.orderDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-500 font-medium">Forma de Pago</p>
                                            <p className="text-sm font-semibold text-gray-800">{paymentMethod}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-yellow-500 font-medium mb-1">Estado</p>
                                            <p className={`py-1 rounded-full text-sm text-center font-bold shadow-sm ${status === 'Pendiente' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                                {status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: TABLA DE PRODUCTOS */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={18} className="text-yellow-500" />
                                        <span className="font-bold text-gray-700 text-sm uppercase">Productos del Pedido</span>
                                    </div>
                                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                                </div>

                                <div className="overflow-x-auto flex-1">
                                    <table className="min-w-96 w-full text-left text-sm">
                                        <thead className="text-gray-500 sticky top-0 bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Producto</th>
                                                <th className="px-4 py-3 font-semibold text-center w-24">Cant.</th>
                                                <th className="px-4 py-3 font-semibold text-center w-32">Precio Unit.</th>
                                                <th className="px-4 py-3 font-semibold text-center w-32">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentProducts.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center py-4 text-gray-400">Este pedido no registra productos.</td></tr>
                                            ) : (
                                                currentProducts.map((prod, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{prod.name}</td>
                                                        <td className="px-4 py-3 text-center">{prod.quantity}</td>
                                                        <td className="px-4 py-3 text-center">{formatCurrency(prod.price)}</td>
                                                        <td className="px-4 py-3 text-center font-semibold">{formatCurrency(prod.lineTotal)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* TOTALES */}
                                <div className="bg-gray-50 border-t border-gray-200 p-4 mt-auto">
                                    <div className="flex flex-wrap justify-end items-center gap-4 md:gap-10 text-xs md:text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-gray-500 uppercase">Subtotal:</span>
                                            <span className="text-gray-800 font-semibold">{formatCurrency(order.subtotal)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500 uppercase">IVA (19%):</span>
                                            <span className="text-blue-600 font-semibold">{formatCurrency(order.iva)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-700 uppercase font-bold">Total:</span>
                                            <span className="text-green-600 font-bold">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <PrimaryButton type="button" onClick={handleBack}><X size={18} className="inline-block mr-2" /> Volver</PrimaryButton>
                </div>
            </div>

            {showPrintModal && (
                <ConfirmModal type="info" title="Imprimir pedido" message={`¿Seguro que deseas imprimir el reporte en PDF del pedido #${visualId}?`} onConfirm={handleReport} onCancel={() => setShowPrintModal(false)} />
            )}

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}