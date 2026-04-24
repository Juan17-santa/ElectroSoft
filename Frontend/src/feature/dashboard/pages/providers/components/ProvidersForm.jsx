import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User, X } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProviderForm({
    formData,
    errors,
    categorias,
    handleChange,
    handleSubmit,
    buttonText,
    onCancel,
    setCategoriasAsociadas
}) {
    const navigate = useNavigate();

    const categoriasOptions = categorias.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }));

    const isEdit = buttonText.toLowerCase().includes("actualizar");

    // Estilos reutilizables para inputs
    const inputClasses = `bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-full ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`;

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-min gap-10">

                {/* GRID RESPONSIVE: 1 columna en móvil, 2 en md */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mt-6 px-4 md:px-20">

                    {/* TIPO DOCUMENTO */}
                    <div className="flex flex-col gap-1 w-full">
                        <CustomSelect
                            label="Tipo de documento *"
                            icon={IdCard}
                            value={formData.tipoDoc}
                            onChange={(value) => handleChange({ target: { name: "tipoDoc", value } })}
                            options={[
                                { value: "CC", label: "C.C" },
                                { value: "CE", label: "C.E" },
                                { value: "NIT", label: "NIT" },
                                { value: "Pasaporte", label: "Pasaporte" },
                            ]}
                            placeholder="Seleccione un tipo de documento"
                            width="w-full"
                        />
                        <ValidationMessage error={errors.tipoDoc} success={formData.tipoDoc} successMessage="Tipo de documento valido" />
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} /> <span>Documento *</span>
                        </div>
                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            placeholder="Ingrese su documento"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.documento} success={formData.documento} successMessage="Documento valido" />
                    </div>

                    {/* NOMBRE PROVEEDOR */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} /> <span>Nombre Proveedor *</span>
                        </div>
                        <input
                            type="text"
                            name="nombreProveedor"
                            value={formData.nombreProveedor}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre del proveedor"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.nombreProveedor} success={formData.nombreProveedor} successMessage="Nombre de proveedor valido" />
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="flex flex-col gap-1 w-full">
                        <CustomSelect
                            label="Categorías Asociadas"
                            icon={User}
                            options={categoriasOptions}
                            value={formData.categoriasAsociadas}
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
                            name="nombreContacto"
                            value={formData.nombreContacto}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre de contacto"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.nombreContacto} success={formData.nombreContacto} successMessage="Nombre de contacto valido" />
                    </div>

                    {/* TELÉFONO */}
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} /> <span>Telefono Contacto *</span>
                        </div>
                        <input
                            type="text"
                            name="telefonoContacto"
                            value={formData.telefonoContacto}
                            onChange={handleChange}
                            placeholder="Ingrese el telefono"
                            className={inputClasses}
                        />
                        <ValidationMessage error={errors.telefonoContacto} success={formData.telefonoContacto} successMessage="Telefono valido" />
                    </div>
                </div>

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