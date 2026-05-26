import { useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesProviders } from "../services/ServicesProviders";

export function useProviderForm({
    initialData = {},
    onSuccess,
    mode
}) {

    const formatInitialData = () => {
        if (!initialData || Object.keys(initialData).length === 0) return {};

        return {
            _id: initialData._id,
            documentType: initialData.documentType?._id || initialData.documentType || "",
            document: initialData.document || "",
            providerName: initialData.providerName || "",
            contactName: initialData.contactName || "",
            contactPhone: initialData.contactPhone || "",
            categoriesAssociated: initialData.categoriesAssociated?.map(cat => cat._id || cat) || [],
            status: initialData.status
        };
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState(() => {
        const formatted = formatInitialData();
        return {
            documentType: formatted.documentType || "",
            document: formatted.document || "",
            providerName: formatted.providerName || "",
            contactName: formatted.contactName || "",
            contactPhone: formatted.contactPhone || "",
            categoriesAssociated: formatted.categoriesAssociated || [],
            _id: formatted._id || null,
            status: formatted.status !== undefined ? formatted.status : true
        };
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // FUNCIÓN PARA VALIDAR UN CAMPO INDIVIDUAL
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "documentType":
                if (!value) error = "Seleccione un tipo de documento";
                break;

            case "document":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo se permiten números";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                }
                break;

            case "providerName":
                if (!value) {
                    error = "El nombre del proveedor es obligatorio";
                } else if (!Validations.alfanumericoNombre(value)) {
                    error = "Solo letras, números y símbolos permitidos";
                }
                break;

            case "contactName":
                if (!value) {
                    error = "El nombre del contacto es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "contactPhone":
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

    // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        let error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // FUNCIÓN PARA VALIDAR TODO EL FORMULARIO
    const validateForm = () => {
        let newErrors = {};

        Object.keys(formData).forEach(field => {
            if (field === "_id" || field === "status" || field === "categoriesAssociated") return;

            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // FUNCIÓN QUE MANEJA EL ENVÍO DEL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (mode === "create") {
                await ServicesProviders.create(formData);
            }

            if (mode === "update") {
                // 🔥 CORRECCIÓN AQUÍ: Separamos el ID del body porque el servicio espera (id, data)
                const { _id, ...providerData } = formData;
                await ServicesProviders.update(_id, providerData);
            }

            onSuccess();
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
        }
    };

    // FUNCIÓN PARA ACTUALIZAR LAS CATEGORÍAS ASOCIADAS
    const setCategoriasAsociadas = (values) => {
        setFormData(prev => ({
            ...prev,
            categoriesAssociated: values
        }));
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setCategoriasAsociadas,
        setFormData // DEVOLVEMOS setFormData PARA PODER INYECTAR LOS DATOS EN UPDATE
    };
}