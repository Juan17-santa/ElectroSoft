import { useEffect, useRef, useState } from "react";
import { Validations } from "../../../../../utils/validations";
import { ClientsService } from "../../Clients/services/ClientsService";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DEL FORMULARIO DE CLIENTES
export const useClientModal = (onSave) => {

    // ESTADO INICIAL PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    // ESTADO PARA OBTENER LOS TIPOS DE DOCUMENTO DESDE EL BACKEND
    const [documentTypes, setDocumentTypes] = useState([]);
    const validationTimerRef = useRef(null);
    const validationRequestRef = useRef(0);

    useEffect(() => {
        const loadDocumentTypes = async () => {
            const data = await ClientsService.getDocumentTypes();
            setDocumentTypes(data);
        };

        loadDocumentTypes();

        return () => {
            clearTimeout(validationTimerRef.current);
            validationRequestRef.current += 1;
        };
    }, []);

    // FUNCIÓN PARA VALIDAR UN CAMPO INDIVIDUAL
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "tipoDocumento":
                if (!Validations.campoRequerido(value)) error = "Seleccione un tipo de documento.";
                break;

            case "documento":
                if (!Validations.campoRequerido(value)) {
                    error = "El documento es obligatorio.";
                } else {
                    const documentoResult = Validations.validarDocumentoCliente(value);
                    if (!documentoResult.valido) error = documentoResult.mensaje;
                }
                break;

            case "nombres":
                if (!Validations.campoRequerido(value)) {
                    error = "El nombre es obligatorio.";
                } else {
                    const nombresResult = Validations.validarNombreApellido(value);
                    if (!nombresResult.valido) error = nombresResult.mensaje;
                }
                break;

            case "apellidos":
                if (!Validations.campoRequerido(value)) {
                    error = "El apellido es obligatorio.";
                } else {
                    const apellidosResult = Validations.validarNombreApellido(value);
                    if (!apellidosResult.valido) error = apellidosResult.mensaje;
                }
                break;

            case "email":
                if (!Validations.campoRequerido(value)) {
                    error = "El email es obligatorio.";
                } else {
                    const emailResult = Validations.validarEmail(value);
                    if (!emailResult.valido) error = emailResult.mensaje;
                }
                break;

            case "telefono":
                if (!Validations.campoRequerido(value)) {
                    error = "El teléfono es obligatorio.";
                } else {
                    const telefonoResult = Validations.validarTelefono(value);
                    if (!telefonoResult.valido) error = telefonoResult.mensaje;
                }
                break;

            default:
                return error;
        }
        return error;
    };

    // MANEJADOR DE CAMBIOS EN LOS INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "documento") {
            newValue = value.replace(/\D/g, "").slice(0, 12);
        }

        if (name === "telefono") {
            newValue = value.replace(/\D/g, "").slice(0, 14);
        }

        // ACTUALIZAR EL VALOR DEL CAMPO EN EL ESTADO
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (formError) setFormError("");

        // VALIDAR EL CAMPO EN TIEMPO REAL MIENTRAS EL USUARIO ESCRIBE
        const error = validateField(name, newValue);

        // ACTUALIZAR EL ESTADO DE ERRORES PARA EL CAMPO ESPECÍFICO
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (name === "documento" || name === "email") {
            clearTimeout(validationTimerRef.current);
            validationRequestRef.current += 1;
            const requestId = validationRequestRef.current;

            if (!error) {
                validationTimerRef.current = setTimeout(async () => {
                    try {
                        const exists = name === "documento"
                            ? await ClientsService.checkDocumentExists(newValue)
                            : await ClientsService.checkEmailExists(newValue);

                        if (requestId !== validationRequestRef.current) return;

                        setErrors(prev => ({
                            ...prev,
                            [name]: exists
                                ? name === "documento"
                                    ? "Este documento ya está registrado."
                                    : "Este correo ya está registrado."
                                : ""
                        }));
                    } catch {
                        if (requestId !== validationRequestRef.current) return;
                        setErrors(prev => ({ ...prev, [name]: "" }));
                    }
                }, 600);
            }
        }
    };

    // FUNCIÓN PARA VALIDAR EL FORMULARIO COMPLETO
    const validateForm = () => {
        let newErrors = {};

        // RECORRER TODOS LOS CAMPOS Y EJECUTAR LA VALIDACIÓN INDIVIDUAL
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        // REEMPLAZAR EL ESTADO DE ERRORES CON LOS NUEVOS ENCONTRADOS
        setErrors(newErrors);
        setFormError("");

        // RETORNAR TRUE SI NO HAY NINGÚN ERROR
        return Object.keys(newErrors).length === 0;
    };

    // PROCESAMIENTO DEL ENVÍO DEL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();

        // DETENER LA EJECUCIÓN SI EL FORMULARIO NO ES VÁLIDO
        if (!validateForm()) return;

        try {
            const [documentExists, emailExists] = await Promise.all([
                ClientsService.checkDocumentExists(formData.documento),
                ClientsService.checkEmailExists(formData.email)
            ]);

            if (documentExists || emailExists) {
                setErrors(prev => ({
                    ...prev,
                    documento: documentExists ? "Este documento ya está registrado." : prev.documento,
                    email: emailExists ? "Este correo ya está registrado." : prev.email
                }));
                return;
            }
        } catch (error) {
            console.error("Error verificando datos duplicados:", error);
            setFormError("No fue posible verificar si el documento o correo ya existe.");
            return;
        }

        try {
            const clienteCreado = await ClientsService.create(formData);
            setFormError("");
            onSave(clienteCreado);
        } catch (error) {
            const backendMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Error al crear el cliente.";

            setFormError(backendMessage);
        }
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        documentTypes,
        formError,
        setFormError
    };
};