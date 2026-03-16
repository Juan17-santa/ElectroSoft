import { Tag, FileText, Check, AlertCircle, CheckCircle2, X, Activity, Calendar } from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { PERMISSION_SCOPES } from "../services/RolesService";
import Alert from "../../../components/ui/Alert";

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
    tocado,
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
    const ringClass = (estado) => {
        if (!estado) return "border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent";
        return estado.valido
            ? "border-green-300 ring-2 ring-green-300 bg-green-50"
            : "border-red-300 ring-2 ring-red-300 bg-red-50";
    };

    const statusOptions = [
        { label: "Activo", value: true },
        { label: "Inactivo", value: false }
    ];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">

            {formError && (
                <Alert type="error" message={formError} onClose={() => setFormError(null)} />
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 ${isUpdate ? 'gap-x-12 gap-y-6' : 'gap-6'}`}>
                {/* FIELDS */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center text-yellow-500 gap-2 font-bold mb-[-12px]">
                        <Tag size={18} />
                        <span>Nombre del rol</span>
                    </div>

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
                        </div>
                        <FieldStatus estado={estadoNombre} />
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
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

                        <div className="w-1/2 flex flex-col justify-end">
                            <div className="flex items-center text-yellow-500 gap-2 font-bold mb-2">
                                <Calendar size={18} />
                                <span>Fecha de creación</span>
                            </div>
                            <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-700 min-h-[48px]">
                                {formData.fechaCreacion || formData.fecha || "Automática"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center text-yellow-500 gap-2 font-bold">
                        <FileText size={18} />
                        <span>Descripción</span>
                    </div>
                    <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 h-full flex-1">
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                            className="bg-transparent w-full text-gray-700 placeholder-gray-500 outline-none resize-none min-h-[48px]"
                        ></textarea>
                    </div>
                </div>
            </div>


            {/* GRID DE PERMISOS */}
            {isUpdate ? (
                <h3 className="text-xl font-bold text-gray-800 mt-2">Permisos y <span className="text-yellow-500">privilegios</span></h3>
            ) : null}

            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${!isUpdate ? 'mt-1' : ''} flex-1`}>
                {PERMISSION_SCOPES.map((scope) => {
                    const currentActions = formData.permisos[scope.name] || [];
                    const isAllSelected = currentActions.length === scope.actions.length;

                    return (
                        <div key={scope.name} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:border-yellow-400 transition-all duration-200 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                                <h3 className="font-bold text-gray-800 text-sm truncate" title={scope.name}>{scope.name}</h3>
                                <div
                                    onClick={() => handleScopeToggle(scope.name, scope.actions)}
                                    className={`w-5 h-5 rounded cursor-pointer flex items-center justify-center transition
                                        ${isAllSelected ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-transparent hover:bg-gray-300'}`}
                                >
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center mt-1">
                                {scope.actions.map(action => {
                                    const isChecked = currentActions.includes(action);
                                    return (
                                        <div key={action} className="flex items-center gap-1.5 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">{action}</span>
                                            <div
                                                onClick={() => handlePermissionChange(scope.name, action)}
                                                className={`w-4 h-4 rounded-sm hover:scale-110 transition cursor-pointer flex items-center justify-center
                                                    ${isChecked ? 'bg-green-500 text-white' : 'bg-gray-300 text-transparent'}`}
                                            >
                                                <Check size={12} strokeWidth={4} />
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
            <div className="flex justify-end gap-6 mt-auto">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer hover:shadow-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                    <X size={16} />
                    Cancelar
                </button>

                <PrimaryButton type="submit">
                    {buttonText}
                </PrimaryButton>
            </div>
        </form>
    );
}
