import PrimaryButton from "../../../components/ui/PrimaryButton";
import { FileText, User, Mail, Phone, X, IdCard } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";

export default function UserForm({
    formData,
    errors,
    handleChange,
    handleSubmit,
    buttonText,
    onCancel,
    roles = [],
    documentTypes = [],
}) {

    const inputClasses = (field) =>
        `bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-full ${
            errors[field] ? "focus:ring-red-500" : "focus:ring-yellow-400"
        }`;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-min gap-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mt-6 px-4 md:px-20">

                {/* TIPO DOCUMENTO */}
                <div className="flex flex-col gap-1 w-full">
                    <CustomSelect
                        label="Tipo documento *"
                        icon={IdCard}
                        value={formData.tipoDoc?.toString() || ""}
                        onChange={(value) =>
                            handleChange({ target: { name: "tipoDoc", value } })
                        }
                        options={documentTypes.map(d => ({
                            value: d._id.toString(),
                            label: `${d.nombre} (${d.abbreviation})`, // ← igual que ProviderForm
                        }))}
                        placeholder="Seleccione un tipo"
                        width="w-full"
                    />
                    <ValidationMessage
                        error={errors.tipoDoc}
                        success={formData.tipoDoc}
                        successMessage="Tipo de documento válido"
                    />
                </div>

                {/* DOCUMENTO */}
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <FileText size={16} />
                        <span>Documento *</span>
                    </div>
                    <input
                        type="text"
                        name="documento"
                        value={formData.documento}
                        onChange={handleChange}
                        placeholder="Ingrese el documento"
                        className={inputClasses("documento")}
                    />
                    <ValidationMessage
                        error={errors.documento}
                        success={formData.documento}
                        successMessage="Documento válido"
                    />
                </div>

                {/* NOMBRE */}
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <User size={16} />
                        <span>Nombre completo *</span>
                    </div>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre completo"
                        className={inputClasses("nombre")}
                    />
                    <ValidationMessage
                        error={errors.nombre}
                        success={formData.nombre}
                        successMessage="Nombre válido"
                    />
                </div>

                {/* EMAIL */}
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <Mail size={16} />
                        <span>Email *</span>
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ingrese el email"
                        className={inputClasses("email")}
                    />
                    <ValidationMessage
                        error={errors.email}
                        success={formData.email}
                        successMessage="Email válido"
                    />
                </div>

                {/* TELEFONO */}
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <Phone size={16} />
                        <span>Teléfono *</span>
                    </div>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ingrese el teléfono"
                        className={inputClasses("telefono")}
                    />
                    <ValidationMessage
                        error={errors.telefono}
                        success={formData.telefono}
                        successMessage="Teléfono válido"
                    />
                </div>

                {/* ROL */}
                <div className="flex flex-col gap-1 w-full">
                    <CustomSelect
                        label="Rol *"
                        icon={User}
                        value={formData.rol?.toString() || ""}
                        onChange={(value) =>
                            handleChange({ target: { name: "rol", value } })
                        }
                        options={roles.map(r => ({
                            value: r._id.toString(),
                            label: r.nombre,
                        }))}
                        placeholder="Seleccione un rol"
                        width="w-full"
                    />
                    <ValidationMessage
                        error={errors.rol}
                        success={formData.rol}
                        successMessage="Rol válido"
                    />
                </div>

            </div>

            {/* BOTONES */}
            <div className="flex justify-end mt-auto gap-4 px-4 md:px-20">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <X size={16} />
                    Cancelar
                </button>
                <PrimaryButton
                    type="submit"
                    disabled={Object.values(errors).some(error => error)}
                >
                    {buttonText}
                </PrimaryButton>
            </div>
        </form>
    );
}