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
    formError,
    setFormError,
    onCancel,
    buttonText
}) {
    const ringClass = (campo) => {
        if (!tocado[campo]) return "focus:ring-yellow-400 bg-gray-200";
        return errors[campo] ? "ring-1 ring-red-300 focus:ring-red-400 bg-red-50" : "ring-1 ring-green-400 focus:ring-green-500 bg-green-50";
    };

    const docTypeOptions = [
        { label: "Cédula de Ciudadanía (CC)", value: "CC" },
        { label: "NIT", value: "NIT" },
        { label: "Cédula de Extranjería (CE)", value: "CE" },
        { label: "Pasaporte", value: "Pasaporte" }
    ];

    return (
        <form onSubmit={handleForm} className="flex flex-col flex-1">
            {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

            <div className="flex flex-col gap-6 mt-6 flex-1">
                
                {/* FILA 1 */}
                <div className="flex gap-6 justify-center">
                    <div className="flex flex-col gap-0 w-80">
                        <CustomSelect
                            label="Tipo de documento *"
                            icon={FileText}
                            options={docTypeOptions}
                            value={formData.tipoDocumento}
                            onChange={(val) => handleSelectChange("tipoDocumento", val)}
                            placeholder="Seleccione tipo"
                        />
                        <ValidationMessage 
                            error={errors.tipoDocumento} 
                            success={tocado.tipoDocumento && !errors.tipoDocumento} 
                            successMessage="Listo" 
                        />
                    </div>

                    <div className="flex flex-col gap-0 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-1.5 mt-0.5">
                            <FileText size={16} /><span>Documento *</span>
                        </div>
                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            placeholder="Ingrese su documento"
                            className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass("documento")}`}
                        />
                        <ValidationMessage 
                            error={errors.documento} 
                            success={tocado.documento && !errors.documento} 
                            successMessage="Listo" 
                        />
                    </div>
                </div>

                {/* FILA 2 */}
                <div className="flex gap-6 justify-center">
                    <div className="flex flex-col gap-0 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                            <User size={16} /><span>Nombres *</span>
                        </div>
                        <input
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            placeholder="Ingrese su nombre completo"
                            className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass("nombres")}`}
                        />
                        <ValidationMessage 
                            error={errors.nombres} 
                            success={tocado.nombres && !errors.nombres} 
                            successMessage="Listo" 
                        />
                    </div>

                    <div className="flex flex-col gap-0 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                            <User size={16} /><span>Apellidos *</span>
                        </div>
                        <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            placeholder="Ingrese sus apellidos"
                            className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass("apellidos")}`}
                        />
                        <ValidationMessage 
                            error={errors.apellidos} 
                            success={tocado.apellidos && !errors.apellidos} 
                            successMessage="Listo" 
                        />
                    </div>
                </div>

                {/* FILA 3 */}
                <div className="flex gap-6 justify-center">
                    <div className="flex flex-col gap-0 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                            <Mail size={16} /><span>Email *</span>
                        </div>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ingrese su email"
                            className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass("email")}`}
                        />
                        <ValidationMessage 
                            error={errors.email} 
                            success={tocado.email && !errors.email} 
                            successMessage="Listo" 
                        />
                        {!tocado.email && (
                            <p className="text-[11px] text-gray-400 mt-1 ml-1">
                                Dominios aceptados: gmail, hotmail, outlook, yahoo, icloud, entre otros.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-0 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                            <Phone size={16} /><span>Teléfono *</span>
                        </div>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="Digite su teléfono"
                            className={`rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass("telefono")}`}
                        />
                        <ValidationMessage 
                            error={errors.telefono} 
                            success={tocado.telefono && !errors.telefono} 
                            successMessage="Listo" 
                        />
                    </div>
                </div>
            </div>

            {/* BOTONES AL FINAL DEL TODO */}
            <div className="flex justify-end gap-6 mt-auto pt-6">
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