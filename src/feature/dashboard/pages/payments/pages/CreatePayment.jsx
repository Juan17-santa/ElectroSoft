import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PaymentForm from "../components/PaymentForm";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { ArrowLeft, X } from "lucide-react";
import { useToast } from "../../../../../context/ToastContext";

export default function CreatePayment() {
    const navigate = useNavigate();
    const { ventaId } = useParams();
    const location = useLocation();
    const documento = location.state?.documento || null;
    const { showToast } = useToast();

    const {
        formData,
        errors,
        formError,
        setFormError,
        handleChange,
        handleSelectVenta,
        handleSubmit,
        ventasDelDocumento,
        isSubmitting,
    } = usePaymentForm({
        ventaIdPreseleccionada: ventaId,
        documentoPreseleccionado: documento,
        onSuccess: () => {
            showToast("success", "Abono creado correctamente");
            setTimeout(() => navigate(
                documento
                    ? `/dashboard/payments/client/${documento}`
                    : "/dashboard/payments"
            ), 2000);
        }
    });

    useEffect(() => {
        if (formError) {
            showToast("error", formError);
            setFormError("");
        }
    }, [formError, showToast, setFormError]);

    return (
        <>
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <p className="text-xl font-semibold">Crear nuevo <span className="text-yellow-400">abono</span></p>
                            <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <PaymentForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSelectVenta={handleSelectVenta}
                    handleSubmit={handleSubmit}
                    ventasDelDocumento={ventasDelDocumento}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate(-1)}
                />
            </div>
        </>
    );
}