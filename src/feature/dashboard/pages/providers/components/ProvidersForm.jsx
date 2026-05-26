import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useNavigate } from "react-router-dom";

export default function ProviderForm({
    formData,
    errors,
    categorias,
    documentTypes = [],
    handleChange,
    handleSubmit,
    buttonText,
    setCategoriasAsociadas
}) {
    const navigate = useNavigate();

    const categoriasOptions = categorias.map(cat => ({
        value: cat._id,
        label: cat.name
    }));

    const documentTypeOptions = documentTypes.map(doc => ({
        value: doc._id,
        label: `${doc.name} (${doc.abbreviation})`
    }));

    // Estilos reutilizables para inputs (actualizado con la validación en inglés)
    const inputClasses = `bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-full ${errors.document ? "focus:ring-red-500" : "focus:ring-yellow-400"}`;

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-min gap-10">

                {/* GRID RESPONSIVE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mt-6 px-4 md:px-20">

                    {/* TIPO DOCUMENTO REAL */}
                    <div className="flex flex-col gap-1 w-full">
                        <CustomSelect
                            label="Tipo de documento *"
                            icon={IdCard}
                            value={formData.documentType}
                            onChange={(value) => handleChange({ target: { name: "documentType", value } })}
                            options={documentTypeOptions}
                            placeholder="Seleccione un tipo de documento"
                            width="w-full"
                        />
                        <ValidationMessage error={errors.documentType} success={formData.documentType} successMessage="Tipo de documento válido" />
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} /> <span>Documento *</span>
                        </div>
                        <input
                            type="text"
                            name="document"
                            value={formData.document}
                            onChange={handleChange}
                            placeholder="Ingrese su documento"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.document} success={formData.document} successMessage="Documento válido" />
                    </div>

                    {/* NOMBRE PROVEEDOR */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} /> <span>Nombre Proveedor *</span>
                        </div>
                        <input
                            type="text"
                            name="providerName"
                            value={formData.providerName}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre del proveedor"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.providerName} success={formData.providerName} successMessage="Nombre de proveedor válido" />
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="flex flex-col gap-1 w-full">
                        <CustomSelect
                            label="Categorías Asociadas"
                            icon={User}
                            options={categoriasOptions}
                            value={formData.categoriesAssociated}
                            onChange={setCategoriasAsociadas}
                            multiple
                            placeholder="Seleccionar categorías"
                            width="w-full"
                        />
                    </div>

                    {/* NOMBRE CONTACTO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} /> <span>Nombre Contacto *</span>
                        </div>
                        <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre de contacto"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.contactName} success={formData.contactName} successMessage="Nombre de contacto válido" />
                    </div>

                    {/* TELÉFONO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} /> <span>Teléfono Contacto *</span>
                        </div>
                        <input
                            type="text"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="Ingrese el teléfono"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.contactPhone} success={formData.contactPhone} successMessage="Teléfono válido" />
                    </div>
                </div>

                {/* BOTONES */}
                <div className="flex justify-end mt-auto gap-4 px-4 md:px-20">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/providers")}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <span>✕</span>
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
        </>
    );
}