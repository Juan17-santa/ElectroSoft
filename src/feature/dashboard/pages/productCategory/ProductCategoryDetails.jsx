import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";

export default function ProductCategoryDetails() {
    const navigate = useNavigate();
    const [categoria, setCategoria] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem("categoryToView");

        if (stored) {
            setCategoria(JSON.parse(stored));
        }
    }, []);

    if (!categoria) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    const handleBack = () => {
        localStorage.removeItem("categoryToView"); // 🔥 limpiamos
        navigate("/dashboard/product-category");
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden min-h-125"
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
                            Ver Información de Categoría
                        </h2>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 shadow-md">

                        <div className="flex flex-col gap-6">

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Nombre</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {categoria.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Descripción</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {categoria.descripcion || "Sin descripción"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-yellow-400 mb-1">Estado</p>
                                <span
                                    className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${categoria.estado === true
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}
                                >
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {categoria.estado ? "Activo" : "Inactivo"}
                                </span>
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
                    <X size={18} className="inline-block mr-2"/>
                    Volver
                </button>
            </div>


        </div>
    );
}