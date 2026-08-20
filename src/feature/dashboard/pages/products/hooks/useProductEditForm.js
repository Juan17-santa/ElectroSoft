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

import { useState, useEffect, useRef } from "react";
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
        precio: initialData.precio ?? "0",
        stock: initialData.stock ?? "0",
        tipoStock: "",
        serial: "",
        garantia: "",
        ...initialData
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    //ESTADO DE CARGA
    const [loading, setLoading] = useState(false);

    // ESTADO PARA INDICAR SI SE ESTÁ VALIDANDO EL SERIAL
    const [validatingSerial, setValidatingSerial] = useState(false);
    
    // REF PARA CONTROLAR LOS TIMEOUTS DE VALIDACIÓN ASINCRÓNICA
    const validationTimeoutRef = useRef(null);

    // EFECTO PARA ACTUALIZAR formData CUANDO initialData CAMBIA
    useEffect(() => {
        setFormData({
            id: initialData.id || "",
            nombre: initialData.nombre || "",
            categoriaId: initialData.categoriaId || "",
            precio: initialData.precio ?? "0",
            stock: initialData.stock ?? "0",
            tipoStock: initialData.tipoStock || "",
            serial: initialData.serial || "",
            garantia: initialData.garantia || "",
            ...initialData
        });
    }, [initialData]);

    const normalizeNumericString = (name, value) => {
        const raw = String(value ?? "").trim().replace(/\s+/g, "");

        if (!raw) return "";

        if (name === "precio") {
            const normalized = raw
                .replace(/\./g, "")
                .replace(/,/g, ".")
                .replace(/[^\d.]/g, "");

            if (!normalized) return "";

            const [wholeRaw = "", fractionRaw = ""] = normalized.split(".");
            const wholeDigits = String(wholeRaw || "").replace(/[^\d]/g, "");
            const fractionDigits = String(fractionRaw || "").replace(/[^\d]/g, "").slice(0, 2);

            if (!wholeDigits && !fractionDigits) return "";
            const safeWholeDigits = wholeDigits || "0";

            return fractionDigits ? `${safeWholeDigits}.${fractionDigits}` : safeWholeDigits;
        }

        if (name === "stock") {
            const rawDigits = raw.replace(/[^\d]/g, "");
            if (!rawDigits) return "";
            const parsed = Number(rawDigits);
            return Number.isFinite(parsed) ? String(parsed) : "";
        }

        return raw;
    };

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
                    error = "";
                } else if (!/^\d+(\.\d{1,2})?$/.test(strValue)) {
                    error = "El precio debe usar un formato numérico válido";
                } else if (Number(strValue) < 0) {
                    error = "El precio no puede ser negativo";
                }
                break;

            case "stock":
                if (!strValue) {
                    error = "";
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

    // HANDLE CHANGE CON VALIDACIÓN EN TIEMPO REAL (incluyendo serial)
    const handleChange = (e) => {

        const { name, value } = e.target;
        const normalizedValue = (name === "precio" || name === "stock")
            ? normalizeNumericString(name, value).slice(0, 15)
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: normalizedValue
        }));

        const error = validateField(name, normalizedValue);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // VALIDACIÓN ASINCRÓNICA ESPECIAL PARA SERIAL
        if (name === "serial" && !error) {
            // Limpiar timeout anterior si existe
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }

            setValidatingSerial(true);

            // Esperar a que el usuario deje de escribir antes de validar
            validationTimeoutRef.current = setTimeout(async () => {
                try {
                    const serialAlreadyExists = await ServicesProducts.checkSerialExists(value, formData.id);
                    setErrors(prev => ({
                        ...prev,
                        serial: serialAlreadyExists ? "Este serial ya existe en otro producto" : ""
                    }));
                } catch (validationError) {
                    setErrors(prev => ({ ...prev, serial: validationError.message }));
                } finally {
                    setValidatingSerial(false);
                }
            }, 300);
        }
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

    // HANDLE SUBMIT PARA ACTUALIZAR (ASYNC)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return; 

        const isValid = validateForm();
        if (!isValid) {
            alert("Por favor, corrija los errores antes de guardar");
            return;
        }

        if (!formData.id) {
            alert("Error: ID del producto no encontrado");
            return;
        }
        setLoading(true);

        try {
            const productoActualizado = {
                nombre: formData.nombre,
                categoriaId: formData.categoriaId,
                precio: Number(formData.precio || 0),
                stock: Number(formData.stock || 0),
                tipoStock: formData.tipoStock,
                serial: formData.serial,
                garantia: formData.garantia,
                caracteristicas
            };

            await ServicesProducts.update(formData.id, productoActualizado);
            
            onSuccess();
        } catch (error) {
            alert(error.message || "Error al actualizar el producto");
        } finally {
            setLoading(false);
        }
    };

    // RETORNAMOS LOS DATOS Y FUNCIONES NECESARIAS PARA EL FORMULARIO
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData,
        loading,
        validatingSerial
    };
}
