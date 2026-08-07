import { useState, useEffect } from "react";
import { useProviderForm } from "../hooks/useProviderForm";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ProviderForm from "../components/ProvidersForm";
import { ServicesProviders } from "../services/ServicesProviders";
import { useToast } from "../../../../../context/ToastContext";

export default function CreateProvider() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [documentTypes, setDocumentTypes] = useState([]);
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const docsData = await ServicesProviders.getDocumentTypes();
                setDocumentTypes(docsData);

                const catsData = await ServicesProviders.getCategories();
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
        handleBlur,
        handleSubmit,
        setCategoriasAsociadas,
        loading,
        isNatural,
        isJuridica
    } = useProviderForm({
        mode: "create",
        documentTypes,
        onSuccess: () => {
            showToast("success", "Proveedor registrado con éxito.");

            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 2000);
        },
        onError: (message) => {
            showToast("error", message);
        },
    });

    return (
        <>
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 shadow-inner h-full overflow-y-auto">

                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">
                            Nuevo proveedor
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard/providers")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categoriasActivas}
                    documentTypes={documentTypes}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    setCategoriasAsociadas={setCategoriasAsociadas}
                    loading={loading}
                    isNatural={isNatural}
                    isJuridica={isJuridica}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/providers")}
                    buttonText="Crear proveedor"
                />
            </div>
        </>
    );
}