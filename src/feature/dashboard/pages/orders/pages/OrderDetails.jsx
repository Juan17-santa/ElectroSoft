import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info, Package, Calendar as CalendarIcon, User, FileText, ArrowLeft } from "lucide-react";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { ServicesOrders } from "../services/ServicesOrders";
import { useToast } from "../../../../../context/ToastContext";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 4;

    useEffect(() => {
        let isMounted = true;

        const loadOrderDetails = async () => {
            setLoading(true);
            try {
                const data = await ServicesOrders.getOrderById(id);
                if (isMounted) {
                    setOrder(data);
                }
            } catch (error) {
                if (isMounted) {
                    showToast("error", error.message || "No se pudieron cargar los detalles del pedido.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            loadOrderDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [id]);


    const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-";
    const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
    const handleBack = () => navigate("/dashboard/orders");

    if (loading) {
        return (
            <div className="bg-white p-6 flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm animate-pulse">
                    Cargando detalles del pedido...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white p-6 flex flex-col items-center justify-center h-full gap-4">
                <p className="text-gray-500 text-sm font-medium">
                    No se encontró la información del pedido.
                </p>

                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                    Volver a la lista
                </button>
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

    // PRODUCTOS
    const products = order.products || [];
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // GENERAR REPORTE
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
        showToast("success", "El reporte del pedido se generó correctamente.");
    };

    return (
        <>
            {/* CONTENEDOR PRINCIPAL */}
            <div className="bg-white p-4 md:p-6 flex flex-col w-full min-h-full overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto">

                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pb-5 border-b border-gray-300">
                        <div className="flex items-center gap-2 min-w-0">
                            <Info
                                size={22}
                                className="text-gray-700 shrink-0"
                            />
                            <h2 className="text-base sm:text-xl font-semibold text-gray-800 break-all">
                                Ver información del Pedido #{visualId}
                            </h2>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-600 transition shadow-sm hover:shadow-md cursor-pointer w-fit"
                            >
                                <FileText size={18} className="text-gray-500" />
                                Imprimir
                            </button>

                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </button>

                        </div>
                    </div>

                    {/* INFORMACIÓN DEL CLIENTE Y PEDIDO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-300">

                        {/* DATOS DEL CLIENTE */}
                        <div className="py-6 lg:pr-8 lg:border-r lg:border-gray-300">

                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-5 flex items-center gap-2">
                                <User size={15} />
                                Datos del Cliente
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                <div>
                                    <p className="text-sm text-yellow-500 mb-1">
                                        Nombre completo
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">
                                        {clientName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-500 mb-1">
                                        Documento
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {docType} - {docNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DATOS DEL PEDIDO */}
                        <div className="py-6 lg:pl-8">

                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-5 flex items-center gap-2">
                                <CalendarIcon size={15} />
                                Datos del Pedido
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                <div>
                                    <p className="text-sm text-yellow-500 mb-1">
                                        Fecha Pedido
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {formatDate(order.orderDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-500 mb-1">
                                        Forma de Pago
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {paymentMethod}
                                    </p>
                                </div>
                            </div>

                            {/* ESTADO */}
                            <div className="mt-6">
                                <p className="text-sm text-yellow-500 mb-2">
                                    Estado
                                </p>

                                <div
                                    className={`border rounded-lg overflow-hidden ${
                                        status === "Por procesar"
                                            ? "border-blue-200"
                                            : "border-red-200"
                                    }`}
                                >
                                    <div
                                        className={`px-4 py-2 font-semibold text-center uppercase text-sm ${
                                            status === "Por procesar"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {status}
                                    </div>

                                    {status === "Anulado" && (
                                        <div className="px-4 py-3 bg-white">
                                            <p className="text-xs font-semibold uppercase text-red-600 mb-1">
                                                Motivo de anulación
                                            </p>

                                            <p className="text-sm text-red-700">
                                                {order.cancelReason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCTOS DEL PEDIDO */}
                    <div className="pt-6">

                        {/* CABECERA DE PRODUCTOS */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Package
                                    size={18}
                                    className="text-yellow-500"
                                />

                                <span className="font-bold text-gray-700 text-sm uppercase">
                                    Productos del Pedido
                                </span>
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>

                        {/* TABLA */}
                        <div className="overflow-x-auto">
                            <table className="min-w-150 w-full text-left text-sm">
                                <thead className="text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold">
                                            Producto
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center w-24">
                                            Cant.
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center w-32">
                                            Precio Unit.
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center w-32">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {currentProducts.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-8 text-gray-400"
                                            >
                                                Este pedido no registra productos.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentProducts.map((prod, idx) => (
                                            <tr
                                                key={idx}
                                                className="hover:bg-gray-50 transition"
                                            >

                                                <td className="px-4 py-4 font-medium text-gray-800">
                                                    {prod.name}
                                                </td>

                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {prod.quantity}
                                                </td>

                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {formatCurrency(prod.price)}
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold text-gray-800">
                                                    {formatCurrency(prod.lineTotal)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALES */}
                        <div className="border-t border-gray-300 pt-5 mt-2">
                            <div className="flex flex-col items-end gap-2 text-sm">

                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        Subtotal:
                                    </span>

                                    <span className="text-gray-800 font-semibold">
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>


                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        IVA (19%):
                                    </span>

                                    <span className="text-blue-600 font-semibold">
                                        {formatCurrency(order.iva)}
                                    </span>
                                </div>


                                <div className="flex justify-between gap-8 min-w-65 pt-2 border-t border-gray-300">

                                    <span className="text-gray-700 uppercase font-bold">
                                        Total:
                                    </span>

                                    <span className="text-green-600 font-bold text-base">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE IMPRESIÓN */}
            {showPrintModal && (
                <ConfirmModal
                    type="info"
                    title="Imprimir pedido"
                    message={`¿Seguro que deseas imprimir el reporte en PDF del pedido #${visualId}?`}
                    onConfirm={handleReport}
                    onCancel={() => setShowPrintModal(false)}
                />
            )}
        </>
    );
}