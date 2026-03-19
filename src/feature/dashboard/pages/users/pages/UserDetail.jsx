import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X } from "lucide-react";

export default function UserDetail() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (location.state?.user) {
            setUser(location.state.user);
        }
    }, [location.state]);

    if (!user) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    const handleBack = () => {
        navigate("/dashboard/users");
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{ backgroundImage: 'url("/background-shopping.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl h-full"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    {/* Título */}
                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">
                            Ver Información del Usuario
                        </h2>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-16 shadow-xl max-w-4xl w-full mx-auto min-h-112.5">

                        {/* Estado */}
                        <div className="flex justify-between">
                            <h3 className="text-sm font-bold uppercase text-gray-500 py-2">
                                Información General
                            </h3>
                            
                            <div
                                className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md
                                ${user.estado
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >

                                {user.estado ? "Activo" : "Inactivo"}
                            </div>
                        </div>

                        {/* Datos */}
                        <div className="flex flex-col gap-5">

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Nombre</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {user.nombre}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Email</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {user.email}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Teléfono</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {user.telefono || "No registrado"}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Rol</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {user.rol || "Sin rol asignado"}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Botón */}
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