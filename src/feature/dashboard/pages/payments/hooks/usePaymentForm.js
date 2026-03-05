import { useState, useEffect } from "react";
import paymentsService from "../services/PaymentsService";
import { Validations } from "../../../../../utils/validations";

export function usePaymentForm({ paymentToEdit, navigate, paymentId }) {

    // =========================
    // STATE
    // =========================
    const [formData, setFormData] = useState({
        paymentMethod: "",
        amount: "",
    });

    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    // =========================
    // CARGAR ABONO (EDIT)
    // =========================
    useEffect(() => {
        if (paymentToEdit) {
            setFormData(paymentToEdit);
        }
    }, [paymentToEdit]);

    // =========================
    // VALIDAR CAMPO
    // =========================
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "paymentMethod":
                if (!value) error = "Seleccione un método de pago";
                break;

            case "amount":
                if (!value) {
                    error = "El monto es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (Number(value) <= 0) {
                    error = "Debe ser mayor a 0";
                }
                break;

            default:
                break;
        }

        return error;
    };

    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // =========================
    // VALIDAR FORM COMPLETO
    // =========================
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================
    // CREATE ABONO
    // =========================
    const createPayment = () => {

        const updated = paymentsService.createAbono(paymentId, {
            paymentMethod: formData.paymentMethod,
            amount: formData.amount
        });

        if (!updated) {
            setAlert({
                type: "error",
                message: "No se pudo registrar el abono"
            });
            return null;
        }

        setAlert({
            type: "success",
            message: "Abono registrado correctamente"
        });

        return updated;
    };

    // =========================
    // HANDLE SUBMIT
    // =========================
    const handleSubmit = (e, mode) => {

        e.preventDefault();

        if (!validateForm()) return;

        let updated;

        if (mode === "create") {
            updated = createPayment();
        }

        if (!updated) return;

        setTimeout(() => {
            navigate("/dashboard/payments");
        }, 1500);
    };

    return {
        formData,
        errors,
        alert,
        setAlert,
        handleChange,
        validateForm,
        createPayment,
        handleSubmit
    };
}