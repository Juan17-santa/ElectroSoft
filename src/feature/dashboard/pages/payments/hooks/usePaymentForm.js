import { useState, useEffect } from "react";
import paymentsService from "../services/paymentsService";

export function usePaymentForm({ onSuccess, ventaIdPreseleccionada = null, documentoPreseleccionado = null }) {

    const [formData, setFormData] = useState({
        documento: documentoPreseleccionado || "",
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
    const [formError, setFormError] = useState("");
    const [initialized, setInitialized] = useState(false);

    const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

    useEffect(() => {
        const fetchPending = async () => {
            const sales = await paymentsService.getPending();
            setAllSales(sales);

            // Si viene con ventaId preseleccionado desde la URL
            if (ventaIdPreseleccionada) {
                const found = sales.find(s => s.id === Number(ventaIdPreseleccionada) || String(s.id) === String(ventaIdPreseleccionada));
                if (found) {
                    setFormData(prev => ({
                        ...prev,
                        documento: found.numeroDocumento || documentoPreseleccionado || "",
                        clienteNombre: found.cliente,
                        ventaId: found.id,
                        numeroVenta: found.numeroVenta || `V-${found.id}`,
                        montoPorPagar: found.montoPorPagar,
                        abonos: found.abonos || [],
                    }));
                }
            }

            setInitialized(true);
        };
        fetchPending();
    }, []);

    // Buscar automáticamente al escribir el documento
    useEffect(() => {
        if (!initialized) return;
        if (ventaIdPreseleccionada) return; // no buscar si ya viene preseleccionado

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
    }, [formData.documento, allSales, initialized]);

    const validateField = (name, value) => {
        switch (name) {
            case "documento":
                if (!value) return "El documento es obligatorio";
                if (ventasDelDocumento.length === 0 && !ventaIdPreseleccionada) return "No se encontró ninguna venta pendiente";
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
                
                const minAbono = Math.min(10000, formData.montoPorPagar);
                if (raw < minAbono) return `El abono mínimo es de $${fmt(minAbono)}`;
                if (raw % 50 !== 0 && raw !== formData.montoPorPagar) return "El abono debe ser múltiplo de 50";
                if (raw > formData.montoPorPagar) return `El monto no puede superar $${fmt(formData.montoPorPagar)}`;
                
                return "";
            }
            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSelectVenta = (id) => {
        const found = allSales.find(s => String(s.id) === String(id));
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

    const validateForm = () => {
        const newErrors = {};
        ["documento", "ventaId", "metodoPago", "monto"].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const raw = parseFloat(String(formData.monto).replace(/\./g, "").replace(",", ".")) || 0;

        setFormError("");
        try {
            const resultado = await paymentsService.createAbono(
                formData.documento,
                formData.ventaId,
                { paymentMethod: formData.metodoPago, amount: raw }
            );

            if (!resultado) {
                setFormError("No se pudo crear el abono.");
                return;
            }
            onSuccess();
        } catch (e) {
            console.error("Error creating abono:", e);
            const msg = e.response?.data?.error || e.message || "Error al procesar el abono en el servidor";
            setFormError(msg);
        }
    };

    return {
        formData,
        errors,
        formError,
        setFormError,
        handleChange,
        handleSelectVenta,
        handleSubmit,
        ventasDelDocumento,
    };
}