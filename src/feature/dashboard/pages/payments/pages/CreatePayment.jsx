import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Alert from "../../../components/ui/alert";
import PaymentForm from "../components/PaymentForm";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { seedPayments } from "../hooks/seedPayments";

export default function CreatePayment() {

    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    // ⚠️ SOLO PRUEBAS — controla que el seed corra ANTES que el hook cargue
    const [seeded, setSeeded] = useState(false);

    useEffect(() => {
        seedPayments();
        setSeeded(true); // solo después del seed renderiza el formulario
    }, []);

    const {
        formData,
        errors,
        handleChange,
        handleSelectVenta,
        handleSubmit,
        ventasDelDocumento,
    } = usePaymentForm({
        onSuccess: () => {
            setAlert({ type: "success", message: "Abono creado correctamente" });
            setTimeout(() => navigate("/dashboard/payments"), 2000);
        }
    });

    // ⚠️ SOLO PRUEBAS — espera a que el seed termine antes de renderizar
    if (!seeded) return null;

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">
                            Crear nuevo <span className="text-yellow-500">Abono</span>
                        </p>
                    </div>
                </div>

                <PaymentForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSelectVenta={handleSelectVenta}
                    handleSubmit={handleSubmit}
                    ventasDelDocumento={ventasDelDocumento}
                    onCancel={() => navigate("/dashboard/payments")}
                />
            </div>

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