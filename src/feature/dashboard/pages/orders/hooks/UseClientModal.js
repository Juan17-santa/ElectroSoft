import { useState } from "react";
import { Validations } from "../../../../../utils/validations";

export const useClientModal = (onSave, onClose) => {

    const [formData, setFormData] = useState({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
    });

    const [errors, setErrors] = useState({});

    // ─── Validar campo individual ─────────────────────
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "tipoDocumento":
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

            case "nombres":
                if (!value) {
                    error = "El nombre es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "apellidos":
                if (!value) {
                    error = "El apellido es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "email":
                if (!value) {
                    error = "El email es obligatorio";
                } else if (!Validations.formatoEmail(value)) {
                    error = "Formato email invalido";
                }
                break;

            case "telefono":
                if (!value) {
                    error = "El teléfono es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 14) {
                    error = "Debe tener entre 8 y 14 dígitos";
                }
                break;


            default:
                return error;
        }

        return error;
    };

    // ─── Handle change ────────────────────────────────
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

    // ─── Validar todo ─────────────────────────────────
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ─── Submit ───────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const nuevoCliente = {
            ...formData,
            id: Date.now(),
            estado: true,
            fechaCreacion: new Date().toISOString().split("T")[0],
            totalCompras: 0
        };

        onSave(nuevoCliente);
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit
    };
};