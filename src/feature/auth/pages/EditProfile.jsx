import { useNavigate } from "react-router-dom";
import { X, User, Mail, Phone, Shield, Lock, Image, FileText, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "../../dashboard/components/ui/alert";
import Modal from "../components/Modal";
import PrimaryButton from "../../dashboard/components/ui/PrimaryButton";
import CustomSelect from "../../dashboard/components/ui/CustomSelect";
import useEditProfile, { getPasswordStrength } from "../hooks/useEditProfile";
import api from "../../../utils/api.js";

// ── InputField ───────────────────────────────────────────────────────────────
function InputField({ icon: Icon, label, name, value, onChange, placeholder, error, touched, type = "text", disabled = false, showToggle, onToggle, showValue }) {
    const hasSuccess = touched && !error && value;

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                <Icon size={16} />
                <span>{label}{!disabled && " *"}</span>
            </div>
            <div className="relative">
                <input
                    type={showToggle ? (showValue ? "text" : "password") : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition
                        ${disabled ? "cursor-not-allowed opacity-60" : ""}
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400" : ""}
                        ${hasSuccess ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
                        ${!touched || (!error && !hasSuccess) ? "focus:ring-yellow-400" : ""}
                        ${showToggle ? "pr-10" : ""}`}
                />
                {showToggle && (
                    <button type="button" onClick={onToggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition">
                        {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {touched && error && <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{error}</p>}
            {hasSuccess && <p className="text-green-600 text-xs flex items-center gap-1"><span>✓</span>Correcto</p>}
        </div>
    );
}

// ── PasswordFieldWithStrength ─────────────────────────────────────────────────
function PasswordFieldWithStrength({ label, name, value, onChange, error, touched, showValue, onToggle }) {
    const strength = getPasswordStrength(value);
    const hasSuccess = touched && !error && value;

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Lock size={16} /> {label}
            </label>
            <div className="relative">
                <input
                    type={showValue ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder="Ingrese la contraseña"
                    className={`w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 transition pr-10
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400" : ""}
                        ${hasSuccess ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
                        ${!touched || (!error && !hasSuccess) ? "focus:ring-yellow-400" : ""}`}
                />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition">
                    {showValue ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {touched && error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>
            )}
            {hasSuccess && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><span>✓</span>Contraseña válida</p>
            )}
            {value && !error && (
                <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength?.bar}`} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        {["Poco segura", "Segura", "Muy segura"].map((lbl, i) => (
                            <span key={lbl} className={`text-xs font-medium transition-colors duration-200
                                ${strength?.bars > i ? strength?.color : "text-gray-300"}`}>
                                {lbl}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── PasswordSimpleField ───────────────────────────────────────────────────────
function PasswordSimpleField({ label, name, value, onChange, error, touched, showValue, onToggle, placeholder = "Ingrese la contraseña" }) {
    const hasSuccess = touched && !error && value;

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Lock size={16} /> {label}
            </label>
            <div className="relative">
                <input
                    type={showValue ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 transition pr-10
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400" : ""}
                        ${hasSuccess ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
                        ${!touched || (!error && !hasSuccess) ? "focus:ring-yellow-400" : ""}`}
                />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition">
                    {showValue ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {touched && error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>
            )}
            {hasSuccess && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><span>✓</span>Correcto</p>
            )}
        </div>
    );
}

// ── EditProfile ──────────────────────────────────────────────────────────────
export default function EditProfile() {
    const navigate = useNavigate();

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);

    // Cargar tipos de documento del backend
    useEffect(() => {
        const loadDocumentTypes = async () => {
            try {
                const response = await api.get("/documentTypes");
                setDocumentTypes(response.data.data.map(d => ({
                    value: d._id.toString(),
                    label: d.abbreviation,
                })));
            } catch (error) {
                console.error("Error cargando tipos de documento:", error);
            }
        };
        loadDocumentTypes();
    }, []);

    const {
        formData,
        passwordData,
        showPasswordSection,
        setShowPasswordSection,
        errors,
        touched,
        passwordTouched,
        loading,
        alert,
        setAlert,
        fileRef,
        success,
        handleChange,
        handlePasswordChange,
        handleAvatarChange,
        handleSubmit,
        handleChangePassword,
    } = useEditProfile();

    useEffect(() => {
        if (success) navigate(-1);
    }, [success]);

    return (
        <div className="bg-gray-100 p-3 sm:p-6 rounded-2xl flex flex-col gap-4 sm:gap-6 w-full h-full shadow-inner overflow-y-auto">

            {/* ALERTA */}
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* MODAL CAMBIAR CONTRASEÑA */}
            {showPasswordSection && (
                <Modal onClose={() => setShowPasswordSection(false)}>
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-1 tracking-wide">
                        Cambiar contraseña
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        Ingresa tu contraseña actual y define la nueva.
                    </p>

                    <div className="flex flex-col gap-5">
                        <PasswordSimpleField
                            label="Contraseña actual"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            error={errors.currentPassword}
                            touched={passwordTouched.currentPassword}
                            showValue={showCurrent}
                            onToggle={() => setShowCurrent(p => !p)}
                            placeholder="Ingresa tu contraseña actual"
                        />
                        <PasswordFieldWithStrength
                            label="Nueva contraseña"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            error={errors.newPassword}
                            touched={passwordTouched.newPassword}
                            showValue={showNew}
                            onToggle={() => setShowNew(p => !p)}
                        />
                        <PasswordSimpleField
                            label="Confirmar contraseña"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            error={errors.confirmPassword}
                            touched={passwordTouched.confirmPassword}
                            showValue={showConfirm}
                            onToggle={() => setShowConfirm(p => !p)}
                            placeholder="Confirma la nueva contraseña"
                        />
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setShowPasswordSection(false)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-xl transition"
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleChangePassword}
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            Confirmar
                        </button>
                    </div>
                </Modal>
            )}

            {/* FORMULARIO */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-4 sm:p-8 md:p-12 flex flex-col gap-4 sm:gap-6 overflow-hidden mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold">Editar perfil</p>
                        <p className="text-xs sm:text-sm text-gray-600">Actualiza tu información y foto de perfil</p>
                    </div>
                    <button type="button" onClick={() => navigate(-1)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-yellow-400" />
                    ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-100 ring-2 ring-yellow-400 flex items-center justify-center text-yellow-400">
                            <User size={30} />
                        </div>
                    )}
                    <button type="button" onClick={() => fileRef.current.click()}
                        className="flex flex-col items-center gap-1 text-yellow-500 hover:text-yellow-600 transition">
                        <Image size={20} />
                        <span className="text-xs sm:text-sm font-semibold">Cambiar foto</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-8 w-full">

                    {/* FILA 1 — Tipo doc y Documento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <div className="flex flex-col gap-1 w-full">
                            <CustomSelect
                                label="Tipo documento *"
                                icon={FileText}
                                value={formData.tipoDoc?.toString() || ""}
                                onChange={(value) =>
                                    handleChange({ target: { name: "tipoDoc", value } })
                                }
                                options={documentTypes}
                                placeholder="Seleccione un tipo"
                            />
                            {touched.tipoDoc && errors.tipoDoc && (
                                <p className="text-red-500 text-xs flex items-center gap-1">
                                    <span>⚠</span>{errors.tipoDoc}
                                </p>
                            )}
                            {touched.tipoDoc && !errors.tipoDoc && formData.tipoDoc && (
                                <p className="text-green-600 text-xs flex items-center gap-1">
                                    <span>✓</span>Correcto
                                </p>
                            )}
                        </div>
                        <InputField
                            icon={User} label="Documento" name="documento"
                            value={formData.documento} onChange={handleChange}
                            placeholder="Ingrese el documento"
                            error={errors.documento} touched={touched.documento}
                        />
                    </div>

                    {/* FILA 2 — Nombre y Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <InputField
                            icon={User} label="Nombre completo" name="nombre"
                            value={formData.nombre} onChange={handleChange}
                            placeholder="Ingrese el nombre"
                            error={errors.nombre} touched={touched.nombre}
                        />
                        <InputField
                            icon={Mail} label="Email" name="email"
                            value={formData.email} onChange={handleChange}
                            placeholder="Ingrese el email"
                            error={errors.email} touched={touched.email}
                        />
                    </div>

                    {/* FILA 3 — Teléfono y Rol */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <InputField
                            icon={Phone} label="Teléfono" name="telefono"
                            value={formData.telefono} onChange={handleChange}
                            placeholder="Ingrese el teléfono"
                            error={errors.telefono} touched={touched.telefono}
                        />
                        <InputField
                            icon={Shield} label="Rol" name="rol"
                            value={formData.rol} onChange={handleChange}
                            error={false} touched={false} placeholder="" disabled
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPasswordSection(true)}
                        className="text-sm font-semibold text-blue-600 hover:underline self-start"
                    >
                        ¿Deseas cambiar tu contraseña?
                    </button>

                    <div className="flex justify-end gap-4 w-full">
                        <PrimaryButton type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Editar Perfil"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}