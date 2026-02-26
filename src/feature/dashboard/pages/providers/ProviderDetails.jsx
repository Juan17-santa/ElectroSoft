import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";
import { ServiceProductCategory } from "../productCategory/services/ServicesProductCategory";

export default function ProviderDetails() {
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const storedProvider = localStorage.getItem("providerToView");

        if (storedProvider) {
            setProvider(JSON.parse(storedProvider));
        }

        const allCategories = ServiceProductCategory.get();
        setCategories(allCategories);

    }, []);

    if (!provider) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    console.log("Categories:", categories);
    console.log("Provider categorias:", provider.categoriasAsociadas);

    const handleBack = () => {
        localStorage.removeItem("providerToView"); // Limpiamos el rastrooo
        navigate("/dashboard/providers"); // Volvemos a la lista
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden min-h-120"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">
                            Ver Información del proveedor
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl w-full mx-auto">

                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-bold uppercase text-gray-500 py-2">
                                    Información General
                                </h3>
                                <div className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md
                                    ${provider.estado
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {provider.estado ? "Activo" : "Inactivo"}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-10">
                                <div className="min-w-72">
                                    <p className="text-sm text-yellow-400 mb-1">Documento</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {provider.tipoDoc} - {provider.documento}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Proveedor</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {provider.nombreProveedor}
                                    </p>
                                </div>

                            </div>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6 py-2">
                                Información De Contacto
                            </h3>
                            <div className="flex flex-wrap gap-10">
                                <div className="min-w-80">
                                    <p className="text-sm text-yellow-400 mb-1">Nombre Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {provider.nombreContacto}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">telefono Contacto</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {provider.telefonoContacto}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mt-6 py-2">
                                Categorias asociadas
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {provider.categoriasAsociadas?.length > 0 ? (
                                    provider.categoriasAsociadas.map((catId, index) => {
                                        const category = categories.find(c => c.id === catId);

                                        return (
                                            <span
                                                key={index}
                                                className="px-4 py-1.5 rounded-full bg-yellow-200 text-sm font-medium"
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
            <div className="flex justify-end">
                <button
                    onClick={handleBack}
                    className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <X size={18} className="inline-block mr-2" />
                    Volver
                </button>
            </div>


        </div>
    );
}