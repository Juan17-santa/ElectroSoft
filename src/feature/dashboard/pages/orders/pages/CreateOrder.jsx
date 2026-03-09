import { useNavigate } from "react-router-dom";
import { useOrdersForm } from "../hooks/UseOrdersForm";
import { useState } from "react";
import Alert from "../../../components/ui/alert";
import OrdersForm from "../components/OrdersForm";
import ClientModal from "../components/ClientModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";

export default function CreateOrder() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA LA ALERTA DE ÉXITO O ERROR
    const [alert, setAlert] = useState(null);

    // ESTADO PARA LA MODAL DE CREAR CLIENTE
    const [showClientModal, setShowClientModal] = useState(false);

    // ESTADO PARA LA MODAL DE CANCELAR
    const [showCancelModal, setShowCancelModal] = useState(false);

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        products,
        addProduct,
        currentProducts = { currentProducts },
        currentPage = { currentPage },
        setCurrentPage = { setCurrentPage },
        totalPages = { totalPages },
        indexOfFirstItem = { indexOfFirstItem },
        itemsPerPage = { itemsPerPage },
    } = useOrdersForm({
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Pedido creado correctamente"
            });
            setTimeout(() => {
                navigate("/dashboard/orders");
            }, 2000);
        }
    });

    // CUANDO SE GUARDA NUEVO CLIENTE
    const handleSaveClient = (nuevoCliente) => {

        const clientes = JSON.parse(localStorage.getItem("clients")) || [];
        const nuevosClientes = [...clientes, nuevoCliente];

        localStorage.setItem("clients", JSON.stringify(nuevosClientes));
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">

                {/* HEADER DE LA PÁGINA */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">
                            Crear nuevo pedido
                        </p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <OrdersForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    buttonText="Crear Pedido"
                    onCancel={() => setShowCancelModal(true)}
                    onOpenClientModal={() => setShowClientModal(true)}
                    products={products}
                    addProduct={addProduct}
                    currentProducts={currentProducts}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    indexOfFirstItem={indexOfFirstItem}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* MODAL PARA CREAR CLIENTE */}
            {showClientModal && (
                <ClientModal
                    onClose={() => setShowClientModal(false)}
                    onSave={handleSaveClient}
                />
            )}

            {/* ALERTA EXITO O ERROR*/}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* MODAL PARA CANCELAR PEDIDO */}
            {showCancelModal && (
                <ConfirmModal
                    type="info"
                    title="Cancelar pedido"
                    message="¿Seguro que deseas cancelar este pedido? Se perderán todos los cambios realizados."
                    onConfirm={() => navigate("/dashboard/orders")}
                    onCancel={() => setShowCancelModal(false)}
                />
            )}
        </>
    )
}