import { useState, useEffect, useRef } from "react";
import { getAuthUser, updateProfile, changePassword } from "../services/authService";

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

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert]     = useState(null); // { type: "success"|"error", message: "" }
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

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev)   => ({ ...prev, [name]: "" }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev)       => ({ ...prev, [name]: "" }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) =>
            setFormData((prev) => ({ ...prev, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // ── Validaciones ────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!formData.documentType) newErrors.documentType = "Requerido";
        if (!formData.document)     newErrors.document     = "Requerido";
        else if (!/^\d+$/.test(formData.document))
            newErrors.document = "Solo números";
        if (!formData.fullName)     newErrors.fullName = "Requerido";
        if (!formData.email)        newErrors.email    = "Requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Email inválido";
        if (!formData.phone)        newErrors.phone = "Requerido";
        else if (!/^\d+$/.test(formData.phone))
            newErrors.phone = "Solo números";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors = {};
        if (!passwordData.currentPassword)
            newErrors.currentPassword = "Requerido";
        if (!passwordData.newPassword)
            newErrors.newPassword = "Requerido";
        else if (passwordData.newPassword.length < 6)
            newErrors.newPassword = "Mínimo 6 caracteres";
        if (passwordData.newPassword !== passwordData.confirmPassword)
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        setErrors((prev) => ({ ...prev, ...newErrors }));
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
            // Navegar después de que el usuario vea la alerta (2.5s)
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