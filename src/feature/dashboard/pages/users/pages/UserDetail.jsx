import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, ArrowLeft } from "lucide-react";

function InfoCard({ title, value }) {
    return (
        <div className="flex flex-col gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">{title}</p>
            <p className="text-sm font-semibold text-gray-800 break-all">
                {value || "No registrado"}
            </p>
        </div>
    );
}

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
                <p className="text-gray-500 text-sm">No hay información para mostrar.</p>
            </div>
        );
    }

    const nombre = user.nombre || "Usuario";
    const avatar = user.avatar || null;

    return (
        <div
            className="p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative overflow-auto"
            style={{
                backgroundImage: 'url("/background-details.jpg")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Capa de transparencia */}
            <div className="absolute inset-0 bg-white/20 pointer-events-none" />

            {/* TÍTULO */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Info size={22} className="text-gray-800" />
                    <h2 className="text-xl font-semibold text-gray-800">
                        Ver información del usuario
                    </h2>
                </div>
                <button
                    onClick={() => navigate("/dashboard/users")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200
                    hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>
            </div>

            {/* CARD PRINCIPAL */}
            <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">

                {/* HEADER */}
                <div className="border-b border-gray-200 pb-5 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="avatar"
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-300 shadow-md"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-amber-100 ring-2 ring-amber-300
                                    flex items-center justify-center text-amber-500 font-bold text-2xl shadow-md">
                                    {nombre.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 break-all">
                                    {nombre}
                                </h3>
                                <p className="text-gray-500 mt-1 text-sm">{user.email}</p>
                            </div>
                        </div>

                        <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm w-fit
                            ${user.estado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                        >
                            {user.estado ? "ACTIVO" : "INACTIVO"}
                        </span>
                    </div>
                </div>

                {/* INFORMACIÓN GENERAL */}
                <h4 className="text-sm font-bold text-gray-600 mb-3 tracking-wide uppercase">
                    Información general
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoCard title="Nombre" value={user.nombre} />
                    <InfoCard title="Email" value={user.email} />
                    <InfoCard title="Teléfono" value={user.telefono} />
                    <InfoCard title="Tipo documento" value={user.tipoDocLabel || user.tipoDoc} />
                    <InfoCard title="Documento" value={user.documento} />
                    <InfoCard title="Rol" value={user.rolLabel || user.rol} />
                </div>
            </div>
        </div>
    );
}