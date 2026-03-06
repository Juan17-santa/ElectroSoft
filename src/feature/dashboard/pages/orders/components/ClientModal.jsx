import { X, User, Mail, Phone, FileText, IdCard, CheckCircle2, Import } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { useClientModal } from "../hooks/UseClientModal";
import { useState } from "react";
import Alert from "../../../components/ui/alert";
import ValidationMessage from "../../../components/ui/ValidationMessage";

export default function ClientModal({ onClose, onSave }) {

    // ESTADO PARA LA ALERTA
    const [alert, setAlert] = useState(null);

    const {
        formData,
        errors,
        handleChange,
        handleSubmit
    } = useClientModal((clienteRecibido) => {
        setAlert({
            type: "success",
            message: "Cliente creado exitosamente"
        });

        // ENVIAMOS LOS DATOS REALES AL PADRE
        if (onSave) onSave(clienteRecibido);

        setTimeout(() => {
            onClose();
        }, 4000);
    }, onClose);

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
                                Crear <span className="text-yellow-400">cliente</span>
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* ================= FILA 1 ================= */}
                        <div className="grid grid-cols-2 gap-6">

                            {/* TIPO DOCUMENTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <IdCard size={16} />
                                    <span>Tipo de documento *</span>
                                </div>

                                <select
                                    name="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.tipoDocumento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                >
                                    <option value="" hidden>Seleccione un tipo</option>
                                    <option value="NIT">NIT</option>
                                    <option value="CC">C.C</option>
                                    <option value="CE">C.E</option>
                                </select>

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
                        <div className="grid grid-cols-2 gap-6">

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
                        <div className="grid grid-cols-2 gap-6">

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
                                    placeholder="correo@ejemplo.com"
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
                                    placeholder="3001234567"
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
                                Guardar cliente
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
            {/* ALERTA */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}