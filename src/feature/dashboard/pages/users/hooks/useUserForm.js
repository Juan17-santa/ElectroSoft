import { useState, useEffect, useRef } from "react";
import { usersService } from "../services/usersService";
import { Validations } from "../../../../../utils/validations";
import api from "../../../../../utils/api.js";

export function useUserForm({ userToEdit, navigate }) {

    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombre: "",
        email: "",
        telefono: "",
        rol: "",
        estado: true
    });

    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                id: userToEdit.id,
                tipoDoc: userToEdit.tipoDoc?.toString() || "",
                documento: userToEdit.documento || "",
                nombre: userToEdit.nombre || "",
                email: userToEdit.email || "",
                telefono: userToEdit.telefono || "",
                rol: userToEdit.rol?.toString() || "",
                estado: userToEdit.estado ?? true,
            });
        }
    }, [userToEdit]);

    // VALIDACIÓN EN TIEMPO REAL CON DEBOUNCE
    const checkEmailExists = async (email, excludeId) => {
        try {
            const params = { email };
            if (excludeId) params.excludeId = excludeId;
            const response = await api.get("/users/check-email", { params });
            return response.data.exists;
        } catch {
            return false;
        }
    };

    const checkDocumentExists = async (document, excludeId) => {
        try {
            const params = { document };
            if (excludeId) params.excludeId = excludeId;
            const response = await api.get("/users/check-document", { params });
            return response.data.exists;
        } catch {
            return false;
        }
    };

    // VALIDACIONES SÍNCRONAS
    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "tipoDoc":
                if (!value) error = "Seleccione un tipo de documento";
                break;
            case "documento":
                if (!value) error = "El documento es obligatorio";
                else if (!Validations.soloNumeros(value)) error = "Solo números permitidos";
                else if (value.length < 8) error = "Mínimo 8 dígitos";
                else if (value.length > 12) error = "Máximo 12 dígitos";
                break;
            case "nombre":
                if (!value) error = "El nombre es obligatorio";
                else if (!Validations.soloLetras(value)) error = "Solo letras permitidas";
                break;
            case "email":
                if (!value) error = "El email es obligatorio";
                else if (!Validations.formatoEmail(value)) error = "Formato inválido";
                break;
            case "telefono":
                if (!value) error = "El teléfono es obligatorio";
                else if (!Validations.soloNumeros(value)) error = "Solo números";
                else if (value.length < 7) error = "Mínimo 7 dígitos";
                else if (value.length > 14) error = "Máximo 14 dígitos";
                break;
            case "rol":
                if (!value) error = "Seleccione un rol";
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Sanitizar campos numéricos
        let sanitized = value;
        if (name === "documento") {
            sanitized = value.replace(/\D/g, "").slice(0, 12);
        }
        if (name === "telefono") {
            sanitized = value.replace(/\D/g, "").slice(0, 14);
        }

        setFormData(prev => ({ ...prev, [name]: sanitized }));

        // Validación síncrona inmediata
        const syncError = validateField(name, sanitized);
        setErrors(prev => ({ ...prev, [name]: syncError }));

        // Validación asíncrona con debounce para email y documento
        if ((name === "email" || name === "documento") && !syncError) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
                if (name === "email") {
                    const exists = await checkEmailExists(sanitized, formData.id);

                    setErrors(prev => ({
                        ...prev,
                        email: exists ? "Este email ya está registrado" : ""
                    }));
                }

                if (name === "documento") {
                    const exists = await checkDocumentExists(sanitized, formData.id);

                    setErrors(prev => ({
                        ...prev,
                        documento: exists ? "Este documento ya está registrado" : ""
                    }));
                }
            }, 600); // espera 600ms después de que el usuario deje de escribir
        }
    };

    const validateForm = () => {
        const fields = ["tipoDoc", "documento", "nombre", "email", "telefono", "rol"];
        const newErrors = {};
        fields.forEach(f => {
            const error = validateField(f, formData[f]);
            if (error) newErrors[f] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // CREAR
    const createUser = async () => {
        try {
            setLoading(true);
            await usersService.create(formData);
            setAlert({ type: "success", message: "Usuario creado correctamente" });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Error al crear usuario";
            setAlert({ type: "error", message });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ACTUALIZAR
    const updateUser = async () => {
        try {
            setLoading(true);
            await usersService.update(formData);
            setAlert({ type: "success", message: "Usuario actualizado correctamente" });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Error al actualizar usuario";
            setAlert({ type: "error", message });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        alert,
        setAlert,
        loading,
        handleChange,
        validateForm,
        createUser,
        updateUser,
    };
}