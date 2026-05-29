import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { ServicesProviders } from "../services/ServicesProviders";

export default function ProviderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    // EFECTO PARA CARGAR LA DATA REAL DEL PROVEEDOR
    useEffect(() => {
        const loadProviderDetails = async () => {
            try {
                setLoading(true);
                const data = await ServicesProviders.getById(id);
                if (data) {
                    setProvider(data);
                }
            } catch (error) {
                console.error("Error al cargar los detalles del proveedor:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProviderDetails();
        }
    }, [id]);

    const handleBack = () => {
        navigate("/dashboard/providers");
    };

    if (loading) {
        return (
            <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner h-full animate-pulse">
                <div className="bg-white rounded-3xl p-4 md:p-8 shadow-lg h-full flex flex-col gap-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-8 w-full max-w-3xl mx-auto flex flex-col gap-6">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center h-full shadow-inner gap-4">
                <p className="text-gray-500 text-sm font-medium">
                    No se encontró la información del proveedor.
                </p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50"
                >
                    Volver a la lista
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner h-full overflow-y-auto">
            <div
                className="relative bg-white rounded-3xl p-4 md:p-8 shadow-lg overflow-hidden h-full min-h-fit"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info size={22} />
                            <h2 className="text-md md:text-xl font-semibold">
                                Ver Información del proveedor
                            </h2>
                        </div>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-4 md:p-8 shadow-xl w-full max-w-3xl mx-auto">
                        <div className="flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <h3 className="text-sm font-bold uppercase text-gray-500">
                                    Información General
                                </h3>
                                <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md w-fit
                                    ${provider.status
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {provider.status ? "Activo" : "Inactivo"}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-4">
                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Documento</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.documentType?.abbreviation} - {provider.document}
                                    </p>
                                </div>

                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Proveedor</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.providerName}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6">
                                Información De Contacto
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-2">
                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.contactName}
                                    </p>
                                </div>

                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Teléfono Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.contactPhone}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6">
                                Categorías asociadas
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {provider.categoriesAssociated?.length > 0 ? (
                                    provider.categoriesAssociated.map((category, index) => (
                                        <span
                                            key={category._id || index}
                                            className="px-3 py-1.5 rounded-full bg-yellow-200 text-xs md:text-sm font-medium text-gray-800"
                                        >
                                            {category.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm font-semibold text-gray-800 italic">
                                        Sin categorías asociadas
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}