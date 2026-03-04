/*
useProductEditForm

Hook personalizado encargado de gestionar la lógica del formulario de edición
de productos.

Este hook centraliza el estado, validaciones y envío del formulario, permitiendo que el 
componente visual (EditProducts) se mantenga libre de lógica de negocio.

Responsabilidades:
✔ Gestionar el estado del formulario (formData)
✔ Gestionar el estado de errores de validación (errors)
✔ Validar campos individualmente
✔ Ejecutar validación en tiempo real (handleChange)
✔ Validar el formulario completo antes del envío
✔ Ejecutar la acción de actualización
✔ Invocar la función onSuccess después de una operación exitosa

Dependencias:
- ServicesProducts → Para operaciones de actualización
- Validations → Para reglas de validación reutilizables
*/

import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesProducts } from "../services/ServicesProducts";

// HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO DE EDICION DE PRODUCTOS
export default function useProductEditForm({
    id,
    initialData = {},
    onSuccess,
    caracteristicas = []
}) {

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        id: id || "",
        nombre: "",
        categoriaId: "",
        precio: "",
        stock: "",
        serial: "",
        garantia: "",
        ...initialData
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // EFECTO PARA ACTUALIZAR formData CUANDO initialData CAMBIA
    useEffect(() => {
        setFormData({
            id: initialData.id || "",
            nombre: initialData.nombre || "",
            categoriaId: initialData.categoriaId || "",
            precio: initialData.precio || "",
            stock: initialData.stock || "",
            serial: initialData.serial || "",
            garantia: initialData.garantia || "",
            ...initialData
        });
    }, [initialData]);

    // VALIDACIÓN INDIVIDUAL POR CAMPO
    const validateField = (name, value) => {

        let error = "";
        
        // Convertir a string para operaciones de trim
        const strValue = String(value).trim();

        switch (name) {

            case "nombre":
                if (!strValue) {
                    error = "El nombre del producto es obligatorio";
                } else if (!Validations.nombreProducto(strValue)) {
                    error = "El nombre debe contener letras (puede incluir números)";
                } else if (strValue.length < 3) {
                    error = "El nombre debe tener mínimo 3 caracteres";
                } else if (strValue.length > 100) {
                    error = "El nombre no puede exceder 100 caracteres";
                }
                break;

            case "categoriaId":
                if (!strValue) {
                    error = "Debe seleccionar una categoría";
                }
                break;

            case "precio":
                if (!strValue) {
                    error = "El precio es obligatorio";
                } else if (isNaN(Number(strValue))) {
                    error = "El precio debe ser un número válido";
                } else if (Number(strValue) <= 0) {
                    error = "El precio debe ser mayor a 0";
                } else if (Number(strValue) > 999999) {
                    error = "El precio es demasiado alto";
                }
                break;

            case "stock":
                if (!strValue) {
                    error = "El stock es obligatorio";
                } else if (isNaN(Number(strValue))) {
                    error = "El stock debe ser un número válido";
                } else if (Number(strValue) < 0) {
                    error = "El stock no puede ser negativo";
                } else if (!Number.isInteger(Number(strValue))) {
                    error = "El stock debe ser un número entero";
                }
                break;

            case "serial":
                if (!strValue) {
                    error = "El serial es obligatorio";
                } else if (!Validations.alfanumerico(strValue.replace(/[-_]/g, ''))) {
                    error = "El serial solo puede contener letras, números, guiones y guiones bajos";
                } else if (strValue.length < 2) {
                    error = "El serial debe tener mínimo 2 caracteres";
                } else if (strValue.length > 50) {
                    error = "El serial no puede exceder 50 caracteres";
                }
                break;

            case "garantia":
                if (!strValue) {
                    error = "Debe seleccionar una garantía";
                } else if (!["3 meses", "6 meses", "12 meses"].includes(strValue)) {
                    error = "Garantía no válida";
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

    // HANDLE SUBMIT PARA ACTUALIZAR
    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) {
            alert("Por favor, corrija los errores antes de guardar");
            return;
        }

        if (!formData.id) {
            alert("Error: ID del producto no encontrado");
            return;
        }

        const productoActualizado = {
            id: formData.id,
            nombre: formData.nombre,
            categoriaId: Number(formData.categoriaId),
            precio: Number(formData.precio),
            stock: Number(formData.stock),
            serial: formData.serial,
            garantia: formData.garantia,
            caracteristicas
        };

        console.log("✅ Actualizando producto:", productoActualizado);
        const resultado = ServicesProducts.update(productoActualizado);
        console.log("✅ Resultado:", resultado);
        
        onSuccess();
    };

    // RETORNAMOS LOS DATOS Y FUNCIONES NECESARIAS PARA EL FORMULARIO
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData
    };
}
