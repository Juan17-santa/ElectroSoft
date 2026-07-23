import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProviderForm } from "../hooks/useProviderForm";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import ProviderForm from "../components/ProvidersForm";
import { ServicesProviders } from "../services/ServicesProviders";

export default function UpdateProvider() {
    // CAPTURA DE PARÁMETROS Y NAVEGACIÓN
    const { id } = useParams();
    const navigate = useNavigate();

    // ESTADOS LOCALES PARA LA DATA DE LOS SELECTS Y CONTROL
    const [alert, setAlert] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [categoriasActivas, setCategoriasActivas] = useState([]);
    const [loading, setLoading] = useState(true);

    // INSTANCIAMOS EL HOOK DIRECTAMENTE AL INICIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setCategoriasAsociadas,
        setFormData,
        isNatural,
        isJuridica
    } = useProviderForm({
        mode: "update",
        initialData: {},
        onSuccess: () => {
            setAlert({ type: "success", message: "Proveedor actualizado con éxito." });
            setTimeout(() => navigate("/dashboard/providers"), 2000);
        },
        onError: (message) => {
            setAlert({
                type: "error",
                message
            });
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
                        contactPhone: provider.contactPhone || "",
                        email: provider.email || "",
                        address: provider.address || "",
                        categoriesAssociated: provider.categoriesAssociated?.map(cat => cat._id || cat) || [],
                        status: provider.status
                    });
                } else if (!provider) {
                    setAlert({ type: "error", message: "No se encontró el proveedor." });
                }
            } catch (error) {
                console.error("Error al cargar los datos de edición:", error);
                setAlert({ type: "error", message: "Error al conectar con el servidor." });
            } finally {
                setLoading(false);
            }
        };

        if (id) loadUpdateData();
    }, [id, setFormData]);

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

                {loading ? (
                    <div className="animate-pulse flex flex-col gap-10 mt-6 px-4 md:px-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                    <div className="h-12 bg-gray-300 rounded-xl w-full"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-auto">
                            <div className="h-10 bg-gray-300 rounded-xl w-28"></div>
                            <div className="h-10 bg-gray-300 rounded-xl w-36"></div>
                        </div>
                    </div>
                ) : (
                    <ProviderForm
                        formData={formData}
                        errors={errors}
                        categorias={categoriasActivas}
                        documentTypes={documentTypes}
                        handleChange={handleChange}
                        setCategoriasAsociadas={setCategoriasAsociadas}
                        handleSubmit={handleSubmit}
                        onCancel={() => navigate("/dashboard/providers")}
                        buttonText="Actualizar proveedor"
                        isNatural={isNatural}
                        isJuridica={isJuridica}
                    />
                )}
            </div>

            {/* ALERTAS */}
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