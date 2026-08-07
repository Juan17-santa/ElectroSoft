import { Tag, FileText, Check, AlertCircle, CheckCircle2, Activity, Calendar } from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { PERMISSION_SCOPES } from "../services/RolesService";
import { useEffect } from "react";
import { useToast } from "../../../../../context/ToastContext";

function FieldStatus({ estado }) {
    if (estado === null || estado === undefined) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 ${estado.valido ? "text-green-500" : "text-red-500"}`}>
            {estado.valido ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>{estado.valido ? "Listo" : estado.mensaje}</span>
        </div>
    );
}

export default function RoleForm({
    formData,
    tocar,
    estadoNombre,
    formError,
    setFormError,
    handleChange,
    handleSelectChange,
    handlePermissionChange,
    handleScopeToggle,
    handleSubmit,
    onCancel,
    buttonText,
    isUpdate = false
}) {
    const { showToast } = useToast();

    useEffect(() => {
        if (formError) {
            showToast("error", formError);
            setFormError(null);
        }
    }, [formError, showToast, setFormError]);

    const ringClass = (estado) => {
        if (!estado) return "border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent";
        return estado.valido
            ? "border-green-300 ring-2 ring-green-300 bg-green-50"
            : "border-red-300 ring-2 ring-red-300 bg-red-50";
    };

    const statusOptions = [
        { label: "Activo",   value: true  },
        { label: "Inactivo", value: false },
    ];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">

            <div className={`grid grid-cols-1 md:grid-cols-2 ${isUpdate ? "gap-x-12 gap-y-6" : "gap-6"}`}>

                {/* NOMBRE Y ESTADO */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center text-yellow-500 gap-2 font-bold">
                        <Tag size={18} />
                        <span>Nombre del rol *</span>
                    </div>
                    <div className="flex flex-col">
                        <div className={`rounded-xl px-4 py-3 flex items-center justify-between shadow-md transition-all duration-300 ${ringClass(estadoNombre)} ${!estadoNombre || estadoNombre.valido ? "bg-gray-200" : ""}`}>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                onBlur={() => tocar("nombre")}
                                placeholder="Nombre del rol"
                                className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none"
                            />
                        </div>
                        <FieldStatus estado={estadoNombre} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                            <div className="flex items-center text-yellow-500 gap-2 font-bold mb-2">
                                <Activity size={18} />
                                <span>Estado</span>
                            </div>
                            <CustomSelect
                                options={statusOptions}
                                value={formData.estado}
                                onChange={(val) => handleSelectChange("estado", val)}
                                placeholder="Seleccionar Estado"
                            />
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col justify-end">
                            <div className="flex items-center text-yellow-500 gap-2 font-bold mb-2">
                                <Calendar size={18} />
                                <span>Fecha de creación</span>
                            </div>
                            <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-700 min-h-12">
                                {formData.fechaCreacion || "Automática"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center text-yellow-500 gap-2 font-bold">
                        <FileText size={18} />
                        <span>Descripción</span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="rounded-xl px-4 py-3 flex flex-col shadow-sm transition-all duration-300 h-full flex-1 bg-gray-200/50">
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Descripción del rol (opcional)"
                                className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none resize-none min-h-20 flex-1"
                                maxLength={200}
                            />
                            <span className={`text-[11px] mt-1 self-end ${formData.descripcion.length > 180 ? "text-red-400" : "text-gray-400"}`}>
                                {formData.descripcion.length}/200
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID DE PERMISOS */}
            <h3 className="text-xl font-bold text-gray-800 mt-2">
                Permisos y <span className="text-yellow-500">privilegios</span>
            </h3>

            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${!isUpdate ? "mt-1" : ""} flex-1`}>
                {PERMISSION_SCOPES.map((scope) => {
                    // Permisos actuales de este módulo
                    const currentPermissions = formData.permisos.filter(
                        p => p.startsWith(`${scope.name}:`)
                    );
                    const isAllSelected = scope.actions.every(
                        a => formData.permisos.includes(`${scope.name}:${a}`)
                    );

                    return (
                        <div key={scope.name} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:border-yellow-400 transition-all duration-200 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                                <h3 className="font-bold text-gray-800 text-sm truncate" title={scope.label}>
                                    {scope.label}
                                </h3>
                                {/* Checkbox para seleccionar todo el módulo */}
                                <div
                                    onClick={() => handleScopeToggle(scope.name, scope.actions)}
                                    className={`w-5 h-5 rounded cursor-pointer flex items-center justify-center transition
                                        ${isAllSelected ? "bg-yellow-500 text-white" : "bg-gray-200 text-transparent hover:bg-gray-300"}`}
                                >
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center mt-1">
                                {scope.actions.map(action => {
                                    const permission = `${scope.name}:${action}`;
                                    const isChecked  = formData.permisos.includes(permission);
                                    return (
                                        <div key={action} className="flex items-center gap-1.5 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">
                                                {action}
                                            </span>
                                            <div
                                                onClick={() => handlePermissionChange(scope.name, action)}
                                                className={`w-4 h-4 rounded-sm hover:scale-110 transition cursor-pointer flex items-center justify-center
                                                    ${isChecked ? "bg-green-500 text-white" : "bg-gray-300 text-transparent"}`}
                                            >
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-6 mt-auto">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <span>✕</span>
                    Cancelar
                </button>
                <PrimaryButton type="submit">
                    {buttonText}
                </PrimaryButton>
            </div>
        </form>
    );
}