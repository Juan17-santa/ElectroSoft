import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProviderForm } from "../hooks/useProviderForm";
import { X } from "lucide-react";
import ProviderForm from "../components/ProvidersForm";
import { ServicesProviders } from "../services/ServicesProviders";
import { useToast } from "../../../../../context/ToastContext";

export default function UpdateProvider() {
    // CAPTURA DE PARÁMETROS Y NAVEGACIÓN
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // ESTADOS LOCALES PARA LA DATA DE LOS SELECTS Y CONTROL
    const [documentTypes, setDocumentTypes] = useState([]);
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    // INSTANCIAMOS EL HOOK DIRECTAMENTE AL INICIO
    const {
        formData,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        setCategoriasAsociadas,
        setFormData,
        loading,
        isNatural,
        isJuridica
    } = useProviderForm({
        mode: "update",
        initialData: {},
        documentTypes,
        onSuccess: () => {
            showToast("success", "Proveedor actualizado con éxito.");
            setTimeout(() => navigate("/dashboard/providers"), 2000);
        },
        onError: (message) => {
            showToast("error", message);
        }
    });

    useEffect(() => {
        const loadUpdateData = async () => {
            try {
                const [docsData, catsData, provider] = await Promise.all([
                    ServicesProviders.getDocumentTypes(),
                    ServicesProviders.getCategories(),
                    ServicesProviders.getById(id)
                ]);

                setDocumentTypes(docsData);
                setCategoriasActivas(catsData.filter(cat => cat.status === true || cat.estado === true));

                if (provider && setFormData) {
                    setFormData({
                        _id: provider._id,
                        providerType: provider.providerType || "NATURAL",
                        documentType: provider.documentType?._id || provider.documentType || "",
                        document: provider.document || "",
                        providerName: provider.providerName || "",
                        contactName: provider.contactName || "",
                        providerPhone: provider.providerPhone || "",
                        providerEmail: provider.providerEmail || "",
                        address: provider.address || "",
                        contactEmail: provider.contactEmail || "",
                        contactPhone: provider.contactPhone || "",
                        categoriesAssociated: provider.categoriesAssociated?.map(cat => cat._id || cat) || [],
                        status: provider.status
                    });
                } else if (!provider) {
                    showToast("error", "No se encontró el proveedor.");
                }
            } catch (error) {
                console.error("Error al cargar los datos de edición:", error);
                showToast("error", "Error al conectar con el servidor.");
            }
        };

        if (id) loadUpdateData();
    }, [id, setFormData, showToast]);

    return (
        <>
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 shadow-inner h-full overflow-y-auto">

                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">Editar proveedor</p>
                        <p className="text-xs sm:text-sm text-gray-600">Modifique los campos necesarios del proveedor</p>
                    </div>

                    <button
                        type="button"
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
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/providers")}
                    buttonText="Actualizar proveedor"
                    isNatural={isNatural}
                    isJuridica={isJuridica}
                    loading={loading}
                />
            </div>
        </>
    );
}