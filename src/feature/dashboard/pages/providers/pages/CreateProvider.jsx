import { useEffect, useState } from "react";
import { useProviderForm } from "../hooks/useProviderForm";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Alert from "../../../components/ui/alert";
import ProviderForm from "../components/ProvidersForm";

export default function CreateProvider() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // LISTA DE CATEGORÍAS CARGADAS DESDE LOCALSTORAGE
    const [categorias, setCategorias] = useState([]);

    // CONTROL DE APERTURA DEL DROPDOWN DE CATEGORÍAS
    const [open, setOpen] = useState(false);

    // ESTADO PARA LA ALERTA DE ÉXITO O ERROR
    const [alert, setAlert] = useState(null);

    // CARGAR CATEGORÍAS AL INICIAR EL COMPONENTE
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("productCategory")) || [];
        setCategorias(data);
    }, []);

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleToggleCategoria,
        handleSubmit
    } = useProviderForm({
        mode: "create",
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Proveedor creado correctamente"
            });
            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 2000);
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">

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

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categorias}
                    open={open}
                    setOpen={setOpen}
                    handleChange={handleChange}
                    handleToggleCategoria={handleToggleCategoria}
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