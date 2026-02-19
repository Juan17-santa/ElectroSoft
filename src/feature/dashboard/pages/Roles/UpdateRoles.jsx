import { User, FileText, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService, PERMISSION_SCOPES } from "./services/RolesService";

export default function UpdateRoles() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        estado: true,
        fecha: "",
        permisos: {}
    });

    useEffect(() => {
        const data = localStorage.getItem("roleToEdit");
        if (data) {
            const parsed = JSON.parse(data);
            // Asegurar que permisos exista aunque sea vacío
            setFormData({
                ...parsed,
                permisos: parsed.permisos || {}
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePermissionChange = (scopeName, action) => {
        setFormData(prev => {
            const currentActions = prev.permisos[scopeName] || [];
            let newActions;

            if (currentActions.includes(action)) {
                newActions = currentActions.filter(a => a !== action);
            } else {
                newActions = [...currentActions, action];
            }

            return {
                ...prev,
                permisos: {
                    ...prev.permisos,
                    [scopeName]: newActions
                }
            };
        });
    };

    const handleScopeToggle = (scopeName, allActions) => {
        setFormData(prev => {
            const currentActions = prev.permisos[scopeName] || [];
            const isAllSelected = currentActions.length === allActions.length;

            return {
                ...prev,
                permisos: {
                    ...prev.permisos,
                    [scopeName]: isAllSelected ? [] : [...allActions]
                }
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (!formData.nombre) {
                alert("El nombre es requerido");
                return;
            }

            RolesService.update({
                id: formData.id,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                estado: formData.estado,
                fechaCreacion: formData.fecha, // Mantener fecha original
                permisos: formData.permisos
            });

            alert("Rol actualizado correctamente!");
            localStorage.removeItem("roleToEdit");
            navigate("/dashboard/roles");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-100 p-8 rounded-3xl min-h-full font-sans">

            {/* TITULO */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Editar <span className="text-yellow-500">rol</span>
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* CAMPOS SUPERIORES - GRID 2x2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

                    {/* NOMBRE */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center text-yellow-500 gap-2 font-bold">
                            <User size={18} />
                            <span>Nombre del rol</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-gray-200">
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del rol"
                                className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none"
                            />
                            <span className="text-gray-400 text-xs">▼</span>
                        </div>
                    </div>

                    {/* DESCRIPCION */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center text-yellow-500 gap-2 font-bold">
                            <FileText size={18} />
                            <span>Descripción</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200">
                            <input
                                type="text"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Descripción"
                                className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* ESTADO */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center text-yellow-500 gap-2 font-bold">
                            <User size={18} />
                            <span>Estado</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-gray-200">
                            <select
                                name="estado"
                                value={formData.estado.toString()}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                                className="bg-transparent w-full text-gray-700 outline-none appearance-none cursor-pointer"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                            <span className="text-gray-400 text-xs">▼</span>
                        </div>
                    </div>

                    {/* FECHA */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center text-yellow-500 gap-2 font-bold">
                            <User size={18} />
                            <span>Fecha de creación</span>
                        </div>
                        <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-700">
                            {formData.fechaCreacion || formData.fecha}
                        </div>
                    </div>

                </div>

                {/* GRID DE PERMISOS */}
                <h3 className="text-xl font-bold text-gray-800 mt-4">Permisos y <span className="text-yellow-500">privilegios</span></h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PERMISSION_SCOPES.map((scope) => {
                        const currentActions = formData.permisos[scope.name] || [];
                        const isAllSelected = currentActions.length === scope.actions.length;

                        return (
                            <div key={scope.name} className="bg-gray-200/40 rounded-2xl p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 text-lg">{scope.name}</h3>
                                    <div
                                        onClick={() => handleScopeToggle(scope.name, scope.actions)}
                                        className={`w-6 h-6 rounded-md cursor-pointer flex items-center justify-center transition
                                            ${isAllSelected ? 'bg-gray-500 text-white' : 'bg-gray-300 text-transparent'}`}
                                    >
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 items-center">
                                    {scope.actions.map(action => {
                                        const isChecked = currentActions.includes(action);
                                        return (
                                            <div key={action} className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-700">{action}</span>
                                                <div
                                                    onClick={() => handlePermissionChange(scope.name, action)}
                                                    className={`w-5 h-5 rounded hover:scale-105 transition cursor-pointer flex items-center justify-center
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

                {/* BOTONES */}
                <div className="flex justify-between mt-8 md:px-20">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/roles")}
                        className="bg-gradient-to-r from-gray-100 to-white text-gray-800 font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-yellow-100 to-yellow-400 text-gray-900 font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105"
                    >
                        Guardar cambios
                    </button>
                </div>

            </form>
        </div>
    );
}