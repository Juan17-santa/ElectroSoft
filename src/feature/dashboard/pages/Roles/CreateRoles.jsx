import { User, FileText, X, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService, PERMISSION_SCOPES } from "./services/RolesService";
import { Validations } from "../../../../utils/validations";

function FieldStatus({ estado }) {
    if (estado === null || estado === undefined) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 ${estado.valido ? "text-green-500" : "text-red-500"}`}>
            {estado.valido ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>{estado.valido ? "Listo" : estado.mensaje}</span>
        </div>
    );
}

export default function CreateRoles() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        estado: true,
        fecha: new Date().toLocaleDateString('es-CO'),
        permisos: {}
    });

    const [tocado, setTocado] = useState({ nombre: false });
    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    const estadoNombre = tocado.nombre ? Validations.validarNombreRol(formData.nombre) : null;

    const ringClass = (estado) => {
        if (!estado) return "border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent";
        return estado.valido
            ? "border-green-300 ring-2 ring-green-300 bg-green-50"
            : "border-red-300 ring-2 ring-red-300 bg-red-50";
    };

    // Inicializar permisos vacíos
    // Estructura: { "Ventas": ["Crear", "Editar"], ... }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePermissionChange = (scopeName, action) => {
        setFormData(prev => {
            const currentActions = prev.permisos[scopeName] || [];
            let newActions;

            if (currentActions.includes(action)) {
                // Remover acción
                newActions = currentActions.filter(a => a !== action);
            } else {
                // Agregar acción
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

    /**
     * Maneja el cambio del checkbox "Seleccionar todos" del encabezado de la tarjeta
     */
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
        setTocado({ nombre: true });

        try {
            const vNombre = Validations.validarNombreRol(formData.nombre);
            if (!vNombre.valido) {
                return;
            }

            if (formData.descripcion && formData.descripcion.length > 200) {
                alert("La descripción no debe exceder los 200 caracteres.");
                return;
            }

            RolesService.create({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                permisos: formData.permisos
            });

            alert("Rol creado correctamente!");
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
                    Crear nuevo <span className="text-yellow-500">rol</span>
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* CAMPOS SUPERIORES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* IZQUIERDA: ROL, ESTADO, FECHA */}
                    <div className="flex flex-col gap-4">
                        {/* Rol Input */}
                        <div className="flex flex-col">
                            <div className={`rounded-xl px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-300 ${ringClass(estadoNombre)} ${!estadoNombre || estadoNombre.valido ? 'bg-gray-200/50' : ''}`}>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    onBlur={() => tocar("nombre")}
                                    placeholder="Nombre del rol"
                                    className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none"
                                />
                                {/* Icono de flecha simulado para coincidir con diseño, aunque es input texto */}
                                <span className="text-gray-400">▼</span>
                            </div>
                            <FieldStatus estado={estadoNombre} />
                        </div>

                        <div className="flex gap-4">
                            {/* Estado Dropdown */}
                            <div className="w-1/2 bg-gray-200/50 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-gray-200">
                                <select
                                    name="estado"
                                    value={formData.estado.toString()}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                                    className="bg-transparent w-full text-gray-700 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                                <span className="text-gray-400">▼</span>
                            </div>

                            {/* Fecha Readonly */}
                            <div className="w-1/2 bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-500">
                                {formData.fecha}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: DESCRIPCION */}
                    <div className="h-full">
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                            className="w-full h-full bg-gray-200/50 rounded-xl px-4 py-3 shadow-sm border border-gray-200 text-gray-700 placeholder-gray-500 outline-none resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* GRID DE PERMISOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {PERMISSION_SCOPES.map((scope) => {
                        const currentActions = formData.permisos[scope.name] || [];
                        const isAllSelected = currentActions.length === scope.actions.length;

                        return (
                            <div key={scope.name} className="bg-gray-200/40 rounded-2xl p-4 shadow-sm">

                                {/* Header Card */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 text-lg">{scope.name}</h3>
                                    {/* Checkbox All */}
                                    <div
                                        onClick={() => handleScopeToggle(scope.name, scope.actions)}
                                        className={`w-6 h-6 rounded-md cursor-pointer flex items-center justify-center transition
                                            ${isAllSelected ? 'bg-gray-500 text-white' : 'bg-gray-300 text-transparent'}`}
                                    >
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                </div>

                                {/* Acciones */}
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

                {/* BOTON REGISTRAR y VOLVER */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/roles")}
                        className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl shadow hover:bg-gray-300 transition cursor-pointer"
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-yellow-100 to-yellow-400 text-gray-900 font-bold py-3 px-12 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                        Registrar Rol
                    </button>
                </div>

            </form>
        </div>
    );
}