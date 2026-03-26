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

export default function Orders() {

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
        navigate("/dashboard/orders/detail", {
            state: { order },
        })
    };
    
    // FUNCION PARA ABRIR LA MODAL DE VENTA
    const handleOpenSaleConfirm = (order) => {
        setOrderToProcess(order);
        setIsSaleModalOpen(true);
    };
    
    // FUNCION PARA CONFIRMAR LA VENTA Y REDIRIGIR
    const handleConfirmSale = (order, diasPlazo) => {
        try {
            // EJECUTA LA LÓGICA DEL HOOK (GUARDAR EN VENTAS Y ELIMINAR DE PEDIDOS)
            processOrderToSale(order, diasPlazo);
            setIsSaleModalOpen(false);
            
            // MOSTRAR ALERTA DE EXITO
            setAlert({
                type: "success",
                message: "Venta procesada con éxito. Redirigiendo a facturación..."
            });
            
            // REDIRIGIR TRAS 2 SEGUNDOS PARA VER LA ALERTA
            setTimeout(() => {
                navigate("/dashboard/sales-management");
            }, 2000);
            
        } catch (error) {
            setAlert({
                type: "error",
                message: "No se pudo procesar la venta correctamente."
            });
        }
    };
    
    // ESTADO PARA CANCELAR UN PEDIDO
    const [orderToCancel, setOrderToCancel] = useState(null);
    
    // FUNCION PARA ANULAR UN PEDIDO Y DEVOLVER STOCK
    const handleCancelOrder = ({ motivo, fechaAnulacion }) => {
        if (!orderToCancel) return;

        try {
            // LLAMADO A LA FUNCIÓN DEL HOOK PARA ACTUALIZAR STOCK Y ESTADO
            cancelOrder(orderToCancel, motivo, fechaAnulacion);

            setOrderToCancel(null);

            // MOSTRAR ALERTA DE EXITO
            setAlert({
                type: "success",
                message: "El pedido fue anulado y los productos regresaron al stock."
            });

            // REDIRIGIR TRAS 2 SEGUNDOS PARA VER LA ALERTA
            setTimeout(() => {
                setAlert(null);
            }, 2000);
        } catch (error) {
            setAlert({
                type: "error",
                message: "No se pudo anular el pedido correctamente.."
            });
        }
    };
    
    // LOGICA DEL HOOK
    const {
        data,
        totalPages,
        cancelOrder,
        processOrderToSale
    } = useOrdersTable(
        search,
        presentPage,
        recordsPerPage
    );
    
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
                    createButtonText="Crear pedido"
                />

                {/* TABLA */}
                <OrdersTable
                    data={data}
                    onDetails={handleDetailsNavigation}
                    onCancel={(order) => setOrderToCancel(order)}
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
                        { label: "Pedido", value: orderToCancel.id },
                        { label: "Cliente", value: orderToCancel.nombreCliente || orderToCancel.cliente || "Sin nombre" },
                        { label: "Total", value: formatCurrency(orderToCancel.total) }
                    ]}
                    placeholder="Describe el motivo de la anulación del pedido..."
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