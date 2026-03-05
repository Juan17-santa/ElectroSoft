import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrdersForm } from "../hooks/UseOrdersForm";
import Alert from "../../../components/ui/alert";
import OrdersForm from "../components/OrdersForm";
import { useState } from "react";
import ClientModal from "../components/ClientModal";

export default function CreateOrder() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA LA ALERTA DE ÉXITO O ERROR
    const [alert, setAlert] = useState(null);

    // ESTADO PARA LA MODAL
    const [showClientModal, setShowClientModal] = useState(false);

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
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

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/orders")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <OrdersForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    buttonText="Crear Pedido"
                    onCancel={() => navigate("/dashboard/orders")}
                    onOpenClientModal={() => setShowClientModal(true)}
                />
            </div>

            {/* MODAL */}
            {showClientModal && (
                <ClientModal
                    onClose={() => setShowClientModal(false)}
                    onSave={handleSaveClient}
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