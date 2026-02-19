import { User, FileText, Check } from "lucide-react";
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
            setRoleData({
                ...parsed,
                permisos: parsed.permisos || {}
            });
        }
    }, []);

    return (
        <div className="bg-gray-100 p-8 pb-12 rounded-3xl min-h-full font-sans">

            {/* TITULO */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Ver detalles del <span className="text-yellow-500">rol</span>
                </h1>
            </div>

            <div className="flex flex-col gap-8 max-w-6xl mx-auto">

                {/* CAMPOS DE INFORMACION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

                    {/* NOMBRE */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
                            <User size={20} />
                            <span>Nombre del rol</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-6 py-4 text-gray-700 shadow-sm border border-gray-200 text-center">
                            {roleData.nombre}
                        </div>
                    </div>

                    {/* DESCRIPCION */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
                            <User size={20} /> {/* Usa icono User segun mockup, podria ser FileText */}
                            <span>Descripción</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-6 py-4 text-gray-700 shadow-sm border border-gray-200 text-center">
                            {roleData.descripcion}
                        </div>
                    </div>

                    {/* ESTADO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
                            <User size={20} />
                            <span>Estado</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-6 py-4 text-gray-700 shadow-sm border border-gray-200 text-center">
                            {roleData.estado ? "Activo" : "Inactivo"}
                        </div>
                    </div>

                    {/* FECHA */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
                            <User size={20} />
                            <span>Fecha de creación</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-6 py-4 text-gray-700 shadow-sm border border-gray-200 text-center">
                            {roleData.fechaCreacion || "N/A"}
                        </div>
                    </div>

                </div>

                {/* GRID DE PERMISOS */}
                <h3 className="text-xl font-bold text-gray-800 mt-4 text-center">Permisos y <span className="text-yellow-500">privilegios</span></h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mx-auto w-full max-w-5xl">
                    {PERMISSION_SCOPES.map((scope) => {
                        const currentActions = roleData.permisos[scope.name] || [];
                        const isAllSelected = currentActions.length === scope.actions.length;

                        // Solo mostrar si tiene algún permiso?? No, mockup muestra todos.
                        // Mockup muestra solo 2 columnas centradas en detalles.

                        return (
                            <div key={scope.name} className="bg-gray-200/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900 text-xl mb-4">{scope.name}</h3>
                                </div>

                                <div className="flex justify-center flex-wrap gap-4">
                                    {scope.actions.map(action => {
                                        const isChecked = currentActions.includes(action);
                                        return (
                                            <div key={action} className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{action}</span>
                                                <div
                                                    className={`w-5 h-5 rounded flex items-center justify-center pointer-events-none
                                                        ${isChecked ? 'bg-gray-600 text-white' : 'bg-gray-300 text-transparent'}`}
                                                >
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* BOTON CANCELAR */}
                <div className="flex justify-center mt-8 pb-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/roles")}
                        className="bg-gradient-to-r from-yellow-100 to-yellow-400 text-gray-900 font-bold py-3 px-20 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}
