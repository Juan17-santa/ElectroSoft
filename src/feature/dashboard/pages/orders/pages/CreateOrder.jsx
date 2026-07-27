import { useNavigate } from "react-router-dom";
import { useOrdersForm } from "../hooks/UseOrdersForm";
import { useState } from "react";
import Alert from "../../../components/ui/Alert";
import OrdersForm from "../components/OrdersForm";
import ClientModal from "../components/ClientModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { X } from "lucide-react";

export default function CreateOrder() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA MOSTRAR LAS ALERTAS DE ÉXITO O ERROR
    const [alert, setAlert] = useState(null);

    // ESTADO PARA CONTROLAR LA VISIBILIDAD DE LA MODAL DE NUEVO CLIENTE
    const [showClientModal, setShowClientModal] = useState(false);

    // ESTADO PARA CONTROLAR LA VISIBILIDAD DE LA MODAL PARA CANCELAR UN PEDIDO
    const [showCancelModal, setShowCancelModal] = useState(false);

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData,
        products,
        clients,
        addProduct,
        handleQuantityChange,
        handleQuantityBlur,
        currentProducts,
        currentPage,
        setCurrentPage,
        totalPages,
        indexOfFirstItem,
        itemsPerPage,
        paymentOptions
    } = useOrdersForm({
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Pedido registrado con éxito."
            });
            setTimeout(() => {
                navigate("/dashboard/orders");
            }, 2000);
        },
        onShowAlert: (msg) => setAlert({ type: "error", message: msg })
    });

    // FUNCIÓN PARA GUARDAR UN NUEVO CLIENTE DESDE LA MODAL
    const handleSaveClient = (clienteCreado) => {

        // ACTUALIZAR EL CAMPO DE CLIENTE EN EL FORMULARIO CON EL NUEVO CLIENTE CREADO
        setFormData(prev => ({
            ...prev,
            documento: clienteCreado.documento,
            clienteId: clienteCreado.id,
            clienteNombre: `${clienteCreado.nombres} ${clienteCreado.apellidos}`,
            clienteTipoDocumento: clienteCreado.tipoDocumento,
            clienteTotalCompras: 0
        }));

        setAlert({
            type: "success",
            message: "Cliente creado exitosamente"
        });

        // CERRAR LA MODAL DE NUEVO CLIENTE
        setShowClientModal(false);
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">

                {/* HEADER DE LA PÁGINA */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">
                            Nuevo pedido
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>

                    {/* BOTÓN X */}
                    <button
                        onClick={() => navigate("/dashboard/orders")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO: SE LE PASAN TODAS LAS PROPS DEL HOOK */}
                <OrdersForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    buttonText="Crear Pedido"
                    onCancel={() => setShowCancelModal(true)}
                    onOpenClientModal={() => setShowClientModal(true)}
                    products={products}
                    clients={clients}
                    addProduct={addProduct}
                    handleQuantityChange={handleQuantityChange}
                    handleQuantityBlur={handleQuantityBlur}
                    currentProducts={currentProducts}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    indexOfFirstItem={indexOfFirstItem}
                    itemsPerPage={itemsPerPage}
                    paymentOptions={paymentOptions}
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