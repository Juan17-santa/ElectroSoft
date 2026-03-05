import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersForm({ onSuccess }) {

    // FECHA ACTUAL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // FUNCION PARA CALCULAR EL VENCIMIENTO DE LA FECHA
    const calculateVencimiento = (fecha) => {
        const date = new Date(fecha);
        date.setDate(date.getDate() + 15);
        return date.toISOString().split("T")[0];
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        documento: "",
        clienteId: null,
        clienteNombre: "",
        clienteTipoDocumento: "",
        fechaPedido: todayFormatted,
        fechaVencimiento: calculateVencimiento(todayFormatted),
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0
    });

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // BUSCAR CLIENTE POR MEDIO DEL DOCUMENTO
    useEffect(() => {
        if (!formData.documento) return;

        const clientes = JSON.parse(localStorage.getItem("clients")) || [];

        const clienteEncontrado = clientes.find(
            c => c.documento === formData.documento && c.estado === true
        );

        if (clienteEncontrado) {
            setFormData(prev => ({
                ...prev,
                clienteId: clienteEncontrado.id,
                clienteNombre: `${clienteEncontrado.nombres} ${clienteEncontrado.apellidos}`,
                clienteTipoDocumento: clienteEncontrado.tipoDocumento
            }));

            setErrors(prev => ({ ...prev, documento: "" }));
        } else {
            setFormData(prev => ({
                ...prev,
                clienteId: null,
                clienteNombre: "",
                clienteTipoDocumento: ""
            }));
        }

    }, [formData.documento]);

    // VALIDACION INDIVIDUAL
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "documento":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                } else if (!formData.clienteId) {
                    error = "Cliente no encontrado";
                }
                break;

            default:
                break;
        }

        return error;
    };

    // HANDLE CHANGE CON VALIDACIÓN EN TIEMPO REAL
    const handleChange = (e) => {
        const { name, value } = e.target;

        // SI LA FECHA PEDIDO SE CAMBIA, LA FECHA DE VENCIMIENTO SE ACTUALIZA AUTOMATICAMENTE
        if (name === "fechaPedido") {
            setFormData(prev => ({
                ...prev,
                fechaPedido: value,
                fechaVencimiento: calculateVencimiento(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // VALIDAR TODO EL FORMULARIO
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        // if (!formData.productos.length) {
        //     newErrors.productos = "Debe agregar al menos un producto";
        // }

        if (!formData.clienteId) {
            newErrors.documento = "Debe seleccionar un cliente válido";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // FUNCION PARA GUARDAR
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const nuevoPedido = ServicesOrders.create(formData);

        onSuccess(nuevoPedido);
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData
    };
}