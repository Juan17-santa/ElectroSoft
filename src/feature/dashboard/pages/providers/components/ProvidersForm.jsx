import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User, Mail, MapPin, Package, Phone, Building2 } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../../../components/ui/CategorySelect";

export default function ProviderForm({
    formData,
    errors,
    categorias,
    documentTypes = [],
    handleChange,
    handleBlur,
    handleSubmit,
    buttonText,
    setCategoriasAsociadas,
    loading,
    checkingUnique = {},
    isNatural,
    isJuridica
}) {
    const navigate = useNavigate();

    const categoriasOptions = categorias.map(cat => ({
        id: cat._id,
        name: cat.name,
        status: cat.status
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-min gap-8">

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
                            className={`rounded-2xl border-2 p-5 bg-white text-left transition-all duration-300 cursor-pointer ${isNatural
                                ? "border-yellow-400 shadow-lg"
                                : "border-gray-200 hover:border-yellow-300"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isNatural ? "border-yellow-400" : "border-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${isNatural ? "bg-yellow-400 scale-100" : "scale-0"
                                            }`}
                                    />
                                </span>

                                <User size={18} className="text-yellow-400 shrink-0" />

                                <div className="flex flex-col">
                                    <h3 className="font-bold text-sm leading-tight">
                                        Persona Natural
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">
                                        Ofrece productos o servicios a título personal.
                                    </p>
                                </div>
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
                            className={`rounded-2xl border-2 p-5 bg-white text-left transition-all duration-300 cursor-pointer ${isJuridica
                                ? "border-yellow-400 shadow-lg"
                                : "border-gray-200 hover:border-yellow-300"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isJuridica ? "border-yellow-400" : "border-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${isJuridica ? "bg-yellow-400 scale-100" : "scale-0"
                                            }`}
                                    />
                                </span>

                                <Building2 size={18} className="text-yellow-400 shrink-0" />

                                <div className="flex flex-col">
                                    <h3 className="font-bold text-sm leading-tight">
                                        Persona Jurídica
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">
                                        Empresas o entidades registradas con NIT.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="px-4 md:px-20 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Datos del proveedor
                    </h3>
                </div>

                {/* GRID RESPONSIVE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16 px-4 md:px-20">

                    {/* TIPO DOCUMENTO (SOLO PERSONA NATURAL) */}
                    {isNatural && (
                        <div className="flex flex-col gap-1 w-full">
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

                            <ValidationMessage
                                error={errors.documentType}
                                success={formData.documentType}
                                successMessage="Tipo de documento válido"
                            />
                        </div>
                    )}

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
                            onBlur={handleBlur}
                            placeholder={isNatural ? "Ingrese el documento" : "Ingrese el NIT"}
                            className={getInputClasses("document")}
                        />
                        <ValidationMessage
                            error={errors.document}
                            success={formData.document && !checkingUnique.document}
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
                            maxLength={100}
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

                    {/* EMAIL EMPRESA */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <Mail size={16} />
                            <span>
                                {isNatural ? "Correo electrónico *" : "Correo de la empresa *"}
                            </span>
                        </div>
                        <input
                            type="email"
                            name="providerEmail"
                            value={formData.providerEmail}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={isNatural ? "Ingrese el correo electrónico" : "Ingrese el correo de la empresa"}
                            className={getInputClasses("providerEmail")}
                        />
                        <ValidationMessage
                            error={errors.providerEmail}
                            success={formData.providerEmail && !checkingUnique.providerEmail}
                            successMessage="Correo válido"
                        />
                    </div>

                    {/* TELÉFONO EMPRESA */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <Phone size={16} />
                            <span>
                                {isNatural ? "Teléfono *" : "Teléfono de la empresa *"}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="providerPhone"
                            value={formData.providerPhone}
                            onChange={handleChange}
                            placeholder={isNatural ? "Ingrese el teléfono" : "Ingrese el teléfono de la empresa"}
                            className={getInputClasses("providerPhone")}
                        />
                        <ValidationMessage
                            error={errors.providerPhone}
                            success={formData.providerPhone}
                            successMessage="Teléfono válido"
                        />
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

                    {isJuridica && (
                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                Datos de contacto
                            </h3>
                        </div>
                    )}

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
                                maxLength={100}
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

                    {/* EMAIL CONTACTO (SOLO JURIDICA) */}
                    {isJuridica && (
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <Mail size={16} />
                                <span>Correo electrónico del contacto *</span>
                            </div>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Ingrese el correo del contacto"
                                className={getInputClasses("contactEmail")}
                            />
                            <ValidationMessage
                                error={errors.contactEmail}
                                success={formData.contactEmail && !checkingUnique.contactEmail}
                                successMessage="Correo válido"
                            />
                        </div>
                    )}

                    {/* TELÉFONO CONTACTO (SOLO JURIDICA) */}
                    {isJuridica && (
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <Phone size={16} />
                                <span>Teléfono del contacto *</span>
                            </div>
                            <input
                                type="text"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="Ingrese el teléfono del contacto"
                                className={getInputClasses("contactPhone")}
                            />
                            <ValidationMessage
                                error={errors.contactPhone}
                                success={formData.contactPhone}
                                successMessage="Teléfono válido"
                            />
                        </div>
                    )}

                    <div className="md:col-span-2 mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Categorías asociadas
                        </h3>
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="flex flex-col gap-1 w-full">
                        <CategorySelect
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
                        loading={loading}
                        disabled={Object.values(errors).some(error => error)}
                    >
                        {buttonText}
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
}