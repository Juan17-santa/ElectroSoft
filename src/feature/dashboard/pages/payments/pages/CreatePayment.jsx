import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import Alert from "../../../components/ui/Alert";
import PaymentForm from "../components/PaymentForm";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { ArrowLeft } from "lucide-react";

export default function CreatePayment() {
    const navigate  = useNavigate();
    const { ventaId } = useParams();
    const location  = useLocation();
    const documento = location.state?.documento || null;
    const [alert, setAlert] = useState(null);

    const {
        formData,
        errors,
        handleChange,
        handleSelectVenta,
        handleSubmit,
        ventasDelDocumento,
    } = usePaymentForm({
        ventaIdPreseleccionada: ventaId,
        documentoPreseleccionado: documento,
        onSuccess: () => {
            setAlert({ type: "success", message: "Abono creado correctamente" });
            setTimeout(() => navigate(
                documento
                    ? `/dashboard/payments/client/${documento}`
                    : "/dashboard/payments"
            ), 2000);
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <p className="text-xl font-semibold">
                        Crear nuevo <span className="text-yellow-500">Abono</span>
                    </p>
                </div>

                <PaymentForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSelectVenta={handleSelectVenta}
                    handleSubmit={handleSubmit}
                    ventasDelDocumento={ventasDelDocumento}
                    onCancel={() => navigate(-1)}
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