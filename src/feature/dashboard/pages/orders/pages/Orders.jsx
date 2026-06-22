import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useOrdersTable } from "../hooks/UseOrdersTable";
import SearchBar from "../../../components/ui/Searchbar";
import OrdersTable from "../components/OrdersTable";
import Pagination from "../../../components/ui/Pagination"
import Alert from "../../../components/ui/Alert";
import CancellationModal from "../../../components/ui/CancellationModal";
import ConfirmSaleModal from "../components/ConfirmSaleModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useOrdersReport } from "../hooks/useOrdersReport";
import { usePermissions } from "../../../../../hooks/usePermissions";

export default function Orders() {
    const { hasPermission } = usePermissions();

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO DEL BUSCADOR
    const [search, setSearch] = useState("");

    // ESTADO PARA PROCESAR VENTA
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [orderToProcess, setOrderToProcess] = useState(null);

    // FUNCION PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // ESTADO ALERTA
    const [alert, setAlert] = useState(null);

    // MODAL DEL GENERAR REPORTE
    const [showReportModal, setShowReportModal] = useState(false);

    // FUNCIÓN AUXILIAR PARA COMPATIBILIZAR EL COUPLING CON EL HOOK
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const {
        data,
        totalPages,
        cancelOrder,
        processOrderToSale,
        loading
    } = useOrdersTable(
        search,
        presentPage,
        recordsPerPage,
        showAlert
    );

    // ESTADO PARA CANCELAR UN PEDIDO
    const [orderToCancel, setOrderToCancel] = useState(null);

    // FUNCIÓN PARA FORMATEAR NÚMEROS A MONEDA COLOMBIANA
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // FUNCION PARA PREPARAR LA VISTA DE DETALLES
    const handleDetailsNavigation = (order) => {
        navigate(`/dashboard/orders/detail/${order._id}`)
    }

    // FUNCION PARA ABRIR LA MODAL DE VENTA
    const handleOpenSaleConfirm = (order) => {
        setOrderToProcess(order);
        setIsSaleModalOpen(true);
    };

    // FUNCION PARA CONFIRMAR LA VENTA Y REDIRIGIR
    const handleConfirmSale = async (order) => {
        try {
            await processOrderToSale(order._id);
            setIsSaleModalOpen(false);
            setAlert({ type: "success", message: "Pedido procesado como venta con éxito. Redirigiendo a ventas"});

            setTimeout(() => {
                navigate("/dashboard/sales-management");
            }, 1500);

        } catch (error) {

            setAlert({
                type: "error",
                message: error.message
            });

        }
    };

    // FUNCION ASINCRÓNICA PARA ANULAR UN PEDIDO Y ACTUALIZAR LA BASE DE DATOS
    const handleCancelOrder = async ({ motivo }) => {
        if (!orderToCancel) return;

        try {
            await cancelOrder(orderToCancel._id, motivo);

            setOrderToCancel(null);

            setAlert({
                type: "success",
                message: "Pedido anulado con éxito."
            });

            setTimeout(() => {
                setAlert(null);
            }, 3000);
        } catch (error) {
            setOrderToCancel(null);
        }
    };

    const { exportReport } = useOrdersReport(data, setAlert);

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de pedidos</p>

                {/* BARRA DE BÚSQUEDA Y ACCIONES PRINCIPALES */}
                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar pedidos..."
                    showReportButton={true}
                    onReportClick={() => setShowReportModal(true)}
                    onCreateClick={() => navigate("/dashboard/orders/create")}
                    createButtonText="Nuevo pedido"
                    showCreateButton={hasPermission("Pedidos", "Crear")}
                />

                {/* TABLA */}
                <OrdersTable
                    data={data}
                    loading={loading}
                    currentPage={presentPage}
                    recordsPerPage={recordsPerPage}
                    onDetails={handleDetailsNavigation}
                    onCancel={(order, idVisual) => setOrderToCancel({ ...order, idVisual })}
                    onProcess={handleOpenSaleConfirm}
                />

                {/* PAGINACION */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>
            </div>

            {/* MODAL PARA PROCESAR EL PEDIDO COMO UNA VENTA FINAL */}
            <ConfirmSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                order={orderToProcess}
                onConfirm={handleConfirmSale}
            />

            {/* MODAL DE CONFIRMACION PARA CANCELAR UN PEDIDO */}
            {orderToCancel && (
                <CancellationModal
                    title="Anular pedido"
                    infoData={[
                        { label: "Pedido ID", value: orderToCancel.idVisual || orderToCancel._id.slice(-6) },
                        {
                            label: "Cliente",
                            value: orderToCancel.client?.firstName
                                ? `${orderToCancel.client.firstName} ${orderToCancel.client.lastName || ""}`.trim()
                                : "Sin nombre"
                        },
                        { label: "Total", value: formatCurrency(orderToCancel.total) }
                    ]}
                    placeholder="Describe el motivo de la anulación del pedido... (Mínimo 20 caracteres)"
                    onConfirm={handleCancelOrder}
                    onCancel={() => setOrderToCancel(null)}
                />
            )}

            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte de pedidos"
                    message="Selecciona el rango de fechas para exportar el reporte"
                    showDateFilter={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ fechaInicio, fechaFin }) => {
                        exportReport(fechaInicio, fechaFin);
                        setShowReportModal(false);
                    }}
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
    )
}