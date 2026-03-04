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

import { useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

// HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO DE CREACION Y EDICION DE CATEGORIAS DE PRODUCTOS
export default function useProductCategoryForm({
    initialData = {},
    onSuccess,
    mode
}) {

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        ...initialData
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // VALIDACIÓN INDIVIDUAL
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

    // HANDLE CHANGE CON VALIDACIÓN EN TIEMPO REAL
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

    // VALIDAR TODO EL FORMULARIO
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // HANDLE SUBMIT PARA CREAR O ACTUALIZAR SEGUN EL MODO
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (mode === "create") {
            ServiceProductCategory.create(formData);
        }

        if (mode === "update") {
            ServiceProductCategory.update(formData);
        }

        onSuccess();
    };

    // RETORNAMOS LOS DATOS Y FUNCIONES NECESARIAS PARA EL FORMULARIO
    return {
        formData,
        errors,
        handleChange,
        handleSubmit
    };
}