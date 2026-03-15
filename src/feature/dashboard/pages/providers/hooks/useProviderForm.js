import { useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesProviders } from "../services/ServicesProviders";

// HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO DE CREACIÓN Y EDICIÓN DE PROVEEDORES
export function useProviderForm({
    initialData = {},
    onSuccess,
    mode
}) {

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombreProveedor: "",
        nombreContacto: "",
        telefonoContacto: "",
        categoriasAsociadas: [],
        ...initialData
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // FUNCIÓN PARA VALIDAR UN CAMPO INDIVIDUAL
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
                    error = "Solo se permiten números";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                }
                break;

            case "nombreProveedor":
                if (!value) {
                    error = "El nombre del proveedor es obligatorio";
                } else if (!Validations.alfanumericoNombre(value)) {
                    error = "Solo letras, números y símbolos permitidos";
                }
                break;

            case "nombreContacto":
                if (!value) {
                    error = "El nombre del contacto es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "telefonoContacto":
                if (!value) {
                    error = "El teléfono es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 14) {
                    error = "Debe tener entre 8 y 14 dígitos";
                }
                break;

            default:
                break;
        }

        return error;
    };

    // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS Y VALIDAR EN TIEMPO REAL
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

    // FUNCIÓN PARA VALIDAR TODO EL FORMULARIO
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // FUNCIÓN QUE MANEJA EL ENVÍO DEL FORMULARIO
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (mode === "create") {
            ServicesProviders.create(formData);
        }

        if (mode === "update") {
            ServicesProviders.update(formData);
        }

        onSuccess();
    };

    // FUNCIÓN PARA ACTUALIZAR LAS CATEGORÍAS ASOCIADAS DEL PROVEEDOR
    const setCategoriasAsociadas = (values) => {
        setFormData(prev => ({
            ...prev,
            categoriasAsociadas: values
        }));
    };

    // VALORES Y FUNCIONES QUE RETORNA EL HOOK
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setCategoriasAsociadas
    };
}