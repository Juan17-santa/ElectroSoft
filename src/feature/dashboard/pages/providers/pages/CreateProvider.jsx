import { useEffect, useState } from "react";
import { useProviderForm } from "../hooks/useProviderForm";
import { useNavigate } from "react-router-dom";
// import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import ProviderForm from "../components/ProvidersForm";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";

export default function CreateProvider() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // CONTROL DE APERTURA DEL DROPDOWN DE CATEGORÍAS
    const [open, setOpen] = useState(false);

    // ESTADO PARA LA ALERTA DE ÉXITO O ERROR
    const [alert, setAlert] = useState(null);

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
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

    // ... dentro del componente CreateProvider
    const todasLasCategorias = ServiceProductCategory.get(); // Traes todas
    const categoriasActivas = todasLasCategorias.filter(cat => cat.estado === true);

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner h-full">

                {/* HEADER DE LA PÁGINA */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">
                            Crear nuevo proveedor
                        </p>
                        <p className="text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>
                    {/* <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button> */}
                </div>

                {/* FORMULARIO */}
                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categoriasActivas}
                    open={open}
                    setOpen={setOpen}
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