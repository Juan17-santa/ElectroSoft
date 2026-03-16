import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServiceProductCategory } from "../services/ServicesProductCategory";

// HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO DE CREACRION Y EDICION DE CATEGORIAS
export default function useProductCategoryModal({
    initialData = null,
    onSuccess,
    onClose,
    mode
}) {

    // ESTADO INICIAL LIMPIO
    const defaultState = {
        nombre: "",
        descripcion: "",
        estado: true
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState(defaultState);

    // ESTADO PARA LOS ERRORES DE VALIDACION
    const [errors, setErrors] = useState({});

    // SINCRONIZA LOS DATOS DEL FORMULARIO CUANDO CAMBIA
    // ESTO PERMITE CARGAR LOS DATOS AL EDITAR UNA CATEGORIA
    useEffect(() => {
        if (initialData && mode === "update") {
            // SI ES EDICION SE CARGAN LOS DATOS
            setFormData({
                ...defaultState,
                ...initialData,
            });
        } else {
            // SI ES CREACION SE RESETEA EL FORMULARIO PARA QUE QUEDE LIMPIO
            setFormData(defaultState);
        }
        setErrors({});
    }, [initialData, mode]);

    // FUNCION PARA VALIDAR LOS CAMPOS INDIVIDUALES
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

    // FUNCION PARA MANEJAR LOS CAMBIOS EN LOS INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // VALIDAR EL CAMPO EN TIEMPO REAL
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // FUNCION PARA VALIDAR TODO EL FORMULARIO
    const validateForm = () => {
        let newErrors = {};
        const errorNombre = validateField("nombre", formData.nombre);
        if (errorNombre) newErrors.nombre = errorNombre;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // FUNCION PARA MANEJAR EL ENVIO DEL FOMULARIO
    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        try {
            if (mode === "create") {
                ServiceProductCategory.create(formData);
            } else if (mode === "update") {
                ServiceProductCategory.update(formData);
            }

            // SI TODO SALE BIEN SE EJECUTAN LAS ACCIONES Y SE CIERRA LA MODAL
            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (error) {
            console.error("Error al procesar la categoría:", error);
        }
    };

    // RETORNAMOS LAS FUNCIONES Y ESTADO PARA USAR EN EL MODAL
    return {
        formData,
        errors,
        handleChange,
        handleSubmit
    };
}