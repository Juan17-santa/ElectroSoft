import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User, Mail, MapPin, Package, Phone } from "lucide-react";
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
    setCategoriasAsociadas,
    isNatural,
    isJuridica
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

    const getInputClasses = (field) =>
        `bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-full ${errors[field]
            ? "focus:ring-red-500"
            : "focus:ring-yellow-400"
        }`;

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-min gap-10">

                {/* TIPO DE PROVEEDOR */}
                <div className="flex justify-center px-4 md:px-20 mt-4">
                    <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">

                        {/* PERSONA NATURAL */}
                        <button
                            type="button"
                            onClick={() =>
                                handleChange({
                                    target: {
                                        name: "providerType",
                                        value: "NATURAL"
                                    }
                                })
                            }
                            className={`rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer ${isNatural
                                ? "border-yellow-400 bg-yellow-50 shadow-lg"
                                : "border-gray-200 bg-white hover:border-yellow-300"
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-5xl">👤</span>

                                <h3 className="font-bold text-lg">
                                    Persona Natural
                                </h3>

                                <p className="text-sm text-gray-500 text-center">
                                    Personas que ofrecen productos o servicios a título personal.
                                </p>

                            </div>
                        </button>

                        {/* PERSONA JURÍDICA */}

                        <button
                            type="button"
                            onClick={() =>
                                handleChange({
                                    target: {
                                        name: "providerType",
                                        value: "JURIDICA"
                                    }
                                })
                            }
                            className={`rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer ${isJuridica
                                ? "border-yellow-400 bg-yellow-50 shadow-lg"
                                : "border-gray-200 bg-white hover:border-yellow-300"
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-5xl">🏢</span>

                                <h3 className="font-bold text-lg">
                                    Persona Jurídica
                                </h3>

                                <p className="text-sm text-gray-500 text-center">
                                    Empresas, sociedades o entidades registradas con NIT.
                                </p>

                            </div>
                        </button>

                    </div>
                </div>

                {/* GRID RESPONSIVE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-24 gap-x-16 mt-6 px-4 md:px-20">

                    {/* TIPO DOCUMENTO */}
                    <div className="flex flex-col gap-1 w-full">

                        {isNatural ? (
                            <CustomSelect
                                label="Tipo de documento *"
                                icon={IdCard}
                                value={formData.documentType}
                                onChange={(value) =>
                                    handleChange({
                                        target: {
                                            name: "documentType",
                                            value
                                        }
                                    })
                                }
                                options={documentTypeOptions.filter(
                                    doc => !doc.label.includes("NIT")
                                )}
                                placeholder="Seleccione un tipo de documento"
                                width="w-full"
                            />

                        ) : (
                            <div className="flex flex-col gap-1">

                                <label className="text-yellow-400 font-medium flex items-center gap-2">
                                    <IdCard size={16} />
                                    Tipo de documento
                                </label>

                                <input
                                    value="NIT"
                                    disabled
                                    className="bg-gray-200 rounded-xl px-4 py-2.5 shadow-md text-gray-600"
                                />
                            </div>
                        )}
                        {isNatural && (
                            <ValidationMessage
                                error={errors.documentType}
                                success={formData.documentType}
                                successMessage="Tipo de documento válido"
                            />
                        )}
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} />
                            <span>
                                {isNatural ?
                                    "Documento *" : "NIT *"
                                }
                            </span>
                        </div>
                        <input
                            type="text"
                            name="document"
                            value={formData.document}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese el documento" : "Ingrese el NIT"}
                            className={getInputClasses("document")}
                        />
                        <ValidationMessage
                            error={errors.document}
                            success={formData.document}
                            successMessage="Documento válido" />
                    </div>

                    {/* NOMBRE PROVEEDOR */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>
                                {isNatural ? "Nombre completo *" : "Razón social *"}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="providerName"
                            value={formData.providerName}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese el nombre completo *" : "Ingrese la razón social *"}
                            className={getInputClasses("providerName")}
                        />
                        <ValidationMessage
                            error={errors.providerName}
                            success={formData.providerName}
                            successMessage={isNatural ? "Nombre válido" : "Razón social válida"}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <Mail size={16} />
                            <span>
                                {isNatural ? "Correo electrónico *" : "Correo del contacto *"}
                            </span>
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese el correo electrónico" : "Ingrese el correo del contacto"}
                            className={getInputClasses("email")}
                        />
                        <ValidationMessage
                            error={errors.email}
                            success={formData.email}
                            successMessage="Correo válido"
                        />
                    </div>

                    {/* NOMBRE CONTACTO (SOLO JURIDICA)*/}
                    {isJuridica && (
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
                                className={getInputClasses("contactName")}
                            />
                            <ValidationMessage 
                                error={errors.contactName} 
                                success={formData.contactName} 
                                successMessage="Nombre de contacto válido" 
                            />
                        </div>
                    )}

                    {/* TELÉFONO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <Phone size={16} />
                            <span>
                                {isNatural ? "Teléfono *" : "Teléfono contacto *"}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese el teléfono" : "Ingrese el teléfono del contacto"}
                            className={getInputClasses("contactPhone")}
                        />
                        <ValidationMessage error={errors.contactPhone} success={formData.contactPhone} successMessage="Teléfono válido" />
                    </div>

                    {/* DIRECCION */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <MapPin size={16} />
                            <span>Dirección *</span>
                        </div>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese su direccion" : "Ingrese la dirección de la empresa"}
                            className={getInputClasses("address")}
                        />
                        <ValidationMessage
                            error={errors.address}
                            success={formData.address}
                            successMessage="Dirección válida"
                        />
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="flex flex-col gap-1 w-full">
                        <CustomSelect
                            label="Categorías Asociadas"
                            icon={Package}
                            options={categoriasOptions}
                            value={formData.categoriesAssociated}
                            onChange={setCategoriasAsociadas}
                            multiple
                            placeholder="Seleccionar categorías"
                            width="w-full"
                        />
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