import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X, Package, Calendar as CalendarIcon, User, FileText } from "lucide-react";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import Pagination from "../../../components/ui/Pagination";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";

export default function OrderDetails() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA LOCALIZAR
    const location = useLocation();

    // ESTADO PARA LA ALERTA
    const [alert, setAlert] = useState(null);

    // ESTADO PARA LA MODAL DE IMPRIMIR
    const [showPrintModal, setShowPrintModal] = useState(false);

    // ESTADO PARA RECIBIR EL PEDIDO DE STATE
    const orderDetail = location.state?.order;
    const [order, setOrder] = useState(null);

    // LÓGICA DE PAGINACIÓN
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // FUNCION PARA OBTENER LOS CLIENTES PARA EL NOMBRE
    useEffect(() => {
        if (orderDetail) {
            const storedCustomers = JSON.parse(localStorage.getItem("clients") || "[]");
            const customerInfo = storedCustomers.find(c => c.documento === orderDetail.documento);

            setOrder({
                ...orderDetail,
                nombres: customerInfo ? `${customerInfo.nombres} ${customerInfo.apellidos}` : "Cliente no encontrado",
            });
        }
    }, [orderDetail]);

    // CALCULOS PARA EL PAGINADOR
    const totalItems = order?.productos?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = order?.productos?.slice(indexOfFirstItem, indexOfLastItem) || [];

    // FORMATEADOR DE PLATA
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // SI NO LLEGA INFO EN EL STATE RETURNA MENSAJE
    if (!order) return <div className="p-6 text-center text-gray-500">No hay información del pedido.</div>;

    // FUNCION PARA SALIR
    const handleBack = () => navigate("/dashboard/orders");

    // FUNCION PARA IMPRIMIR PDF DE PEDIDO
    const handleReport = () => {

        const columns = [
            "Producto",
            "Cantidad",
            "Precio Unitario",
            "Subtotal"
        ];

        const data = order.productos.map(prod => [
            prod.nombre,
            prod.cantidad,
            formatCurrency(prod.precio),
            formatCurrency(prod.subtotal)
        ]);

        // CALCULO DE TOTALES
        const subtotal = order.productos.reduce((acc, prod) => acc + prod.subtotal, 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;

        generatePDFReport({
            title: `Reporte del Pedido #${order.id}`,
            fileName: `pedido_${order.id}.pdf`,
            columns,
            data,

            extraInfo: [
                `Fecha del pedido: ${order.fechaPedido}`,
                `Documento: ${order.tipoDocumento} - ${order.documento}`,
                `Cliente: ${order.nombres}`,
                `Forma de pago: ${order.formaPago}`
            ],

            totals: [
                `Subtotal: ${formatCurrency(subtotal)}`,
                `IVA (19%): ${formatCurrency(iva)}`,
                `Total: ${formatCurrency(total)}`
            ]
        });

        setShowPrintModal(false);

        setAlert({
            type: "success",
            message: "El pedido se imprimió correctamente"
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner min-h-full">
                <div className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden flex-1"
                    style={{ backgroundImage: 'url("/background-shopping-details.png")', backgroundSize: "cover", backgroundPosition: "center" }}>
                    <div className="absolute inset-0 bg-white/40 rounded-3xl"></div>

                    <div className="relative z-10 flex flex-col gap-6">
                        {/* ENCABEZADO */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info size={22} className="text-gray-700" />
                                <h2 className="text-xl font-semibold text-gray-800">Detalle del Pedido #{order.id}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowPrintModal(true)}
                                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600  transition duration-300 shadow-sm cursor-pointer"
                                >
                                    <FileText size={18} className="text-gray-500" />
                                    Imprimir
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* COLUMNA IZQUIERDA: CLIENTE Y FECHAS */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><User size={14} /> Datos del Cliente</h3>
                                    <p className="text-sm text-yellow-500 font-medium">Nombre completo</p>
                                    <p className="text-base font-semibold text-gray-800 mb-3">{order.nombres}</p>
                                    <p className="text-sm text-yellow-500 font-medium">Documento</p>
                                    <p className="text-base font-semibold text-gray-800">{order.tipoDocumento} - {order.documento}</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><CalendarIcon size={14} />Datos del pedido</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-yellow-500 font-medium">Fecha Pedido</p>
                                            <p className="text-sm font-semibold text-gray-800">{order.fechaPedido}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-500 font-medium">Forma de Pago</p>
                                            <p className="text-sm font-semibold text-gray-800">{order.formaPago}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-500 font-medium mb-1">Estado</p>
                                            <p className={`py-1 rounded-full text-sm text-center font-bold shadow-sm ${order.estado === 'Pendiente' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                                {order.estado}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: TABLA Y TU PAGINADOR */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={18} className="text-yellow-500" />
                                        <span className="font-bold text-gray-700 text-sm uppercase">Productos del Pedido</span>
                                    </div>

                                    {/* PAGINADOR */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>

                                <div className="overflow-auto min-h-72">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-gray-500 sticky top-0 bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Producto</th>
                                                <th className="px-4 py-3 font-semibold text-center w-24">Cant.</th>
                                                <th className="px-4 py-3 font-semibold text-center w-32">Precio Unit.</th>
                                                <th className="px-4 py-3 font-semibold text-center w-32">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentProducts.map((prod, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 font-medium text-gray-800">{prod.nombre}</td>
                                                    <td className="px-4 py-3 text-center">{prod.cantidad}</td>
                                                    <td className="px-4 py-3 text-center">{formatCurrency(prod.precio)}</td>
                                                    <td className="px-4 py-3 text-center font-semibold">{formatCurrency(prod.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* TOTALES */}
                                <div className="bg-gray-50 border-t border-gray-200 p-4 mt-auto">
                                    <div className="flex justify-end items-center gap-10 text-sm">
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
                    <PrimaryButton type="button" onClick={handleBack}>
                        <X size={18} className="inline-block mr-2" /> Volver
                    </PrimaryButton>
                </div>
            </div>

            {showPrintModal && (
                <ConfirmModal
                    type="info"
                    title="Imprimir pedido"
                    message={`¿Seguro que deseas imprimir el pedido #${order?.id}?`}
                    onConfirm={handleReport}
                    onCancel={() => setShowPrintModal(false)}
                />
            )}

            {/* ALERTA DE EXITO O ERROR */}
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