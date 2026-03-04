/*
useProductCategoryForm

Hook personalizado encargado de gestionar la lógica del formulario de creación y 
edición de categorías de productos.

Este hook centraliza el estado, validaciones y envío del formulario, permitiendo que el 
componente visual (ProductCategoryForm) se mantenga libre de lógica de negocio.

Responsabilidades:
✔ Gestionar el estado del formulario (formData)
✔ Gestionar el estado de errores de validación (errors)
✔ Validar campos individualmente
✔ Ejecutar validación en tiempo real (handleChange)
✔ Validar el formulario completo antes del envío
✔ Ejecutar la acción correspondiente según el modo (create / update)
✔ Invocar la función onSuccess después de una operación exitosa

Dependencias:
- ServiceProductCategory → Para operaciones de creación y actualización
- Validations → Para reglas de validación reutilizables
*/

import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

export default function useProductCategoryModal({
    initialData = null,
    onSuccess,
    onClose, // Agregamos onClose para cerrar tras éxito
    mode
}) {
    // Estado inicial limpio
    const defaultState = {
        nombre: "",
        descripcion: "",
        estado: true
    };

    const [formData, setFormData] = useState(defaultState);
    const [errors, setErrors] = useState({});

    // IMPORTANTE: Sincroniza el formulario cuando initialData cambie
    useEffect(() => {
        if (initialData && mode === "update") {
            setFormData({
                ...defaultState,
                ...initialData,
            });
        } else {
            setFormData(defaultState);
        }
        setErrors({}); // Limpiar errores al cambiar de modo/datos
    }, [initialData, mode]);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "nombre":
                if (!value.trim()) {
                    error = "El nombre es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "El nombre no puede contener números";
                } else if (value.trim().length < 5) {
                    error = "El nombre debe tener mínimo 5 caracteres";
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        let newErrors = {};
        // Validamos solo los campos que nos interesan (nombre en este caso)
        const errorNombre = validateField("nombre", formData.nombre);
        if (errorNombre) newErrors.nombre = errorNombre;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        try {
            if (mode === "create") {
                ServiceProductCategory.create(formData);
            } else if (mode === "update") {
                ServiceProductCategory.update(formData);
            }

            // Si la API responde bien, ejecutamos el éxito y cerramos
            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (error) {
            console.error("Error al procesar la categoría:", error);
            // Aquí podrías setear un error general si tuvieras un estado para ello
        }
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit
    };
}