/**
 * ============================================================
 * UpdateProvider.jsx
 * ------------------------------------------------------------
 * Página encargada de:
 * - Cargar la información de un proveedor existente
 * - Mostrar los datos en el formulario para edición
 * - Validar los campos modificados
 * - Actualizar el proveedor en el storage
 * - Mostrar alertas de éxito o error
 *
 * Este archivo contiene:
 * ✔ Lógica de actualización
 * ✔ Validaciones
 * ✔ Manejo de estado
 * ✔ Navegación
 *
 * El proveedor se recibe desde:
 * navigate("/dashboard/providers/update", { state: { provider } })
 *
 * El diseño visual del formulario está en ProviderForm.jsx
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ServicesProviders } from "../services/ServicesProviders";
import { Validations } from "../../../../../utils/validations";
import Alert from "../../../components/ui/alert";
import ProviderForm from "../components/ProvidersForm";
import { X } from "lucide-react";

export default function UpdateProvider() {

    // Hook de navegación
    const navigate = useNavigate();

    // Hook para recibir el state enviado desde la tabla
    const location = useLocation();

    // Proveedor recibido desde el index
    const providerToEdit = location.state?.provider;

    // Lista de categorías cargadas desde localStorage
    const [categorias, setCategorias] = useState([]);

    // Controla apertura/cierre del dropdown de categorías
    const [open, setOpen] = useState(false);

    // Datos del formulario (se llenarán con el proveedor a editar)
    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombreProveedor: "",
        nombreContacto: "",
        telefonoContacto: "",
        categoriasAsociadas: []
    });

    // Errores de validación
    const [errors, setErrors] = useState({});

    // Estado de alerta (success / error)
    const [alert, setAlert] = useState(null);

    // CARGAR CATEGORÍAS
    // Se ejecuta una vez al montar el componente
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("productCategory")) || [];
        setCategorias(data);
    }, []);

    // Cargar proveedor a editar
    useEffect(() => {
        if (providerToEdit) {
            setFormData(providerToEdit);
        } else {
            // Si no llega proveedor, redirigir a la lista
            navigate("/dashboard/providers");
        }
    }, [providerToEdit, navigate]);

    // VALIDACIONES INDIVIDUALES
    // Valida cada campo según su nombre
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "tipoDoc":
                if (!value) error = "Seleccione un tipo de documento";
                break;

            case "documento":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo se permiten números";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                }
                break;

            case "nombreProveedor":
                if (!value) {
                    error = "El nombre del proveedor es obligatorio";
                } else if (!Validations.alfanumericoNombre(value)) {
                    error = "Solo letras, números y símbolos permitidos";
                }
                break;

            case "nombreContacto":
                if (!value) {
                    error = "El nombre del contacto es obligatorio";
                } else if (!Validations.soloLetras(value)) {
                    error = "Solo se permiten letras";
                }
                break;

            case "telefonoContacto":
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

    // MANEJAR CAMBIOS DE INPUTS
    const handleChange = (e) => {

        const { name, value } = e.target;

        // Actualiza el estado del formulario
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Valida el campo en tiempo real
        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // SELECCIONAR/Deseleccionar categorías
    const handleToggleCategoria = (id) => {

        setFormData(prev => ({
            ...prev,
            categoriasAsociadas: prev.categoriasAsociadas.includes(id)
                ? prev.categoriasAsociadas.filter(c => c !== id)
                : [...prev.categoriasAsociadas, id]
        }));
    };

    // MANEJAR ENVÍO DEL FORMULARIO
    const handleSubmit = (e) => {

        e.preventDefault();

        let newErrors = {};

        // Validar todos los campos antes de actualizar
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        // Si existen errores, detener proceso
        if (Object.keys(newErrors).length > 0) return;

        try {

            // Actualizar proveedor existente
            ServicesProviders.update(formData);

            setAlert({
                type: "success",
                message: "Proveedor actualizado correctamente"
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 2000);

        } catch (error) {

            setAlert({
                type: "error",
                message: "Hubo un error al actualizar el proveedor"
            });
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">

                {/* HEADER DE LA PÁGINA */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">
                            Editar proveedor
                        </p>
                        <p className="text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categorias}
                    open={open}
                    setOpen={setOpen}
                    handleChange={handleChange}
                    handleToggleCategoria={handleToggleCategoria}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/providers")}
                    buttonText="Actualizar proveedor"
                />

                {/* ALERTA */}
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}
            </div>
        </>
    )
}