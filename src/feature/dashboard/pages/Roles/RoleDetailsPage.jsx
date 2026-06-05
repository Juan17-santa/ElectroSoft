import { User, Check, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PERMISSION_SCOPES } from "../Roles/services/RolesService";

export default function RoleDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [roleData, setRoleData] = useState(null);

    useEffect(() => {
        if (location.state?.role) {
            setRoleData(location.state.role);
        } else {
            navigate("/dashboard/roles");
        }
    }, []);

    if (!roleData) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">Cargando información del rol...</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-100 p-4 rounded-2xl flex flex-col gap-4 h-full shadow-inner">
                <div
                    className="relative bg-white rounded-3xl p-5 shadow-lg overflow-hidden flex-1 flex flex-col"
                    style={{
                        backgroundImage: 'url("/background-details.jpg")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                    <div className="relative z-10 flex flex-col gap-4 h-full">

                        {/* TÍTULO */}
                        <div className="flex items-center gap-2">
                            <Info size={22} className="text-gray-800" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Ver información del rol
                            </h2>
                        </div>

                        {/* TARJETA INFO */}
                        <div className="bg-gray-50 rounded-2xl p-4 shadow-md flex-1 overflow-hidden flex flex-col">

                            {/* GRID CAMPOS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-yellow-600 font-bold mb-0.5 text-sm">
                                        <User size={14} />
                                        <span>Nombre</span>
                                    </div>
                                    <div className="bg-white rounded-lg px-4 py-2 text-gray-700 shadow-sm border border-gray-200 text-sm font-medium">
                                        {roleData.nombre}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <div className="flex items-center gap-1.5 text-yellow-600 font-bold mb-0.5 text-sm">
                                        <User size={14} />
                                        <span>Descripción</span>
                                    </div>
                                    <div className="bg-white rounded-lg px-4 py-2 text-gray-600 shadow-sm border border-gray-200 text-sm truncate" title={roleData.descripcion}>
                                        {roleData.descripcion || "Sin descripción"}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-yellow-600 font-bold mb-0.5 text-sm">
                                        <User size={14} />
                                        <span>Estado</span>
                                    </div>
                                    <div className="bg-white rounded-lg px-4 py-2 text-gray-700 shadow-sm border border-gray-200 text-sm flex items-center justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold
                                            ${roleData.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${roleData.estado ? "bg-green-500" : "bg-red-500"}`}></span>
                                            {roleData.estado ? "ACTIVO" : "INACTIVO"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* GRID PERMISOS */}
                            <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">
                                Permisos y <span className="text-yellow-500">privilegios</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 overflow-y-auto pb-2 pr-2">
                                {PERMISSION_SCOPES.map((scope) => {
                                    // Filtra los permisos de este módulo
                                    const scopePermisos = (roleData.permisos || []).filter(
                                        p => p.startsWith(`${scope.name}:`)
                                    );

                                    return (
                                        <div key={scope.name} className="bg-white/80 rounded-xl p-3 shadow-sm flex flex-col gap-2 border border-gray-100">
                                            <h3 className="font-bold text-gray-800 text-[13px] text-center border-b border-gray-200 pb-1 mb-1">
                                                {scope.label}
                                            </h3>
                                            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                                                {scope.actions.map(action => {
                                                    const permission = `${scope.name}:${action}`;
                                                    const isChecked  = scopePermisos.includes(permission);
                                                    return (
                                                        <div key={action}
                                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border
                                                                ${isChecked
                                                                    ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                                                                    : "bg-gray-50 border-gray-100 text-gray-400"
                                                                }`}
                                                        >
                                                            <span className="text-[10px] font-bold uppercase">{action}</span>
                                                            {isChecked && <Check size={10} strokeWidth={4} className="text-green-600" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN VOLVER */}
                <div className="flex justify-center shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/roles")}
                        className="px-5 py-2.5 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer hover:shadow-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                    >
                        <X size={16} />
                        Volver a la lista
                    </button>
                </div>
            </div>
        </>
    );
}