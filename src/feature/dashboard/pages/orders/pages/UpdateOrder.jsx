import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import OrdersForm from "../components/OrdersForm";
import { useOrdersForm } from "../hooks/UseOrdersForm";
import { ServicesOrders } from "../services/ServicesOrders";
import { useToast } from "../../../../../context/ToastContext";

export default function UpdateOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    const {
        formData, errors, handleChange, handleSubmit,
        products, clients, addProduct, handleQuantityChange, handleQuantityBlur,
        currentProducts, currentPage, setCurrentPage, totalPages, indexOfFirstItem,
        itemsPerPage, paymentOptions, loading, submitted, showSummaryModal,
        setShowSummaryModal, requestedCredit, setRequestedCredit,
        handleOpenSummary, isSearchingClient
    } = useOrdersForm({
        mode: "update",
        initialData: order,
        onSuccess: () => {
            showToast("success", "Pedido actualizado con éxito.");
            setTimeout(() => navigate("/dashboard/orders"), 1500);
        },
        onShowAlert: (message) => showToast("error", message)
    });

    useEffect(() => {
        let mounted = true;
        ServicesOrders.getOrderById(id)
            .then(data => mounted && setOrder(data))
            .catch(error => mounted && showToast("error", error.message || "No se pudo cargar el pedido."))
            .finally(() => mounted && setLoadingOrder(false));
        return () => { mounted = false; };
    }, [id, showToast]);

    if (loadingOrder || !order) {
        return (
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-125">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Cargando datos del pedido...</p>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-lg sm:text-xl font-semibold mb-1">Editar pedido</p>
                    <p className="text-xs sm:text-sm text-gray-600">Modifique los campos necesarios del pedido</p>
                </div>
                <button type="button" onClick={() => navigate("/dashboard/orders")} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer" title="Cerrar">
                    <X size={20} />
                </button>
            </div>
            <OrdersForm
                formData={formData} errors={errors} handleChange={handleChange}
                handleSubmit={handleOpenSummary} onConfirmOrder={handleSubmit}
                buttonText="Guardar cambios" onCancel={() => navigate("/dashboard/orders")}
                showCreateClient={false} isEdit products={products} clients={clients}
                addProduct={addProduct} handleQuantityChange={handleQuantityChange}
                handleQuantityBlur={handleQuantityBlur} currentProducts={currentProducts}
                currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
                indexOfFirstItem={indexOfFirstItem} itemsPerPage={itemsPerPage}
                paymentOptions={paymentOptions} loading={loading} submitted={submitted}
                showSummaryModal={showSummaryModal} setShowSummaryModal={setShowSummaryModal}
                requestedCredit={requestedCredit} setRequestedCredit={setRequestedCredit}
                isSearchingClient={isSearchingClient}
            />
        </div>
    );
}
