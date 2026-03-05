import { useNavigate } from "react-router-dom";
import { X, User, Mail, Phone, Shield, Lock, Image, FileText } from "lucide-react";
import Alert from "../../dashboard/components/ui/Alert";
import Modal from "../components/Modal";
import PrimaryButton from "../../dashboard/components/ui/PrimaryButton";
import useEditProfile from "../hooks/useEditProfile";

// ── InputField ───────────────────────────────────────────────────────────────
function InputField({ icon: Icon, label, name, value, onChange, placeholder, error, type = "text", disabled = false }) {
    return (
        <div className="flex flex-col gap-2 w-80">
            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                <Icon size={16} />
                <span>{label}{!disabled && " *"}</span>
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                    ${disabled ? "cursor-not-allowed opacity-60" : ""}
                    ${error ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ── SelectField ──────────────────────────────────────────────────────────────
function SelectField({ icon: Icon, label, name, value, onChange, options, error }) {
    return (
        <div className="flex flex-col gap-2 w-80">
            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                <Icon size={16} />
                <span>{label} *</span>
            </div>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2
                    ${error ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} hidden={opt.hidden}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ── EditProfile ──────────────────────────────────────────────────────────────
export default function EditProfile() {
    const navigate = useNavigate();
    const handleClose = () => navigate("/dashboard/users");

    const {
        formData,
        passwordData,
        showPasswordSection,
        setShowPasswordSection,
        errors,
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
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-12 flex flex-col gap-2 overflow-hidden justify-center mx-auto">

                {/* ── Header ── */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xl font-semibold">Editar perfil</p>
                        <p className="text-sm text-gray-600">Actualiza tu información y foto de perfil</p>
                    </div>
                    <button onClick={handleClose}><X size={20} /></button>
                </div>

                {/* ── Alert ── */}
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                {/* ── Modal cambiar contraseña ── */}
                {showPasswordSection && (
                    <Modal onClose={() => setShowPasswordSection(false)}>
                        <div className="flex flex-col gap-4">
                            {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                                <InputField
                                    key={field}
                                    icon={Lock}
                                    label={
                                        field === "currentPassword" ? "Contraseña actual" :
                                            field === "newPassword" ? "Nueva contraseña" :
                                                "Confirmar contraseña"
                                    }
                                    name={field}
                                    type="password"
                                    value={passwordData[field]}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    error={errors[field]}
                                />
                            ))}
                            <PrimaryButton onClick={handleChangePassword}>
                                Guardar contraseña
                            </PrimaryButton>
                        </div>
                    </Modal>
                )}

                {/* ── Avatar ── */}
                <div className="flex items-center gap-5">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-yellow-400" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-yellow-100 ring-2 ring-yellow-400 flex items-center justify-center text-yellow-400">
                            <User size={36} />
                        </div>
                    )}
                    <button onClick={() => fileRef.current.click()} className="flex flex-col items-center gap-1 text-yellow-500 hover:text-yellow-600 transition">
                        <Image size={22} />
                        <span className="text-sm font-semibold">Cambiar foto</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* ── Formulario ── */}
                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-8 w-full">

                    <div className="flex flex-wrap gap-8 justify-between">
                        <SelectField
                            icon={FileText}
                            label="Tipo documento"
                            name="documentType"
                            value={formData.documentType}
                            onChange={handleChange}
                            options={[
                                { value: "", label: "Seleccione un tipo", hidden: true },
                                { value: "C.C", label: "C.C" },
                                { value: "T.I", label: "T.I" },
                                { value: "C.E", label: "C.E" },
                                { value: "Pasaporte", label: "Pasaporte" },
                            ]}
                            error={errors.documentType}
                        />
                        <InputField icon={User} label="Documento" name="document" value={formData.document} onChange={handleChange} placeholder="Ingrese el documento" error={errors.document} />
                    </div>

                    <div className="flex flex-wrap gap-8 justify-between">
                        <InputField icon={User} label="Nombre completo" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Ingrese el nombre" error={errors.fullName} />
                        <InputField icon={Mail} label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="Ingrese el email" error={errors.email} />
                    </div>

                    <div className="flex flex-wrap gap-8 justify-between">
                        <InputField icon={Phone} label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ingrese el teléfono" error={errors.phone} />
                        <InputField
                            icon={Shield}
                            label="Rol"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            error={false}
                            type="text"
                            placeholder=""
                            disabled
                        />
                    </div>

                    <button type="button" onClick={() => setShowPasswordSection(true)} className="text-sm font-semibold text-blue-600 hover:underline mb-2 self-start">
                        ¿Deseas Cambiar tu contraseña?
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