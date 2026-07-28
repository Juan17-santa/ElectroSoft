import { useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesProviders } from "../services/ServicesProviders";

export function useProviderForm({
    initialData = {},
    documentTypes = [],
    onSuccess,
    onError,
    mode
}) {

    const formatInitialData = () => {
        if (!initialData || Object.keys(initialData).length === 0) return {};

        return {
            _id: initialData._id,
            documentType: initialData.documentType?._id || initialData.documentType || "",
            document: initialData.document || "",
            providerName: initialData.providerName || "",
            providerType: initialData.providerType || "NATURAL",
            providerEmail: initialData.providerEmail || "",
            address: initialData.address || "",
            contactName: initialData.contactName || "",
            providerPhone: initialData.providerPhone || "",
            contactEmail: initialData.contactEmail || "",
            contactPhone: initialData.contactPhone || "",
            categoriesAssociated: initialData.categoriesAssociated?.map(cat => cat._id || cat) || [],
            status: initialData.status
        };
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState(() => {
        const formatted = formatInitialData();
        return {
            providerType: formatted.providerType || "NATURAL",
            documentType: formatted.documentType || "",
            document: formatted.document || "",
            providerName: formatted.providerName || "",
            contactName: formatted.contactName || "",
            providerPhone: formatted.providerPhone || "",
            providerEmail: formatted.providerEmail || "",
            address: formatted.address || "",
            contactEmail: formatted.contactEmail || "",
            contactPhone: formatted.contactPhone || "",
            categoriesAssociated: formatted.categoriesAssociated || [],
            _id: formatted._id || null,
            status: formatted.status !== undefined ? formatted.status : true
        };
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // ESTADO DE CARGA
    const [loading, setLoading] = useState(false);

    const isNatural = formData.providerType === "NATURAL";
    const isJuridica = formData.providerType === "JURIDICA";
    const isCreate = mode === "create";
    const isUpdate = mode === "update";

    // Obtiene automáticamente el tipo de documento NIT
    const nitDocumentType = documentTypes.find(
        doc => doc.abbreviation === "NIT"
    );

    // FUNCIÓN PARA VALIDAR UN CAMPO INDIVIDUAL
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "providerType":
                if (!value)
                    error = "Seleccione un tipo de proveedor";
                break;

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
                } else if (
                    formData.providerType === "NATURAL" &&
                    !Validations.soloLetras(value)
                ) {
                    error = "Solo se permiten letras";
                } else if (
                    formData.providerType === "JURIDICA" &&
                    !Validations.alfanumericoNombre(value)
                ) {
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

            case "providerPhone":
                if (!value) {
                    error = "El teléfono es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 14) {
                    error = "Debe tener entre 8 y 14 dígitos";
                }
                break;

            case "providerEmail":
                if (!value) {
                    error = "El correo es obligatorio";
                }
                else if (!Validations.formatoEmail(value)) {
                    error = "Correo no válido";
                }
                break;

            case "contactEmail":
                if (isJuridica) {
                    if (!value) {
                        error = "El correo de la empresa es obligatorio";
                    } else if (!Validations.formatoEmail(value)) {
                        error = "Correo no válido";
                    }
                }
                break;

            case "contactPhone":
                if (isJuridica) {
                    if (!value) {
                        error = "El teléfono de la empresa es obligatorio";
                    } else if (!Validations.soloNumeros(value)) {
                        error = "Solo números permitidos";
                    } else if (value.length < 8 || value.length > 14) {
                        error = "Debe tener entre 8 y 14 dígitos";
                    }
                }
                break;

            case "address":
                if (!value)
                    error = "La dirección es obligatoria";
                break;

            default:
                break;
        }
        return error;
    };

    // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "providerType") {
            setFormData(prev => ({
                ...prev,
                providerType: value,
                contactName: value === "NATURAL" ? "" : prev.contactName,
                documentType:
                    value === "JURIDICA"
                        ? nitDocumentType?._id || ""
                        : "",
                contactEmail: value === "NATURAL" ? "" : prev.contactEmail,
                contactPhone: value === "NATURAL" ? "" : prev.contactPhone
            }));

            setErrors(prev => ({
                ...prev,
                documentType: ""
            }));

            return;
        }

        if (name === "document") {
            newValue = value.replace(/\D/g, "").slice(0, 12);
        }

        if (name === "providerPhone" || name === "contactPhone") {
            newValue = value.replace(/\D/g, "").slice(0, 14);
        }

        if (name === "providerName") {
            if (formData.providerType === "NATURAL") {
                newValue = value.replace(/[0-9]/g, "");
            }
            newValue = newValue.slice(0, 100);
        }

        if (name === "contactName") {
            newValue = value.replace(/[0-9]/g, "");
            newValue = newValue.slice(0, 100);
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        const error = validateField(name, newValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // FUNCIÓN PARA VALIDAR CAMPOS ÚNICOS AL SALIR DEL INPUT
    const handleBlur = async (e) => {
        const { name, value } = e.target;

        // Solo validar estos campos
        if (
            name !== "document" &&
            name !== "providerEmail" &&
            name !== "contactEmail"
        ) {
            return;
        }

        // Si el campo ya tiene un error de formato, no consultar el backend
        const formatError = validateField(name, value);
        if (formatError || !value.trim()) {
            return;
        }

        try {
            const result = await ServicesProviders.checkUnique({
    _id: formData._id,
    [name]: value
});

            setErrors(prev => ({
                ...prev,
                [name]: result.exists ? result.message : ""
            }));
        } catch (error) {
            console.error(error);
        }
    };

    // FUNCIÓN PARA VALIDAR TODO EL FORMULARIO
    const validateForm = () => {
        let newErrors = {};

        Object.keys(formData).forEach(field => {
            if (field === "_id" || field === "status" || field === "categoriesAssociated") return;

            if (
                (isNatural &&
                    (
                        field === "contactName" ||
                        field === "contactEmail" ||
                        field === "contactPhone"
                    )
                ) ||
                (isJuridica && field === "documentType")
            ) {
                return;
            }

            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // FUNCIÓN QUE MANEJA EL ENVÍO DEL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (!validateForm()) return;

        const providerData = {
            ...formData
        };

        if (isNatural) {
            delete providerData.contactName;
            delete providerData.contactEmail;
            delete providerData.contactPhone;
        }

        if (isJuridica) {
            providerData.documentType = nitDocumentType?._id;
        }

        setLoading(true);

        try {
            if (mode === "create") {
                await ServicesProviders.create(providerData);
            }

            if (mode === "update") {
                const { _id, ...dataToUpdate } = providerData;
                await ServicesProviders.update(_id, dataToUpdate);
            }

            onSuccess();
        } catch (error) {
            setLoading(false);

            if (onError) {
                onError(error.message);
            }
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
        handleBlur,
        handleSubmit,
        setCategoriasAsociadas,
        setFormData,
        loading,
        isNatural,
        isJuridica,
        isCreate,
        isUpdate
    };
}