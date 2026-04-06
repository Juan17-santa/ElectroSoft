import { useState, useEffect } from "react";
import { usersService } from "../services/usersService";
import { Validations } from "../../../../../utils/validations";

export function useUserForm({ userToEdit, navigate }) {

    // =========================
    // STATE
    // =========================
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

    // =========================
    // CARGAR USUARIO (EDIT)
    // =========================
    useEffect(() => {
        if (userToEdit) {
            setFormData(userToEdit);
        }
    }, [userToEdit]);

    // =========================
    // VALIDACIONES
    // =========================
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "tipoDoc":
                if (!value) error = "Seleccione un tipo de documento";
                break;

            case "documento":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                }
                break;

            case "nombre":
                if (!value) {
                    error = "El nombre es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo letras permitidas";
                }
                break;

            case "email":
                if (!value) {
                    error = "El email es obligatorio";
                } else if (!Validations.formatoEmail(value)) {
                    error = "Formato inválido";
                }
                break;

            case "telefono":
                if (!value) {
                    error = "El teléfono es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números";
                } else if (value.length < 8 || value.length > 14) {
                    error = "Debe tener entre 8 y 14 dígitos";
                }
                break;

            case "rol":
                if (!value) error = "Seleccione un rol";
                break;

            default:
                break;
        }

        return error;
    };

    const handleSubmit = (e, mode) => {

    e.preventDefault();

    // Validar
    if (!validateForm()) return;

    let updated;

    if (mode === "create") {
        updated = createUser();
    }

    if (mode === "update") {
        updated = updateUser();
    }

    // Si hubo error
    if (!updated) return;

    // Redirigir después de 2 segundos
    setTimeout(() => {
        navigate("/dashboard/users");
    }, 1500);
};


    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // =========================
    // VALIDAR FORM COMPLETO
    // =========================
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================
    // CREATE
    // =========================
   const createUser = () => {

    const users = usersService.get();

    const existeEmail = users.some(u =>
        u.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (existeEmail) {
        setAlert({
            type: "error",
            message: "El email ya está registrado"
        });
        return null;
    }

    const updated = usersService.create(formData);

    setAlert({
        type: "success",
        message: "Usuario creado correctamente"
    });

    return updated; // 🔥 IMPORTANTE
};

    // =========================
    // UPDATE
    // =========================
    const updateUser = () => {

    const users = usersService.get();

    const existeEmail = users.some(u =>
        u.email.toLowerCase() === formData.email.toLowerCase() &&
        u.id !== formData.id
    );

    if (existeEmail) {
        setAlert({
            type: "error",
            message: "El email ya está registrado"
        });
        return null;
    }

    const updated = usersService.update(formData);

    setAlert({
        type: "success",
        message: "Usuario actualizado correctamente"
    });

    return updated; // 🔥 IMPORTANTE
};

    return {
    formData,
    errors,
    alert,
    setAlert,
    handleChange,
    validateForm,
    createUser,
    updateUser,
    handleSubmit // 🔥
};

}