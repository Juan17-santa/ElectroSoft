import { useState, useEffect, useRef } from "react";
import { Validations } from "../../../../../utils/validations";
import api from "../../../../../utils/api.js";

export function useClientForm({ initialData = null, onSubmit }) {
    const defaultData = {
        id: "", tipoDocumento: "", documento: "",
        nombres: "", apellidos: "", email: "",
        telefono: "", totalCompras: 0, estado: true
    };

    const [formData, setFormData] = useState(defaultData);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const debounceRef = useRef(null);

    const [tocado, setTocado] = useState({
        tipoDocumento: false, documento: false, nombres: false,
        apellidos: false, email: false, telefono: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setTocado({
                tipoDocumento: true,
                documento: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true
            });
        }
    }, [initialData]);

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    const checkEmailExists = async (email, excludeId) => {
        try {
            const params = { email };
            if (excludeId) params.excludeId = excludeId;
            const response = await api.get("/clients/check-email", { params });
            return response.data.exists;
        } catch {
            return false;
        }
    };

    const checkDocumentExists = async (documento, excludeId) => {
        try {
            const params = { document: documento };
            if (excludeId) params.excludeId = excludeId;
            const response = await api.get("/clients/check-document", { params });
            return response.data.exists;
        } catch {
            return false;
        }
    };

    const validateField = (name, value) => {
        let error = null;
        switch (name) {
            case "tipoDocumento":
                if (!Validations.campoRequerido(value)) error = "Seleccione un tipo de documento.";
                break;
            case "documento":
                error = Validations.validarDocumentoCliente(value).valido ? null : Validations.validarDocumentoCliente(value).mensaje;
                break;
            case "nombres":
            case "apellidos":
                error = Validations.validarNombreApellido(value).valido ? null : Validations.validarNombreApellido(value).mensaje;
                break;
            case "email":
                error = Validations.validarEmail(value).valido ? null : Validations.validarEmail(value).mensaje;
                break;
            case "telefono":
                error = Validations.validarTelefono(value).valido ? null : Validations.validarTelefono(value).mensaje;
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "documento") value = value.replace(/\D/g, "").slice(0, 15);
        if (name === "telefono") value = value.replace(/\D/g, "").slice(0, 15);
        if (name === "nombres" || name === "apellidos") { value = value.replace(/[0-9]/g, ""); value = value.slice(0, 40); }

        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);

        const syncError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: syncError }));

        if ((name === "email" || name === "documento") && !syncError) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
                if (name === "email") {
                    const exists = await checkEmailExists(value, formData.id);
                    setErrors(prev => ({ ...prev, email: exists ? "Este email ya está registrado" : null }));
                }
                if (name === "documento") {
                    const exists = await checkDocumentExists(value, formData.id);
                    setErrors(prev => ({ ...prev, documento: exists ? "Este documento ya está registrado" : null }));
                }
            }, 600);
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
        const syncError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: syncError }));
    };

    const handleForm = async (e) => {
        e.preventDefault();

        setTocado({
            tipoDocumento: true, documento: true, nombres: true,
            apellidos: true, email: true, telefono: true
        });

        const newErrors = {
            tipoDocumento: validateField("tipoDocumento", formData.tipoDocumento),
            documento: validateField("documento", formData.documento) || errors.documento,
            nombres: validateField("nombres", formData.nombres),
            apellidos: validateField("apellidos", formData.apellidos),
            email: validateField("email", formData.email) || errors.email,
            telefono: validateField("telefono", formData.telefono),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(err => err !== null)) return;

        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(defaultData);
        setTocado({
            tipoDocumento: false, documento: false, nombres: false,
            apellidos: false, email: false, telefono: false
        });
        setErrors({});
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        tocar(name);
        const syncError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: syncError }));
    };

    return {
        formData,
        errors: {
            tipoDocumento: tocado.tipoDocumento ? errors.tipoDocumento : null,
            documento: tocado.documento ? errors.documento : null,
            nombres: tocado.nombres ? errors.nombres : null,
            apellidos: tocado.apellidos ? errors.apellidos : null,
            email: tocado.email ? errors.email : null,
            telefono: tocado.telefono ? errors.telefono : null,
        },
        tocado,
        handleChange,
        handleSelectChange,
        handleBlur,
        handleForm,
        resetForm,
        loading
    };
}