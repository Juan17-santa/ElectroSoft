import { X, User, Mail, Phone, FileText, IdCard } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { useClientModal } from "../hooks/UseClientModal";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useEffect } from "react";
import { useToast } from "../../../../../context/ToastContext";

// COMPONENTE PRINCIPAL DE LA MODAL DE CREAR CLIENTE
export default function ClientModal({ onClose, onSave }) {
    const { showToast } = useToast();

    // CONFIGURACIÓN DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        documentTypes,
        formError,
        setFormError
    } = useClientModal((clienteRecibido) => {
        if (onSave) onSave(clienteRecibido);

        setTimeout(() => {
            onClose();
        }, 4000);
    }, onClose);

    useEffect(() => {
        if (formError) {
            showToast("error", formError);
            setFormError("");
        }
    }, [formError, showToast, setFormError]);

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* CARD */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-lg font-semibold">
                                Nuevo cliente
                            </p>
                            <p className="text-xs text-gray-500">
                                Complete la información del cliente
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">

                        {/* ================= FILA 1 ================= */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* TIPO DOCUMENTO */}
                            <div className="flex flex-col gap-2">
                                <CustomSelect
                                    label="Tipo de documento *"
                                    icon={IdCard}
                                    value={formData.tipoDocumento}
                                    onChange={(value) =>
                                        handleChange({
                                            target: { name: "tipoDocumento", value }
                                        })
                                    }
                                    options={documentTypes.map(tipo => ({
                                        value: tipo._id,
                                        label: `${tipo.name} (${tipo.abbreviation})`
                                    }))}
                                    placeholder="Seleccione un tipo"
                                />

                                <ValidationMessage
                                    error={errors.tipoDocumento}
                                    success={formData.tipoDocumento}
                                    successMessage="Tipo de documento válido"
                                />
                            </div>

                            {/* DOCUMENTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <FileText size={16} />
                                    <span>Documento *</span>
                                </div>

                                <input
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    placeholder="Ingrese documento"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                    ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />

                                <ValidationMessage
                                    error={errors.documento}
                                    success={formData.documento}
                                    successMessage="Documento válido"
                                />
                            </div>

                        </div>

                        {/* ================= FILA 2 ================= */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* NOMBRES */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <User size={16} />
                                    <span>Nombres *</span>
                                </div>

                                <input
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    maxLength={40}
                                    placeholder="Ingrese nombres"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                    ${errors.nombres ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />

                                <ValidationMessage
                                    error={errors.nombres}
                                    success={formData.nombres}
                                    successMessage="Nombres válidos"
                                />
                            </div>

                            {/* APELLIDOS */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <User size={16} />
                                    <span>Apellidos *</span>
                                </div>

                                <input
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    maxLength={40}
                                    placeholder="Ingrese apellidos"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                    ${errors.apellidos ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />
                                <ValidationMessage
                                    error={errors.apellidos}
                                    success={formData.apellidos}
                                    successMessage="Apellidos válidos"
                                />
                            </div>

                        </div>

                        {/* ================= FILA 3 ================= */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                            {/* EMAIL */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <Mail size={16} />
                                    <span>Email *</span>
                                </div>

                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ingrese su email"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                    ${errors.email ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />

                                <ValidationMessage
                                    error={errors.email}
                                    success={formData.email}
                                    successMessage="Email válido"
                                />
                            </div>

                            {/* TELEFONO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <Phone size={16} />
                                    <span>Teléfono *</span>
                                </div>

                                <input
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="Digite su telefono"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                    ${errors.telefono ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />

                                <ValidationMessage
                                    error={errors.telefono}
                                    success={formData.telefono}
                                    successMessage="Telefono válido"
                                />
                            </div>

                        </div>

                        {/* ================= BOTONES ================= */}
                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2.5 rounded-lg text-sm font-medium shadow cursor-pointer"
                            >
                                Cancelar
                            </button>

                            <PrimaryButton
                                type="submit"
                                disabled={Object.values(errors).some(error => error)}
                            >
                                Crear cliente
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}