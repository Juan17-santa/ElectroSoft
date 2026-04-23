import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User, X } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useState } from "react";
import ConfirmModal from "../../../components/ui/ConfirmModal";

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
    const categoriasOptions = categorias.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }));

    const [showCancelModal, setShowCancelModal] = useState(false);
    const isEdit = buttonText.toLowerCase().includes("actualizar");

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">

                {/* GRID RESPONSIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 px-2 sm:px-4 md:px-10 xl:px-20">

                    {/* TIPO DOCUMENTO */}
                    <div className="flex flex-col gap-2">
                        <CustomSelect
                            label="Tipo de documento *"
                            icon={IdCard}
                            value={formData.tipoDoc}
                            onChange={(value) =>
                                handleChange({
                                    target: { name: "tipoDoc", value }
                                })
                            }
                            options={[
                                { value: "CC", label: "C.C" },
                                { value: "CE", label: "C.E" },
                                { value: "NIT", label: "NIT" },
                                { value: "Pasaporte", label: "Pasaporte" },
                            ]}
                            placeholder="Seleccione un tipo de documento"
                        />
                        <ValidationMessage error={errors.tipoDoc} success={formData.tipoDoc} />
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <FileText size={16} /> Documento *
                        </label>
                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base shadow-md border-2 ${errors.documento ? "border-red-500" : "border-transparent"}`}
                        />
                        <ValidationMessage error={errors.documento} success={formData.documento} />
                    </div>

                    {/* NOMBRE */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <User size={16} /> Nombre Proveedor *
                        </label>
                        <input
                            type="text"
                            name="nombreProveedor"
                            value={formData.nombreProveedor}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base shadow-md border-2 ${errors.nombreProveedor ? "border-red-500" : "border-transparent"}`}
                        />
                        <ValidationMessage error={errors.nombreProveedor} success={formData.nombreProveedor} />
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="flex flex-col gap-2">
                        <CustomSelect
                            label="Categorías Asociadas"
                            icon={User}
                            options={categoriasOptions}
                            value={formData.categoriasAsociadas}
                            onChange={setCategoriasAsociadas}
                            multiple
                            placeholder="Seleccionar categorías"
                        />
                    </div>

                    {/* CONTACTO */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <User size={16} /> Nombre Contacto *
                        </label>
                        <input
                            type="text"
                            name="nombreContacto"
                            value={formData.nombreContacto}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base shadow-md border-2 ${errors.nombreContacto ? "border-red-500" : "border-transparent"}`}
                        />
                        <ValidationMessage error={errors.nombreContacto} success={formData.nombreContacto} />
                    </div>

                    {/* TELÉFONO */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <User size={16} /> Teléfono *
                        </label>
                        <input
                            type="text"
                            name="telefonoContacto"
                            value={formData.telefonoContacto}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base shadow-md border-2 ${errors.telefonoContacto ? "border-red-500" : "border-transparent"}`}
                        />
                        <ValidationMessage error={errors.telefonoContacto} success={formData.telefonoContacto} />
                    </div>

                </div>

                {/* BOTONES */}
                <div className="
    flex justify-end gap-3 mt-8 px-4 md:px-20
    md:fixed md:bottom-16 md:right-6 md:z-50 md:mt-0
">

                    <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center justify-center gap-2 cursor-pointer bg-gray-200 hover:bg-gray-300 transition"
                    >
                        <X size={16} />
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={Object.values(errors).some(error => error)}
                        className="
        px-5 py-2 text-sm rounded-lg shadow-md font-medium 
        bg-linear-to-r from-white to-yellow-300 
        flex items-center justify-center gap-2 
        hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition
    "
                    >
                        {isEdit ? "Guardar cambios" : "Crear proveedor"}
                    </button>

                </div>
            </form>

            {/* MODAL */}
            {showCancelModal && (
                <ConfirmModal
                    type="info"
                    title={isEdit ? "Cancelar edición" : "Cancelar creación"}
                    message="Se perderán los datos ingresados"
                    onConfirm={onCancel}
                    onCancel={() => setShowCancelModal(false)}
                />
            )}
        </>
    );
}