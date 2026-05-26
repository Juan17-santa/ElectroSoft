import { useState, useEffect } from "react";
import { useProviderForm } from "../hooks/useProviderForm";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import ProviderForm from "../components/ProvidersForm";
import { ServicesProviders } from "../services/ServicesProviders";

export default function CreateProvider() {
    const navigate = useNavigate();

    const [alert, setAlert] = useState(null);

    // Estados locales para guardar los datos que vienen asíncronos de la API
    const [documentTypes, setDocumentTypes] = useState([]);
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    // Disparamos la carga de datos de la base de datos al montar el componente
    useEffect(() => {
        const loadFormData = async () => {
            try {
                // 1. Usamos tu método getDocumentTypes()
                const docsData = await ServicesProviders.getDocumentTypes();
                setDocumentTypes(docsData);

                // 2. Usamos tu método getCategories() 
                const catsData = await ServicesProviders.getCategories();
                // Filtramos las categorías activas (validando por las llaves de tu backend en inglés/español)
                const activeCats = catsData.filter(cat => cat.status === true || cat.estado === true);
                setCategoriasActivas(activeCats);

            } catch (error) {
                console.error("Error al cargar datos iniciales del backend:", error);
            }
        };

        loadFormData();
    }, []);

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
                    categorias={categoriasActivas}    // 👈 Mandamos las categorías filtradas desde tu servicio
                    documentTypes={documentTypes}    // 👈 Mandamos los tipos de documento desde tu servicio
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