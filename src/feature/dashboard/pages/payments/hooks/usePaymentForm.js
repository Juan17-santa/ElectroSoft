import { useState, useEffect } from "react";
import paymentsService from "../services/PaymentsService";

export function usePaymentForm({ onSuccess }) {

    const [formData, setFormData] = useState({
        documento: "",
        clienteNombre: "",
        ventaId: null,
        numeroVenta: "",
        montoPorPagar: 0,
        abonos: [],
        metodoPago: "",
        monto: "",
    });

    const [allSales, setAllSales] = useState([]);
    const [ventasDelDocumento, setVentasDelDocumento] = useState([]);
    const [errors, setErrors] = useState({});

    const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

    // Cargar ventas pendientes al montar
    useEffect(() => {
        setAllSales(paymentsService.getPending());
    }, []);

    // Buscar automáticamente al escribir el documento
    useEffect(() => {
        if (!formData.documento.trim()) {
            setVentasDelDocumento([]);
            setFormData(prev => ({
                ...prev,
                clienteNombre: "",
                ventaId: null,
                numeroVenta: "",
                montoPorPagar: 0,
                abonos: [],
            }));
            return;
        }

        const encontradas = allSales.filter(
            s => s.numeroDocumento === formData.documento.trim()
        );

        setVentasDelDocumento(encontradas);

        if (encontradas.length === 1) {
            const v = encontradas[0];
            setFormData(prev => ({
                ...prev,
                clienteNombre: v.cliente,
                ventaId: v.id,
                numeroVenta: v.numeroVenta || `V-${v.id}`,
                montoPorPagar: v.montoPorPagar,
                abonos: v.abonos || [],
            }));
            setErrors(prev => ({ ...prev, documento: "" }));

        } else if (encontradas.length > 1) {
            setFormData(prev => ({
                ...prev,
                clienteNombre: encontradas[0].cliente,
                ventaId: null,
                numeroVenta: "",
                montoPorPagar: 0,
                abonos: [],
            }));
            setErrors(prev => ({ ...prev, documento: "" }));

        } else {
            setFormData(prev => ({
                ...prev,
                clienteNombre: "",
                ventaId: null,
                numeroVenta: "",
                montoPorPagar: 0,
                abonos: [],
            }));
            setErrors(prev => ({
                ...prev,
                documento: "No se encontró ninguna venta pendiente para ese documento."
            }));
        }

    }, [formData.documento, allSales]);

    // ── Validación por campo ──────────────────────────────────────────────────
    const validateField = (name, value) => {
        switch (name) {
            case "documento":
                if (!value) return "El documento es obligatorio";
                if (ventasDelDocumento.length === 0 && value) return "No se encontró ninguna venta pendiente";
                return "";
            case "ventaId":
                if (!value) return "Selecciona una venta";
                return "";
            case "metodoPago":
                if (!value) return "Selecciona un método de pago";
                return "";
            case "monto": {
                const raw = parseFloat(String(value).replace(/\./g, "").replace(",", ".")) || 0;
                if (!raw || raw <= 0) return "Ingresa un monto válido";
                if (raw > formData.montoPorPagar) return `El monto no puede superar $${fmt(formData.montoPorPagar)}`;
                return "";
            }
            default:
                return "";
        }
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSelectVenta = (id) => {
        const found = allSales.find(s => s.id === Number(id));
        if (found) {
            setFormData(prev => ({
                ...prev,
                ventaId: found.id,
                numeroVenta: found.numeroVenta || `V-${found.id}`,
                montoPorPagar: found.montoPorPagar,
                abonos: found.abonos || [],
            }));
            setErrors(prev => ({ ...prev, ventaId: "" }));
        }
    };

    // ── Validar formulario completo ───────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};
        ["documento", "ventaId", "metodoPago", "monto"].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const raw = parseFloat(String(formData.monto).replace(/\./g, "").replace(",", ".")) || 0;

        const resultado = paymentsService.createAbono(
            formData.documento,
            formData.ventaId,
            { paymentMethod: formData.metodoPago, amount: raw }
        );

        if (!resultado) return;

        onSuccess();
    };

    return {
        formData,
        errors,
        handleChange,
        handleSelectVenta,
        handleSubmit,
        ventasDelDocumento,
    };
}