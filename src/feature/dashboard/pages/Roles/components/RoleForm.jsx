import { User, FileText, Check, AlertCircle, CheckCircle2, X } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {formError && (
                <Alert type="error" message={formError} onClose={() => setFormError(null)} />
            )}

            <div className={`grid grid-cols-1 ${isUpdate ? 'md:grid-cols-2 gap-x-12 gap-y-6' : 'md:grid-cols-2 gap-6'}`}>

                {/* FIELDS */}
                <div className="flex flex-col gap-4">
                    {isUpdate && (
                        <div className="flex items-center text-yellow-500 gap-2 font-bold mb-[-12px]">
                            <User size={18} />
                            <span>Nombre del rol</span>
                        </div>
                    )}

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
                        <div className={`${isUpdate ? 'w-full' : 'w-1/2'}`}>
                            {isUpdate && (
                                <div className="flex items-center text-yellow-500 gap-2 font-bold mb-2">
                                    <User size={18} />
                                    <span>Estado</span>
                                </div>
                            )}
                           <CustomSelect
                               options={statusOptions}
                               value={formData.estado}
                               onChange={(val) => handleSelectChange("estado", val)}
                               placeholder="Seleccionar Estado"
                           />
                        </div>

                        {!isUpdate && (
                             <div className="w-1/2 bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-500">
                                 {formData.fechaCreacion || formData.fecha}
                             </div>
                        )}
                    </div>
                </div>

                {isUpdate ? (
                    <>
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

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center text-yellow-500 gap-2 font-bold">
                                <User size={18} />
                                <span>Fecha de creación</span>
                            </div>
                            <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center shadow-sm border border-gray-200 text-gray-700">
                                {formData.fechaCreacion || formData.fecha}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full">
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                            className="w-full h-full bg-gray-200/50 rounded-xl px-4 py-3 shadow-sm border border-gray-200 text-gray-700 placeholder-gray-500 outline-none resize-none"
                        ></textarea>
                    </div>
                )}
            </div>

            {/* GRID DE PERMISOS */}
             {isUpdate ? (
                <h3 className="text-xl font-bold text-gray-800 mt-4">Permisos y <span className="text-yellow-500">privilegios</span></h3>
             ) : null}

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!isUpdate ? 'mt-4' : ''}`}>
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
            <div className={`flex mt-4 ${isUpdate ? 'justify-between md:px-20' : 'justify-end gap-6'}`}>
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
