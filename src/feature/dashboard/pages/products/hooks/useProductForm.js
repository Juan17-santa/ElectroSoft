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

import { useState, useEffect, useRef } from "react";
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
        precio: "0",
        stock: "0",
        tipoStock: "",
        serial: "",
        garantia: ""
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

        //ESTADO DE CARGA
    const [loading, setLoading] = useState(false);
    
    // ESTADO PARA ALMACENAR PRODUCTOS EXISTENTES (para validar serial)
    const [existingProducts, setExistingProducts] = useState([]);
    
    // ESTADO PARA INDICAR SI SE ESTÁ VALIDANDO EL SERIAL
    const [validatingSerial, setValidatingSerial] = useState(false);
    
    // REF PARA CONTROLAR LOS TIMEOUTS DE VALIDACIÓN ASINCRÓNICA
    const validationTimeoutRef = useRef(null);

    // CARGAR PRODUCTOS AL MONTAR PARA VALIDAR SERIALES
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await ServicesProducts.get();
                setExistingProducts(products || []);
            } catch (error) {
                console.error("Error al cargar productos para validación:", error);
            }
        };
        
        loadProducts();
    }, []);

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

    const normalizeTextLimit = (name, value) => {
        if (name === "nombre") {
            return String(value ?? "").slice(0, 25);
        }
        if (name === "serial") {
            return String(value ?? "").slice(0, 15);
        }
        return value;
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
                } else if (strValue.length > 25) {
                    error = "El nombre no puede exceder 25 caracteres";
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
                } else if (strValue.length > 15) {
                    error = "El serial no puede exceder 15 caracteres";
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
        const limitedTextValue = normalizeTextLimit(name, value);
        const normalizedValue = (name === "precio" || name === "stock")
            ? normalizeNumericString(name, value).slice(0, 15)
            : limitedTextValue;

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
            validationTimeoutRef.current = setTimeout(() => {
                const serialAlreadyExists = existingProducts.some(prod => 
                    prod.serial?.toLowerCase() === value.toLowerCase()
                );

                if (serialAlreadyExists) {
                    setErrors(prev => ({
                        ...prev,
                        serial: "Este serial ya existe en otro producto"
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        serial: ""
                    }));
                }
                setValidatingSerial(false);
            }, 500); // Esperar 500ms después de que deje de escribir
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

    // HANDLE SUBMIT PARA CREAR (ASYNC)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return; 

        if (!validateForm()) return;

        setLoading(true);

        try {
            await ServicesProducts.create({
                ...formData,
                precio: Number(formData.precio || 0),
                stock: Number(formData.stock || 0),
                tipoStock: formData.tipoStock,
                caracteristicas
            });

            onSuccess();
        } catch (error) {
            onError(error.message || "Error al crear el producto");
        }
    };

    // RETORNAMOS LOS DATOS Y FUNCIONES NECESARIAS PARA EL FORMULARIO
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData,
        loading
    };
}