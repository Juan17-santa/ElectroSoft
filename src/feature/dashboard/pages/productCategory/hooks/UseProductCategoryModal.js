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
        name: "",
        description: "",
        status: true
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState(defaultState);

    // ESTADO PARA LOS ERRORES DE VALIDACION
    const [errors, setErrors] = useState({});

    // ESTADO PARA ALMACENAR TODAS LAS CATEGORÍAS EXISTENTES
    const [existingCategories, setExistingCategories] = useState([]);

    // CARGAR LAS CATEGORÍAS EXISTENTES AL MONTAR EL COMPONENTE
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await ServiceProductCategory.get();
                setExistingCategories(categories);
            } catch (error) {
                console.error("Error cargando categorías:", error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialData && mode === "update") {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                status: initialData.status !== undefined ? initialData.status : true,
                id: initialData.id
            });
        } else {
            setFormData(defaultState);
        }
        setErrors({});
    }, [initialData, mode]);

    // FUNCION PARA VALIDAR LOS CAMPOS INDIVIDUALES
    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "name":
                if (!value.trim()) {
                    error = "El nombre es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "El nombre no puede contener números";
                } else if (value.trim().length < 5) {
                    error = "El nombre debe tener mínimo 5 caracteres";
                } else {
                    // VERIFICAR SI EL NOMBRE YA EXISTE (VALIDACIÓN EN TIEMPO REAL)
                    const nameLower = value.trim().toLowerCase();
                    const isDuplicate = existingCategories.some(category => {
                        // Si estamos en modo edición, no contar la categoría actual como duplicado
                        if (mode === "update" && category.id === initialData?.id) {
                            return false;
                        }
                        return category.name.toLowerCase() === nameLower;
                    });

                    if (isDuplicate) {
                        error = "Esta categoría ya se encuentra registrada";
                    }
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

        let error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // FUNCION PARA VALIDAR TODO EL FORMULARIO
    const validateForm = () => {
        let newErrors = {};
        const errorNombre = validateField("name", formData.name);
        if (errorNombre) newErrors.name = errorNombre;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // FUNCION PARA MANEJAR EL ENVIO DEL FOMULARIO
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        try {
            if (mode === "create") {
                await ServiceProductCategory.create(formData);
            } else if (mode === "update") {
                await ServiceProductCategory.update(formData.id, formData);
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            setErrors(prev => ({ ...prev, name: error.message }));
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