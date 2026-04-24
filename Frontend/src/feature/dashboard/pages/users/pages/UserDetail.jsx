import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";

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

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    {/* TÍTULO */}
                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">
                            Ver información del usuario
                        </h2>
                    </div>

                    {/* CARD */}
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6 shadow-md max-w-3xl w-full mx-auto">

                        <div className="flex flex-col gap-6">

                            {/* ESTADO */}
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold uppercase text-gray-500 py-2">
                                    Información general
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

                            {/* DATOS EN GRID */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Nombre</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.nombre || "No registrado"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Email</p>
                                    <p className="text-sm font-semibold text-gray-800 break-all">
                                        {user.email || "No registrado"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Teléfono</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.telefono || "No registrado"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Tipo documento</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.tipoDoc || "No registrado"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Documento</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.documento || "No registrado"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Rol</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user.rol || "Sin rol asignado"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÓN VOLVER */}
            <div className="flex justify-end">
                <PrimaryButton type="button" onClick={() => navigate("/dashboard/users")}>
                    <X size={18} className="inline-block mr-2" />
                    Volver
                </PrimaryButton>
            </div>

        </div>
    );
}