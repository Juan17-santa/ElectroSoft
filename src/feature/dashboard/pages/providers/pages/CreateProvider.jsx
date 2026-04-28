import { useState } from "react";
import { useProviderForm } from "../hooks/useProviderForm";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import ProviderForm from "../components/ProvidersForm";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";

export default function CreateProvider() {
    const navigate = useNavigate();

    const [alert, setAlert] = useState(null);

    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setCategoriasAsociadas,
    } = useProviderForm({
        mode: "create",
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Proveedor registrado con éxito."
            });

            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 2000);
        }
    });

    const categoriasActivas = ServiceProductCategory
        .get()
        .filter(cat => cat.estado === true);

    return (
        <>
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 shadow-inner h-full overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">
                            Nuevo proveedor
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>

                    {/* BOTÓN X */}
                    <button
                        onClick={() => navigate("/dashboard/providers")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}
                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categoriasActivas}
                    handleChange={handleChange}
                    setCategoriasAsociadas={setCategoriasAsociadas}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/providers")}
                    buttonText="Crear proveedor"
                />
            </div>

            {/* ALERTA */}
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