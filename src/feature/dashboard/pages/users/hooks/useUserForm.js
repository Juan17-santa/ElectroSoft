import { useState, useEffect } from "react";
import { usersService } from "../services/usersService";
import { Validations } from "../../../../../utils/validations";

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

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "tipoDoc":
                if (!value) error = "Seleccione un tipo de documento";
                break;
            case "documento":
                if (!value) error = "El documento es obligatorio";
                else if (!Validations.soloNumeros(value)) error = "Solo números permitidos";
                else if (value.length < 8 || value.length > 12) error = "Debe tener entre 8 y 12 dígitos";
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
                else if (value.length < 8 || value.length > 14) error = "Debe tener entre 8 y 14 dígitos";
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

        // ── FIX 3: bloquear caracteres inválidos antes de setear el estado ──
        let sanitized = value;
        if (name === "documento" || name === "telefono") {
            sanitized = value.replace(/\D/g, ""); // elimina todo lo que no sea dígito
        }
        if (name === "nombre") {
            sanitized = value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, ""); // solo letras y espacios
        }

        setFormData(prev => ({ ...prev, [name]: sanitized }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, sanitized) }));
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