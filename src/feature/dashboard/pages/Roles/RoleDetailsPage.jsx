import { User, Check, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSION_SCOPES } from "./services/RolesService";

export default function RoleDetailsPage() {
    const navigate = useNavigate();

    const [roleData, setRoleData] = useState({
        nombre: "",
        descripcion: "",
        estado: true,
        fechaCreacion: "",
        permisos: {}
    });

    useEffect(() => {
        const data = localStorage.getItem("roleToView");
        if (data) {
            const parsed = JSON.parse(data);
            setRoleData({ ...parsed, permisos: parsed.permisos || {} });
        }
    }, []);

    return (
        <>
            <div className="bg-gray-100 p-4 rounded-2xl flex flex-col gap-4 h-full shadow-inner">

                {/* CONTENEDOR PRINCIPAL CON IMAGEN DE FONDO */}
                <div
                    className="relative bg-white rounded-3xl p-5 shadow-lg overflow-hidden flex-1 flex flex-col"
                    style={{
                        backgroundImage: 'url("/background-shopping-details.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Capa de transparencia */}
                    <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                    <div className="relative z-10 flex flex-col gap-4 h-full">

                        {/* TÍTULO */}
                        <div className="flex items-center gap-2">
                            <Info size={22} className="text-gray-800" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Ver detalles del <span className="text-yellow-500">rol</span>
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
                                        {roleData.descripcion}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-yellow-600 font-bold mb-0.5 text-sm">
                                        <User size={14} />
                                        <span>Estado</span>
                                    </div>
                                    <div className="bg-white rounded-lg px-4 py-2 text-gray-700 shadow-sm border border-gray-200 text-sm flex items-center justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${roleData.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
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
                                    const currentActions = roleData.permisos[scope.name] || [];
                                    return (
                                        <div key={scope.name} className="bg-white/80 rounded-xl p-3 shadow-sm flex flex-col gap-2 border border-gray-100">
                                            <h3 className="font-bold text-gray-800 text-[13px] text-center border-b border-gray-200 pb-1 mb-1">{scope.name}</h3>
                                            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                                                {scope.actions.map(action => {
                                                    const isChecked = currentActions.includes(action);
                                                    return (
                                                        <div key={action} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${isChecked ? "bg-green-50 border-green-200 text-green-700 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
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
                        className="bg-gray-800 text-white hover:bg-gray-900 transition duration-300 px-8 py-2.5 rounded-xl text-sm font-medium shadow-md cursor-pointer"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        </>
    );
}
