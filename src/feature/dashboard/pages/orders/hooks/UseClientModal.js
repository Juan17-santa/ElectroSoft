import { useState } from "react";
import { Validations } from "../../../../../utils/validations";

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

    // FUNCIÓN PARA VALIDAR UN CAMPO INDIVIDUAL
    const validateField = (name, value) => {

        let error = "";

        // EVALUACIÓN DE REGLAS SEGÚN EL NOMBRE DEL CAMPO
        switch (name) {

            case "tipoDocumento":
                if (!value) error = "Seleccione un tipo de documento";
                break;

            case "documento":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                } 
                break;

            case "nombres":
                if (!value) {
                    error = "El nombre es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "apellidos":
                if (!value) {
                    error = "El apellido es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "email":
                if (!value) {
                    error = "El email es obligatorio";
                } else if (!Validations.formatoEmail(value)) {
                    error = "Formato email invalido";
                }
                break;

            case "telefono":
                if (!value) {
                    error = "El teléfono es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 14) {
                    error = "Debe tener entre 8 y 14 dígitos";
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

        // ACTUALIZAR EL VALOR DEL CAMPO EN EL ESTADO
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // VALIDAR EL CAMPO EN TIEMPO REAL MIENTRAS EL USUARIO ESCRIBE
        const error = validateField(name, value);

        // ACTUALIZAR EL ESTADO DE ERRORES PARA EL CAMPO ESPECÍFICO
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
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

        // RETORNAR TRUE SI NO HAY NINGÚN ERROR
        return Object.keys(newErrors).length === 0;
    };

    // PROCESAMIENTO DEL ENVÍO DEL FORMULARIO
    const handleSubmit = (e) => {
        e.preventDefault();

        // DETENER LA EJECUCIÓN SI EL FORMULARIO NO ES VÁLIDO
        if (!validateForm()) return;

        // CONSTRUCCIÓN DEL OBJETO DE NUEVO CLIENTE CON DATOS ADICIONALES
        const nuevoCliente = {
            ...formData,
            id: Date.now(),
            estado: true,
            fechaCreacion: new Date().toISOString().split("T")[0],
            totalCompras: 0
        };

        onSave(nuevoCliente);
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        formData,
        errors,
        handleChange,
        handleSubmit
    };
};