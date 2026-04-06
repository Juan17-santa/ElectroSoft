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
    roles = []
}) {

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex flex-col items-center gap-14 mt-10 justify-start flex-1 mx-28">

                {/* ================= PRIMERA FILA ================= */}
                <div className="flex gap-20">

                    {/* TIPO DOCUMENTO */}
                    <div className="flex flex-col w-96">
                        <CustomSelect
                            label="Tipo documento *"
                            icon={IdCard}
                            value={formData.tipoDoc}
                            onChange={(value) =>
                                handleChange({ target: { name: "tipoDoc", value } })
                            }
                            options={[
                                { value: "CC", label: "C.C" },
                                { value: "CE", label: "C.E" },
                                { value: "NIT", label: "NIT" },
                                { value: "Pasaporte", label: "Pasaporte" },
                            ]}
                            placeholder="Seleccione un tipo"
                        />
                        <ValidationMessage
                            error={errors.tipoDoc}
                            success={formData.tipoDoc}
                            successMessage="Tipo de documento válido"
                        />
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-3 w-96">
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                            ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <ValidationMessage
                            error={errors.documento}
                            success={formData.documento}
                            successMessage="Documento válido"
                        />
                    </div>
                </div>

                {/* ================= SEGUNDA FILA ================= */}
                <div className="flex gap-20">

                    {/* NOMBRE */}
                    <div className="flex flex-col gap-3 w-96">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Nombre *</span>
                        </div>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                            ${errors.nombre ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <ValidationMessage
                            error={errors.nombre}
                            success={formData.nombre}
                            successMessage="Nombre válido"
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="flex flex-col gap-3 w-96">
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                            ${errors.email ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <ValidationMessage
                            error={errors.email}
                            success={formData.email}
                            successMessage="Email válido"
                        />
                    </div>
                </div>

                {/* ================= TERCERA FILA ================= */}
                <div className="flex gap-20">

                    {/* TELEFONO */}
                    <div className="flex flex-col gap-3 w-96">
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                            ${errors.telefono ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <ValidationMessage
                            error={errors.telefono}
                            success={formData.telefono}
                            successMessage="Teléfono válido"
                        />
                    </div>

                    {/* ROL */}
                    <div className="flex flex-col gap-1 w-96">
                        <CustomSelect
                            label="Rol *"
                            icon={User}
                            value={formData.rol}
                            onChange={(value) =>
                                handleChange({ target: { name: "rol", value } })
                            }
                            options={roles.map((r) => ({ value: r.nombre, label: r.nombre }))}
                            placeholder="Seleccione un rol"
                        />
                        <ValidationMessage
                            error={errors.rol}
                            success={formData.rol}
                            successMessage="Rol válido"
                        />
                    </div>
                </div>

            </div>

            {/* ================= BOTONES ================= */}
            <div className="flex justify-end mt-auto gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
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