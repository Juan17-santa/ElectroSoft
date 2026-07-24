import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, User, Building2, Mail, MapPin, Phone, FileText, IdCard } from "lucide-react";
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
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm animate-pulse">
                    Cargando detalles del proveedor...
                </p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center h-full shadow-inner gap-4">
                <p className="text-gray-500 text-sm font-medium mb-6">
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

    const isNatural = provider.providerType === "NATURAL";

    // Pequeño helper para no repetir el markup de cada dato
    const Field = ({ icon: Icon, label, value }) => (
        <div className="w-full">
            <p className="text-sm text-yellow-400 mb-1 flex items-center gap-1.5">
                <Icon size={14} />
                {label}
            </p>
            <p className="text-sm font-semibold text-gray-800 wrap-break-words">
                {value || "—"}
            </p>
        </div>
    );

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
                <div className="absolute inset-0 bg-white/40 rounded-3xl"></div>

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
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto overflow-hidden">

                        {/* CABECERA: tipo de proveedor + nombre + estado */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 md:px-8 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                    {isNatural
                                        ? <User size={20} className="text-yellow-500" />
                                        : <Building2 size={20} className="text-yellow-500" />
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        {isNatural ? "Persona Natural" : "Persona Jurídica"}
                                    </p>
                                    <h3 className="text-base md:text-lg font-bold text-gray-800 truncate">
                                        {provider.providerName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {isNatural
                                            ? `${provider.documentType?.abbreviation} ${provider.document}`
                                            : `NIT ${provider.document}`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-md w-fit shrink-0
                                ${provider.status
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                            >
                                {provider.status ? "Activo" : "Inactivo"}
                            </div>
                        </div>

                        {/* CUERPO */}
                        <div className="p-4 md:p-8 flex flex-col gap-6">

                            {/* INFORMACIÓN GENERAL */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                                    Información General
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                    {isNatural ? (
                                        <>
                                            <Field
                                                icon={FileText}
                                                label="Documento"
                                                value={`${provider.documentType?.abbreviation} - ${provider.document}`}
                                            />
                                            <Field
                                                icon={IdCard}
                                                label="Tipo de documento"
                                                value={provider.documentType?.name}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Field
                                                icon={FileText}
                                                label="NIT"
                                                value={provider.document}
                                            />
                                            <Field
                                                icon={Mail}
                                                label="Correo de la empresa"
                                                value={provider.providerEmail}
                                            />
                                            <Field
                                                icon={Phone}
                                                label="Teléfono de la empresa"
                                                value={provider.providerPhone}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* INFORMACIÓN DE CONTACTO */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                                    Información De Contacto
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                    <Field
                                        icon={User}
                                        label={isNatural ? "Proveedor" : "Nombre Contacto"}
                                        value={isNatural ? provider.providerName : provider.contactName}
                                    />
                                    <Field
                                        icon={Phone}
                                        label={isNatural ? "Teléfono" : "Teléfono contacto"}
                                        value={isNatural ? provider.providerPhone : provider.contactPhone}
                                    />
                                    <Field
                                        icon={Mail}
                                        label={isNatural ? "Correo electrónico" : "Correo contacto"}
                                        value={isNatural ? provider.providerEmail : provider.contactEmail}
                                    />
                                    <Field
                                        icon={MapPin}
                                        label="Dirección"
                                        value={provider.address}
                                    />
                                </div>
                            </div>

                            {/* CATEGORÍAS ASOCIADAS */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">
                                    Categorías asociadas
                                </h3>
                                <div className="flex flex-wrap gap-2">
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
        </div>
    );
}