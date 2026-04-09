/*
useProductForm

Hook personalizado encargado de gestionar la lógica del formulario de creación
de productos.

Este hook centraliza el estado, validaciones y envío del formulario, permitiendo que el 
componente visual (CreateProducts) se mantenga libre de lógica de negocio.

Responsabilidades:
✔ Gestionar el estado del formulario (formData)
✔ Gestionar el estado de errores de validación (errors)
✔ Validar campos individualmente
✔ Ejecutar validación en tiempo real (handleChange)
✔ Validar el formulario completo antes del envío
✔ Ejecutar la acción de creación
✔ Invocar la función onSuccess después de una operación exitosa

Dependencias:
- ServicesProducts → Para operaciones de creación
- Validations → Para reglas de validación reutilizables
*/

import { useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesProducts } from "../services/ServicesProducts";

// HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO DE CREACION DE PRODUCTOS
export default function useProductForm({
    onSuccess,
    onError,
    caracteristicas = []
}) {

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        nombre: "",
        categoriaId: "",
        precio: "",
        stock: "",
        tipoStock: "",
        serial: "",
        garantia: ""
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

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
                } else if (!/^[0-9]+$/.test(strValue)) {
                    error = "El precio solo debe contener números";
                } else if (Number(strValue) <= 0) {
                    error = "El precio debe ser mayor a 0";
                }
                break;

            case "stock":
                if (!strValue) {
                    error = "El stock es obligatorio";
                } else if (!/^[0-9]+$/.test(strValue)) {
                    error = "El stock solo debe contener números";
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

            case "tipoStock":
                if (!strValue) {
                    error = "Debe seleccionar un tipo de stock";
                } else if (!["unidad", "metros"].includes(strValue)) {
                    error = "Tipo de stock no válido";
                }
                break;

            case "garantia":
                if (!strValue) {
                    error = "Debe seleccionar una garantía";
                } else if (!["3 meses", "6 meses", "9 meses", "12 meses"].includes(strValue)) {
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

    // HANDLE SUBMIT PARA CREAR
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // VALIDAR QUE NO EXISTA UN PRODUCTO EXACTAMENTE IGUAL
        const productosExistentes = ServicesProducts.get();
        const duplicado = productosExistentes.some(prod =>
            prod.nombre?.toLowerCase().trim() === formData.nombre.toLowerCase().trim() &&
            Number(prod.categoriaId) === Number(formData.categoriaId) &&
            Number(prod.precio) === Number(formData.precio) &&
            Number(prod.stock) === Number(formData.stock) &&
            prod.tipoStock === formData.tipoStock &&
            prod.serial?.toLowerCase().trim() === formData.serial.toLowerCase().trim() &&
            prod.garantia === formData.garantia
        );

        if (duplicado) {
            onError("Ya existe un producto con los mismos datos. Verifique los campos e intente de nuevo.");
            return;
        }

        ServicesProducts.create({
            ...formData,
            categoriaId: Number(formData.categoriaId),
            precio: Number(formData.precio),
            stock: Number(formData.stock),
            tipoStock: formData.tipoStock,
            caracteristicas
        });

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