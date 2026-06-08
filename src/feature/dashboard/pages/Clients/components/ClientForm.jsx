import { User, FileText, X, Mail, Phone } from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import Alert from "../../../components/ui/Alert";

export default function ClientForm({
    formData,
    errors,
    tocado,
    handleChange,
    handleSelectChange,
    handleForm,
    buttonText,
    formError,
    setFormError,
    onCancel,
    docTypeOptions = []
}) {
    const ringClass = (campo) => {
        return errors[campo] ? "focus:ring-yellow-400 bg-gray-200" : "";
    };

    return (
        <form onSubmit={handleForm} className="flex flex-col flex-1">
            {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

            {/* GRID RESPONSIVE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-6 px-4 md:px-16 flex-1">

                {/* TIPO DOCUMENTO */}
                <div className="flex flex-col w-full">
                    <CustomSelect
                        label="Tipo de documento *"
                        icon={FileText}
                        options={docTypeOptions}
                        value={formData.tipoDocumento}
                        onChange={(val) => handleSelectChange("tipoDocumento", val)}
                        placeholder="Seleccione tipo"
                        width="w-full"
                    />
                    <ValidationMessage
                        error={tocado.tipoDocumento ? errors.tipoDocumento : null}
                        success={tocado.tipoDocumento && !errors.tipoDocumento}
                        successMessage="Listo"
                    />
                </div>

                {/* DOCUMENTO */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-1.5 mt-0.5">
                        <FileText size={16} /><span>Documento *</span>
                    </div>
                    <input
                        type="text"
                        name="documento"
                        value={formData.documento}
                        onChange={handleChange}
                        placeholder="Ingrese su documento"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 w-full ${ringClass("documento")}`}
                    />
                    <ValidationMessage
                        error={tocado.documento ? errors.documento : null}
                        success={tocado.documento && !errors.documento}
                        successMessage="Listo"
                    />
                </div>

                {/* NOMBRES */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                        <User size={16} /><span>Nombres *</span>
                    </div>
                    <input
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        placeholder="Ingrese su nombre completo"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 w-full ${ringClass("nombres")}`}
                    />
                    <ValidationMessage
                        error={tocado.nombres ? errors.nombres : null}
                        success={tocado.nombres && !errors.nombres}
                        successMessage="Listo"
                    />
                </div>

                {/* APELLIDOS */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                        <User size={16} /><span>Apellidos *</span>
                    </div>
                    <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        placeholder="Ingrese sus apellidos"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 w-full ${ringClass("apellidos")}`}
                    />
                    <ValidationMessage
                        error={tocado.apellidos ? errors.apellidos : null}
                        success={tocado.apellidos && !errors.apellidos}
                        successMessage="Listo"
                    />
                </div>

                {/* EMAIL */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                        <Mail size={16} /><span>Email *</span>
                    </div>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ingrese su email"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 w-full ${ringClass("email")}`}
                    />
                    <ValidationMessage
                        error={tocado.email ? errors.email : null}
                        success={tocado.email && !errors.email}
                        successMessage="Listo"
                    />
                    {!tocado.email && (
                        <p className="text-[11px] text-gray-400 mt-1 ml-1">
                            Dominios aceptados: gmail, hotmail, outlook, yahoo, icloud, entre otros.
                        </p>
                    )}
                </div>

                {/* TELÉFONO */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                        <Phone size={16} /><span>Teléfono *</span>
                    </div>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Digite su teléfono"
                        className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 w-full ${ringClass("telefono")}`}
                    />
                    <ValidationMessage
                        error={tocado.telefono ? errors.telefono : null}
                        success={tocado.telefono && !errors.telefono}
                        successMessage="Listo"
                    />
                </div>

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-4 mt-auto pt-6 px-4 md:px-20">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
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