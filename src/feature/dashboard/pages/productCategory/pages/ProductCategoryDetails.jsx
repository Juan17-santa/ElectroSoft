import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";
import { useLocation } from "react-router-dom";

// COMPONENTE PARA MOSTRAR EL DETALLE DE UNA CATEGORIA
export default function ProductCategoryDetails() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA LA CATEGORIA A MOSTRAR
    const [categoria, setCategoria] = useState(null);

    // ESTADO PARA RECIBIR LA CATEGORIA A MOSTRAR DESDE EL INDEX
    const location = useLocation();
    const categoryDetail = location.state?.category;

    useEffect(() => {
        if (categoryDetail) {
            setCategoria(categoryDetail);
        }
    }, [categoryDetail]);

    // SI NO HAY CATEGORIA SE MUESTRA UN MENSAJE
    if (!categoria) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    // FUNCION PARA VOLVER A LA LISTA DE CATEGORIAS
    const handleBack = () => {
        navigate("/dashboard/productCategory");
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">
                            Ver Información de Categoría
                        </h2>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 shadow-md max-w-2xl w-full mx-auto">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-bold uppercase text-gray-500 py-2">
                                    Información General
                                </h3>
                                <div className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md
                                    ${categoria.estado
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {categoria.estado ? "Activo" : "Inactivo"}
                                </div>
                            </div>

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