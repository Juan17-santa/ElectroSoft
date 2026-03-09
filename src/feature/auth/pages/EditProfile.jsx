import { useNavigate } from "react-router-dom";
import { X, User, Mail, Phone, Shield, Lock, Image, FileText, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Alert from "../../dashboard/components/ui/Alert";
import Modal from "../components/Modal";
import PrimaryButton from "../../dashboard/components/ui/PrimaryButton";
import useEditProfile, { getPasswordStrength } from "../hooks/useEditProfile";

// ── InputField ───────────────────────────────────────────────────────────────
function InputField({ icon: Icon, label, name, value, onChange, placeholder, error, touched, type = "text", disabled = false, showToggle, onToggle, showValue }) {
    const hasSuccess = touched && !error && value;

    return (
        <div className="flex flex-col gap-1 w-80">
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
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"       : ""}
                        ${hasSuccess       ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
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
            {hasSuccess        && <p className="text-green-600 text-xs flex items-center gap-1"><span>✓</span>Correcto</p>}
        </div>
    );
}

// ── SelectField ──────────────────────────────────────────────────────────────
function SelectField({ icon: Icon, label, name, value, onChange, options, error, touched }) {
    const hasSuccess = touched && !error && value;

    return (
        <div className="flex flex-col gap-1 w-80">
            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                <Icon size={16} />
                <span>{label} *</span>
            </div>
            <select name={name} value={value} onChange={onChange}
                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition
                    ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"       : ""}
                    ${hasSuccess       ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
                    ${!touched || (!error && !hasSuccess) ? "focus:ring-yellow-400" : ""}`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} hidden={opt.hidden}>{opt.label}</option>
                ))}
            </select>
            {touched && error && <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{error}</p>}
            {hasSuccess        && <p className="text-green-600 text-xs flex items-center gap-1"><span>✓</span>Correcto</p>}
        </div>
    );
}

// ── PasswordField con fortaleza ───────────────────────────────────────────────
function PasswordFieldWithStrength({ label, name, value, onChange, error, touched, showValue, onToggle }) {
    const strength   = getPasswordStrength(value);
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
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"       : ""}
                        ${hasSuccess       ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
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

            {/* Barra de fortaleza */}
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
                        ${touched && error ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"       : ""}
                        ${hasSuccess       ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400" : ""}
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
    const navigate    = useNavigate();
    const handleClose = () => navigate("/dashboard/users");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
        handleChange,
        handlePasswordChange,
        handleAvatarChange,
        handleSubmit,
        handleChangePassword,
    } = useEditProfile(handleClose);

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            {/* ── Alert global ── */}
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* ════════════════════════════════════════════════════
                MODAL CAMBIAR CONTRASEÑA — flotante con Modal.jsx,
                contenido con estilo de ResetPassword
            ════════════════════════════════════════════════════ */}
            {showPasswordSection && (
                <Modal onClose={() => setShowPasswordSection(false)}>

                    {/* Título estilo ResetPassword */}
                    <h2 className="text-2xl font-semibold text-center mb-1 tracking-wide">
                        Cambiar contraseña
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        Ingresa tu contraseña actual y define la nueva.
                    </p>

                    <div className="flex flex-col gap-5">

                        {/* Contraseña actual */}
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

                        {/* Nueva contraseña + barra de fortaleza */}
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

                        {/* Confirmar contraseña */}
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

                    {/* Botones estilo ResetPassword */}
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

            {/* ════════════════════════════════════════════════════
                FORMULARIO EDITAR PERFIL
            ════════════════════════════════════════════════════ */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-12 flex flex-col gap-2 overflow-hidden justify-center mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xl font-semibold">Editar perfil</p>
                        <p className="text-sm text-gray-600">Actualiza tu información y foto de perfil</p>
                    </div>
                    <button onClick={handleClose}><X size={20} /></button>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-yellow-400" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-yellow-100 ring-2 ring-yellow-400 flex items-center justify-center text-yellow-400">
                            <User size={36} />
                        </div>
                    )}
                    <button onClick={() => fileRef.current.click()}
                        className="flex flex-col items-center gap-1 text-yellow-500 hover:text-yellow-600 transition">
                        <Image size={22} />
                        <span className="text-sm font-semibold">Cambiar foto</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Formulario */}
                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-8 w-full">

                    <div className="flex flex-wrap gap-8 justify-between">
                        <SelectField
                            icon={FileText} label="Tipo documento" name="documentType"
                            value={formData.documentType} onChange={handleChange}
                            touched={touched.documentType} error={errors.documentType}
                            options={[
                                { value: "",          label: "Seleccione un tipo", hidden: true },
                                { value: "C.C",       label: "C.C" },
                                { value: "T.I",       label: "T.I" },
                                { value: "C.E",       label: "C.E" },
                                { value: "Pasaporte", label: "Pasaporte" },
                            ]}
                        />
                        <InputField icon={User} label="Documento" name="document"
                            value={formData.document} onChange={handleChange}
                            placeholder="Ingrese el documento"
                            error={errors.document} touched={touched.document} />
                    </div>

                    <div className="flex flex-wrap gap-8 justify-between">
                        <InputField icon={User} label="Nombre completo" name="fullName"
                            value={formData.fullName} onChange={handleChange}
                            placeholder="Ingrese el nombre"
                            error={errors.fullName} touched={touched.fullName} />
                        <InputField icon={Mail} label="Email" name="email"
                            value={formData.email} onChange={handleChange}
                            placeholder="Ingrese el email"
                            error={errors.email} touched={touched.email} />
                    </div>

                    <div className="flex flex-wrap gap-8 justify-between">
                        <InputField icon={Phone} label="Teléfono" name="phone"
                            value={formData.phone} onChange={handleChange}
                            placeholder="Ingrese el teléfono"
                            error={errors.phone} touched={touched.phone} />
                        <InputField icon={Shield} label="Rol" name="role"
                            value={formData.role} onChange={handleChange}
                            error={false} touched={false} placeholder="" disabled />
                    </div>

                    <button type="button" onClick={() => setShowPasswordSection(true)}
                        className="text-sm font-semibold text-blue-600 hover:underline mb-2 self-start">
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