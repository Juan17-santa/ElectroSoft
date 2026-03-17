import PrimaryButton from "../../../components/ui/PrimaryButton";
import { IdCard, FileText, User, X } from "lucide-react";
import ValidationMessage from "../../../components/ui/ValidationMessage"
import CustomSelect from "../../../components/ui/CustomSelect"
import { useState } from "react";
import ConfirmModal from "../../../components/ui/ConfirmModal"

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

    // CONVERTIR CATEGORIAS A OPCIONES
    const categoriasOptions = categorias.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }));

    // ESTADO PARA CONTROLAR VISIBILIDAD DEL MODAL
    const [showCancelModal, setShowCancelModal] = useState(false);

    // ESTADO PARA CAMBIAR LOS TEXTOS DEL MODAL
    const isEdit = buttonText.toLowerCase().includes("actualizar");

    return (
        <>
            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">

                <div className="flex flex-col items-center gap-14 mt-6 justify-around mx-28">

                    {/* PRIMERA FILA */}
                    <div className="flex gap-20">

                        {/* ================= TIPO DOCUMENTO ================= */}
                        <div className="flex flex-col gap-1 w-96">
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
                            <ValidationMessage
                                error={errors.tipoDoc}
                                success={formData.tipoDoc}
                                successMessage="Tipo de documento valido"
                            />
                        </div>

                        {/* ================= DOCUMENTO ================= */}
                        <div className="flex flex-col gap-1 w-96">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Documento *</span>
                            </div>
                            <input
                                type="text"
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                placeholder="Ingrese su documento"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                            ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.documento}
                                success={formData.documento}
                                successMessage="Documento valido"
                            />
                        </div>
                    </div>

                    {/* ================= SEGUNDA FILA ================= */}
                    <div className="flex gap-20">

                        {/* ================= NOMBRE PROVEEDOR ================= */}
                        <div className="flex flex-col gap-1 w-96">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <User size={16} />
                                <span>Nombre Proveedor *</span>
                            </div>
                            <input
                                type="text"
                                name="nombreProveedor"
                                value={formData.nombreProveedor}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre del proveedor"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                            ${errors.nombreProveedor ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.nombreProveedor}
                                success={formData.nombreProveedor}
                                successMessage="Nombre de proveedor valido"
                            />
                        </div>

                        {/* ================= CATEGORÍAS ASOCIADAS ================= */}
                        <CustomSelect
                            label="Categorías Asociadas"
                            icon={User}
                            options={categoriasOptions}
                            value={formData.categoriasAsociadas}
                            onChange={setCategoriasAsociadas}
                            multiple
                            placeholder="Seleccionar categorías"
                            width="w-96"
                        />
                    </div>

                    {/* ================= TERCERA FILA ================= */}
                    <div className="flex gap-20">

                        {/* ================= NOMBRE CONTACTO ================= */}
                        <div className="flex flex-col gap-1 w-96">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <User size={16} />
                                <span>Nombre Contacto *</span>
                            </div>
                            <input
                                type="text"
                                name="nombreContacto"
                                value={formData.nombreContacto}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre de contacto"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md 
                            ${errors.nombreContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.nombreContacto}
                                success={formData.nombreContacto}
                                successMessage="Nombre de contacto valido"
                            />
                        </div>

                        {/* ================= TELÉFONO CONTACTO ================= */}
                        <div className="flex flex-col gap-1 w-96">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <User size={16} />
                                <span>Telefono Contacto *</span>
                            </div>
                            <input
                                type="text"
                                name="telefonoContacto"
                                value={formData.telefonoContacto}
                                onChange={handleChange}
                                placeholder="Ingrese el telefono"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md 
                            ${errors.telefonoContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.telefonoContacto}
                                success={formData.telefonoContacto}
                                successMessage="Telefono valido"
                            />
                        </div>
                    </div>
                </div>

                {/* ================= BOTONES ================= */}
                <div className="flex justify-end gap-4 mt-auto">

                    {/* BOTON CANCELAR */}
                    <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
                    >
                        <X size={16} />
                        Cancelar
                    </button>

                    {/* BOTON PRINCIPAL (CREAR / ACTUALIZAR) */}
                    <PrimaryButton
                        type="submit"
                        disabled={Object.values(errors).some(error => error)}
                    >
                        {buttonText}
                    </PrimaryButton>
                </div>
            </form>
            {/* MODAL PARA CANCELAR CREACION O EDICION */}
            {showCancelModal && (
                <ConfirmModal
                    type="info"
                    title={isEdit ? "Cancelar edición" : "Cancelar creación"}
                    message={
                        isEdit
                            ? "Si cancelas la edición, los cambios realizados no se guardarán."
                            : "Si cancelas la creación, la información ingresada se perderá."
                    }
                    onConfirm={onCancel}
                    onCancel={() => setShowCancelModal(false)}
                />
            )}
        </>
    );
}