import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Info, X } from "lucide-react";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";

export default function ProviderDetails() {

    const navigate = useNavigate();
    const location = useLocation();

    const [provider, setProvider] = useState(null);
    const [categories, setCategories] = useState([]);

    const providerDetail = location.state?.provider;

    useEffect(() => {
        if (providerDetail) {
            setProvider(providerDetail);
        }

        const allCategories = ServiceProductCategory.get();
        setCategories(allCategories);
    }, [providerDetail]);

    if (!provider) {
        return (
            <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    const handleBack = () => {
        navigate("/dashboard/providers");
    };

    return (
        <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner h-full overflow-y-auto">

            <div
                className="relative bg-white rounded-3xl p-4 md:p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    {/* HEADER */}
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

                    {/* CARD */}
                    <div className="bg-white rounded-2xl p-4 md:p-8 shadow-xl w-full max-w-3xl mx-auto">

                        <div className="flex flex-col">

                            {/* INFO GENERAL */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <h3 className="text-sm font-bold uppercase text-gray-500">
                                    Información General
                                </h3>

                                <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md w-fit
                                    ${provider.estado
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {provider.estado ? "Activo" : "Inactivo"}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-4">
                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Documento</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.tipoDoc} - {provider.documento}
                                    </p>
                                </div>

                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Proveedor</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.nombreProveedor}
                                    </p>
                                </div>
                            </div>

                            {/* CONTACTO */}
                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6">
                                Información De Contacto
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-2">
                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.nombreContacto}
                                    </p>
                                </div>

                                <div className="w-full">
                                    <p className="text-sm text-yellow-400 mb-1">Teléfono Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                                        {provider.telefonoContacto}
                                    </p>
                                </div>
                            </div>

                            {/* CATEGORÍAS */}
                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6">
                                Categorías asociadas
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {provider.categoriasAsociadas?.length > 0 ? (
                                    provider.categoriasAsociadas.map((catId, index) => {
                                        const category = categories.find(c => c.id === catId);

                                        return (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 rounded-full bg-yellow-200 text-xs md:text-sm font-medium"
                                            >
                                                {category ? category.nombre : "Categoría no encontrada"}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm font-semibold text-gray-800">
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