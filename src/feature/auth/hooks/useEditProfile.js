import api from "../../../utils/api.js";
import { useState, useEffect, useRef } from "react";
import { getAuthUser, updateProfile, changePassword } from "../services/authService";
import { Validations } from "../../../utils/validations";
import { useToast } from "../../../context/ToastContext";

export const getPasswordStrength = (value) => {
    if (!value) return null;
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 10) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;

    if (score <= 2) return { label: "Poco segura", color: "text-red-500", bar: "w-1/3 bg-red-400", bars: 1 };
    if (score <= 3) return { label: "Segura", color: "text-yellow-500", bar: "w-2/3 bg-yellow-400", bars: 2 };
    return { label: "Muy segura", color: "text-green-600", bar: "w-full bg-green-500", bars: 3 };
};

export default function useEditProfile() {

    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombre: "",
        email: "",
        telefono: "",
        rol: "",
        avatar: "",
    });

    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [touched, setTouched] = useState({});
    const [passwordTouched, setPasswordTouched] = useState({});
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileRef = useRef();
    const debounceRef = useRef(null);

    useEffect(() => {
        const user = getAuthUser();

        if (user) {
            setFormData({
                id: user._id || user.id,
                tipoDoc: user.documentType?._id?.toString() || "",
                documento: user.documentNumber || "",
                nombre: user.fullName || "",
                email: user.email || "",
                telefono: user.phone || "",
                rol: typeof user.role === "object"
                    ? user.role?.name || ""
                    : user.role || "",
                avatar: user.avatar || "",
            });
        }
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case "tipoDoc":
                return !value ? "Selecciona un tipo de documento." : "";

            case "documento":
                if (!value) return "El documento es obligatorio.";
                if (!Validations.soloNumeros(value)) return "Solo se permiten números.";
                if (value.length < 8) return "Mínimo 8 dígitos.";
                if (value.length > 12) return "Máximo 12 dígitos.";
                return "";

            case "nombre":
                if (!value) return "El nombre es obligatorio.";
                if (!Validations.soloLetras(value)) return "Solo se permiten letras.";
                if (value.trim().length < 3) return "Mínimo 3 caracteres.";
                return "";

            case "email":
                if (!value) return "El email es obligatorio.";
                if (!Validations.formatoEmail(value)) return "Ingresa un email válido.";
                return "";

            case "telefono":
                if (!value) return "El teléfono es obligatorio.";
                if (!Validations.soloNumeros(value)) return "Solo se permiten números.";
                if (value.length < 7) return "Mínimo 7 dígitos.";
                if (value.length > 14) return "Máximo 14 dígitos.";
                return "";

            default:
                return "";
        }
    };
    const validatePasswordField = (name, value, currentData) => {
        switch (name) {
            case "currentPassword":
                return !value ? "La contraseña actual es obligatoria." : "";
            case "newPassword":
                if (!value) return "La nueva contraseña es obligatoria.";
                if (value.length < 6) return "Mínimo 6 caracteres.";
                return "";
            case "confirmPassword": {
                const newPass = currentData?.newPassword ?? passwordData.newPassword;
                if (!value) return "Debes confirmar la contraseña.";
                if (value !== newPass) return "Las contraseñas no coinciden.";
                return "";
            }
            default:
                return "";
        }
    };
    const checkEmailExists = async (email) => {
        try {
            const response = await api.get("/users/check-email", {
                params: {
                    email,
                    excludeId: formData.id
                }
            });

            return response.data.exists;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const checkDocumentExists = async (document) => {
        try {
            const response = await api.get("/users/check-document", {
                params: {
                    document,
                    excludeId: formData.id
                }
            });

            return response.data.exists;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let sanitized = value;

        if (name === "documento") {
            sanitized = value.replace(/\D/g, "").slice(0, 12);
        }

        if (name === "telefono") {
            sanitized = value.replace(/\D/g, "").slice(0, 14);
        }

        if (name === "nombre") {
            sanitized = value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, "");
        }

        setFormData(prev => ({
            ...prev,
            [name]: sanitized,
        }));

        setTouched(prev => ({
            ...prev,
            [name]: true,
        }));

        const syncError = validateField(name, sanitized);

        setErrors(prev => ({
            ...prev,
            [name]: syncError,
        }));

        if ((name === "email" || name === "documento") && !syncError) {

            clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(async () => {

                if (name === "email") {
                    const exists = await checkEmailExists(sanitized);

                    setErrors(prev => ({
                        ...prev,
                        email: exists ? "Este correo ya está registrado." : "",
                    }));
                }

                if (name === "documento") {
                    const exists = await checkDocumentExists(sanitized);

                    setErrors(prev => ({
                        ...prev,
                        documento: exists ? "Este documento ya está registrado." : "",
                    }));
                }

            }, 600);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...passwordData, [name]: value };
        setPasswordData(updatedData);
        setPasswordTouched((prev) => ({ ...prev, [name]: true }));

        const newErrors = { [name]: validatePasswordField(name, value, updatedData) };
        if (name === "newPassword" && passwordTouched.confirmPassword) {
            newErrors.confirmPassword = validatePasswordField("confirmPassword", updatedData.confirmPassword, updatedData);
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormData((prev) => ({ ...prev, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const fields = ["tipoDoc", "documento", "nombre", "email", "telefono"];
        const newErrors = {};
        const newTouched = {};
        fields.forEach((f) => {
            newTouched[f] = true;
            const err = validateField(f, formData[f]);
            if (err) newErrors[f] = err;
        });
        setTouched((prev) => ({ ...prev, ...newTouched }));
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const fields = ["currentPassword", "newPassword", "confirmPassword"];
        const newErrors = {};
        const newTouched = {};
        fields.forEach((f) => {
            newTouched[f] = true;
            const err = validatePasswordField(f, passwordData[f], passwordData);
            if (err) newErrors[f] = err;
        });
        setPasswordTouched((prev) => ({ ...prev, ...newTouched }));
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Validación final contra la BD
        const emailExists = await checkEmailExists(formData.email);
        const documentExists = await checkDocumentExists(formData.documento);

        if (emailExists || documentExists) {
            setErrors(prev => ({
                ...prev,
                email: emailExists ? "Este correo ya está registrado." : "",
                documento: documentExists ? "Este documento ya está registrado." : "",
            }));

            return;
        }

        setLoading(true);

        const result = await updateProfile({
            fullName: formData.nombre,
            email: formData.email,
            phone: formData.telefono,
            documentType: formData.tipoDoc,
            documentNumber: formData.documento,
            avatar: formData.avatar,
        });

        setLoading(false);

        if (result.ok) {
            showToast("success", "Tu perfil fue actualizado correctamente.");

            setTimeout(() => setSuccess(true), 2500);
        } else {
            showToast("error", result.message || "No se pudo actualizar el perfil.");
        }
    };

    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        const result = await changePassword(
            passwordData.currentPassword,
            passwordData.newPassword
        );

        if (result.ok) {
            showToast("success", "Tu contraseña fue cambiada correctamente.");
            setShowPasswordSection(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordTouched({});
        } else {
            showToast("error", result.message || "No se pudo cambiar la contraseña.");
        }
    };

    return {
        formData, passwordData, showPasswordSection, setShowPasswordSection,
        errors, touched, passwordTouched, loading, fileRef,
        success, // 🔥 NUEVO
        handleChange, handlePasswordChange, handleAvatarChange,
        handleSubmit, handleChangePassword,
    };
}