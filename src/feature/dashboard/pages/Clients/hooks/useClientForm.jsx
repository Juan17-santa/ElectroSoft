import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";

export function useClientForm({ initialData = null, onSubmit }) {
    const defaultData = {
        id: "", tipoDocumento: "", documento: "",
        nombres: "", apellidos: "", email: "",
        telefono: "", totalCompras: 0, estado: true
    };

    const [formData, setFormData] = useState(defaultData);

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

    const [docTypeOptions, setDocTypeOptions] = useState([]);

    useEffect(() => {
        const fetchDocTypes = async () => {
            try {
                // api.js might not be imported, let's import it at the top of the file using another tool call, or do it here if possible. 
                // Better to import it at the top. Let's provide the whole content or just the effect.
                const { default: api } = await import("../../../../../utils/api.js");
                const response = await api.get('/documentTypes');
                const types = response.data.data || response.data;
                setDocTypeOptions(types.map(t => ({ label: `${t.name} (${t.code})`, value: t._id })));
            } catch (error) {
                console.error("Error fetching document types:", error);
            }
        };
        fetchDocTypes();
    }, []);

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    const validate = () => {
        return {
            tipoDocumento: Validations.campoRequerido(formData.tipoDocumento) ? null : "Seleccione un tipo de documento.",
            documento: formData.documento ? null : "El documento es obligatorio", // simplified validation since validation might depend on old logic
            nombres: Validations.validarNombreApellido(formData.nombres).valido ? null : Validations.validarNombreApellido(formData.nombres).mensaje,
            apellidos: Validations.validarNombreApellido(formData.apellidos).valido ? null : Validations.validarNombreApellido(formData.apellidos).mensaje,
            email: Validations.validarEmail(formData.email).valido ? null : Validations.validarEmail(formData.email).mensaje,
            telefono: Validations.validarTelefono(formData.telefono).valido ? null : Validations.validarTelefono(formData.telefono).mensaje
        };
    };
    const currentValidation = validate();

    const errors = {
        tipoDocumento: tocado.tipoDocumento ? currentValidation.tipoDocumento : null,
        documento: tocado.documento ? currentValidation.documento : null,
        nombres: tocado.nombres ? currentValidation.nombres : null,
        apellidos: tocado.apellidos ? currentValidation.apellidos : null,
        email: tocado.email ? currentValidation.email : null,
        telefono: tocado.telefono ? currentValidation.telefono : null,
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "documento") value = value.replace(/\D/g, "").slice(0, 15);
        if (name === "telefono") value = value.replace(/\D/g, "").slice(0, 15);
        if (name === "nombres" || name === "apellidos") { value = value.replace(/[0-9]/g, ""); value = value.slice(0, 40); }

        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleForm = (e) => {
        e.preventDefault();
        setTocado({ tipoDocumento: true, documento: true, nombres: true, apellidos: true, email: true, telefono: true });

        const currentErrors = validate();
        if (Object.values(currentErrors).some(err => err !== null)) return;

        onSubmit(formData);
    };

    const resetForm = () => {
        setFormData(defaultData);
        setTocado({
            tipoDocumento: false, documento: false, nombres: false,
            apellidos: false, email: false, telefono: false
        });
    };

    return {
        formData,
        errors,
        tocado,
        handleChange,
        handleSelectChange,
        handleForm,
        resetForm,
        docTypeOptions
    };
}