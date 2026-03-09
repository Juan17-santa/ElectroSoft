import { useState, useEffect, useRef } from "react";
import { getAuthUser, updateProfile, changePassword } from "../services/authService";
import { Validations } from "../../../utils/validations";

// ── Fortaleza de contraseña ──────────────────────────────────────────────────
export const getPasswordStrength = (value) => {
    if (!value) return null;
    let score = 0;
    if (value.length >= 6)           score++;
    if (value.length >= 10)          score++;
    if (/[A-Z]/.test(value))         score++;
    if (/[0-9]/.test(value))         score++;
    if (/[^a-zA-Z0-9]/.test(value))  score++;

    if (score <= 2) return { label: "Poco segura", color: "text-red-500",    bar: "w-1/3 bg-red-400",    bars: 1 };
    if (score <= 3) return { label: "Segura",      color: "text-yellow-500", bar: "w-2/3 bg-yellow-400", bars: 2 };
    return            { label: "Muy segura",        color: "text-green-600",  bar: "w-full bg-green-500", bars: 3 };
};

export default function useEditProfile(onClose) {
    const [formData, setFormData] = useState({
        documentType: "",
        document: "",
        fullName: "",
        email: "",
        phone: "",
        role: "",
        avatar: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [touched,             setTouched]             = useState({});
    const [passwordTouched,     setPasswordTouched]     = useState({});
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);
    const [alert,   setAlert]   = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        const user = getAuthUser();
        if (user) {
            setFormData({
                documentType: user.documentType || user.tipoDocumento || "",
                document:     user.document     || user.documento     || "",
                fullName:     user.fullName      || user.nombre        || "",
                email:        user.email         || "",
                phone:        user.phone         || user.telefono      || "",
                role:         user.role          || user.rol           || "",
                avatar:       user.avatar        || "",
            });
        }
    }, []);

    // ── Validación individual - perfil ───────────────────────────────────────
    const validateField = (name, value) => {
        switch (name) {
            case "documentType":
                return !Validations.campoRequerido(value)
                    ? "Selecciona un tipo de documento."
                    : "";

            case "document":
                if (!Validations.campoRequerido(value)) return "El documento es obligatorio.";
                if (!Validations.soloNumeros(value))    return "Solo se permiten números.";
                if (value.length < 8)                   return "Mínimo 8 dígitos.";
                return "";

            case "fullName":
                if (!Validations.campoRequerido(value)) return "El nombre es obligatorio.";
                if (!Validations.soloLetras(value))     return "Solo se permiten letras.";
                if (value.trim().length < 3)            return "Mínimo 3 caracteres.";
                return "";

            case "email":
                if (!Validations.campoRequerido(value)) return "El email es obligatorio.";
                if (!Validations.formatoEmail(value))   return "Ingresa un email válido.";
                return "";

            case "phone":
                if (!Validations.campoRequerido(value)) return "El teléfono es obligatorio.";
                if (!Validations.soloNumeros(value))    return "Solo se permiten números.";
                if (value.length < 7)                   return "Mínimo 7 dígitos.";
                return "";

            default:
                return "";
        }
    };

    // ── Validación individual - contraseña ───────────────────────────────────
    const validatePasswordField = (name, value, currentData) => {
        switch (name) {
            case "currentPassword":
                if (!Validations.campoRequerido(value)) return "La contraseña actual es obligatoria.";
                return "";

            case "newPassword":
                if (!Validations.campoRequerido(value)) return "La nueva contraseña es obligatoria.";
                if (value.length < 6)                   return "Mínimo 6 caracteres.";
                return "";

            case "confirmPassword": {
                const newPass = currentData?.newPassword ?? passwordData.newPassword;
                if (!Validations.campoRequerido(value)) return "Debes confirmar la contraseña.";
                if (value !== newPass)                  return "Las contraseñas no coinciden.";
                return "";
            }

            default:
                return "";
        }
    };

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched((prev)  => ({ ...prev, [name]: true }));
        setErrors((prev)   => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...passwordData, [name]: value };
        setPasswordData(updatedData);
        setPasswordTouched((prev) => ({ ...prev, [name]: true }));

        const newErrors = { [name]: validatePasswordField(name, value, updatedData) };
        // Revalidar confirmación automáticamente si ya fue tocada
        if (name === "newPassword" && passwordTouched.confirmPassword) {
            newErrors.confirmPassword = validatePasswordField(
                "confirmPassword",
                updatedData.confirmPassword,
                updatedData
            );
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) =>
            setFormData((prev) => ({ ...prev, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // ── Validación completa al submit - perfil ───────────────────────────────
    const validate = () => {
        const fields     = ["documentType", "document", "fullName", "email", "phone"];
        const newErrors  = {};
        const newTouched = {};
        fields.forEach((f) => {
            newTouched[f] = true;
            const err = validateField(f, formData[f]);
            if (err) newErrors[f] = err;
        });
        setTouched((prev) => ({ ...prev, ...newTouched }));
        setErrors((prev)  => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // ── Validación completa al submit - contraseña ───────────────────────────
    const validatePassword = () => {
        const fields     = ["currentPassword", "newPassword", "confirmPassword"];
        const newErrors  = {};
        const newTouched = {};
        fields.forEach((f) => {
            newTouched[f] = true;
            const err = validatePasswordField(f, passwordData[f], passwordData);
            if (err) newErrors[f] = err;
        });
        setPasswordTouched((prev) => ({ ...prev, ...newTouched }));
        setErrors((prev)          => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit perfil ────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!validate()) return;
        setLoading(true);

        const payload = {
            documentType:  formData.documentType,
            tipoDocumento: formData.documentType,
            document:      formData.document,
            documento:     formData.document,
            fullName:      formData.fullName,
            nombre:        formData.fullName,
            email:         formData.email,
            phone:         formData.phone,
            telefono:      formData.phone,
            role:          formData.role,
            rol:           formData.role,
            avatar:        formData.avatar,
        };

        const result = updateProfile(payload);
        setLoading(false);

        if (result.ok) {
            setAlert({ type: "success", message: "Tu perfil fue actualizado correctamente." });
            setTimeout(() => { if (onClose) onClose(); }, 2500);
        } else {
            setAlert({ type: "error", message: result.message || "No se pudo actualizar el perfil." });
        }
    };

    // ── Submit contraseña ────────────────────────────────────────────────────
    const handleChangePassword = () => {
        if (!validatePassword()) return;

        const result = changePassword(
            passwordData.currentPassword,
            passwordData.newPassword
        );

        if (result.ok) {
            setAlert({ type: "success", message: "Tu contraseña fue cambiada correctamente." });
            setShowPasswordSection(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordTouched({});
        } else {
            setAlert({ type: "error", message: result.message || "No se pudo cambiar la contraseña." });
        }
    };

    return {
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
    };
}