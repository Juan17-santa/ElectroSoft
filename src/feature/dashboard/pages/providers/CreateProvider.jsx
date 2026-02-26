import { User, FileText, X, IdCard, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProviders } from "./services/ServicesProviders";
import { Validations } from "../../../../utils/validations";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Alert from "../../components/ui/alert";

export default function CreateProvider() {
    const navigate = useNavigate();

    // TRAER CATEGORIAS PARA MAPEAR AL MOMENTO DE CREAR EL PROVEEDOR EN CATEGORIAS ASOCIADAS 
    const [categorias, setCategorias] = useState([]);

    // DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombreProveedor: "",
        nombreContacto: "",
        telefonoContacto: "",
        categoriasAsociadas: []
    })

    // VALIDACIONES
    const [errors, setErrors] = useState({});

    // ALERTA
    const [alert, setAlert] = useState(null);

    // FUNCION PARA VALIDAR LOS CAMPOS DEL FORMULARIO DE MANERA INDIVIDUAL
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
                    error = "Solo letras, números, espacios y los símbolos . - & (debe contener al menos una letra)";
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

    // CARGAR LAS CATEGORIAS
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("productCategory")) || [];
        setCategorias(data);
    }, []);

    // MANEJAR CAMBIOS EN LOS CAMPOS DEL FORMULARIO
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);

        setErrors((prev) => ({
            ...prev,
            [name]: error
        }));
    };

    // MANEJAR ENVIO DEL FORMULARIO
    const handleForm = (e) => {
        e.preventDefault();

        try {
            let newErrors = {};

            // Validamos todos los campos antes de enviar el formulario
            Object.keys(formData).forEach((field) => {
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            });

            // Si hay errores, los seteamos y no enviamos el formulario
            setErrors(newErrors);

            // Si hay algún error, no procedemos con la creación del proveedor
            if (Object.keys(newErrors).length > 0) return;

            // Aquí iría la lógica para enviar los datos al backend o guardarlos en el localStorage
            ServicesProviders.create(formData);

            // Mostramos una alerta de éxito y redirigimos a la lista de proveedores
            setAlert({
                type: "success",
                message: "Proveedor creado correctamente"
            });

            setFormData({
                tipoDoc: "",
                documento: "",
                nombreProveedor: "",
                nombreContacto: "",
                telefonoContacto: "",
                categoriasAsociadas: []
            });

            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 3000);
        } catch (error) {
            setAlert({
                type: "error",
                message: "Hubo un error al crear el proveedor"
            });
        }
    };

    // Estado para controlar la apertura del dropdown de categorías
    const [open, setOpen] = useState(false);

    // Función para manejar la selección/deselección de categorías en el dropdown
    const handleToggleCategoria = (id) => {
        setFormData(prev => ({
            ...prev,
            categoriasAsociadas: prev.categoriasAsociadas.includes(id)
                ? prev.categoriasAsociadas.filter(c => c !== id)
                : [...prev.categoriasAsociadas, id]
        }));
    };


    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nuevo proveedor</p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm}>
                    <div className="flex flex-col items-center gap-12 mt-6 justify-around mx-28">

                        <div className="flex gap-20">
                            {/* TIPO DOCUMENTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <IdCard size={16} />
                                    <span>Tipo de documento *</span>
                                </div>
                                <select
                                    name="tipoDoc"
                                    value={formData.tipoDoc}
                                    onChange={handleChange}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.tipoDoc ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                >
                                    <option value="" hidden>Seleccione un tipo</option>
                                    <option value="NIT">NIT</option>
                                    <option value="CC">C.C</option>
                                    <option value="CE">C.E</option>
                                </select>
                                {errors.tipoDoc && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.tipoDoc}
                                    </p>
                                )}
                            </div>

                            {/* DOCUMENTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <FileText size={16} />
                                    <span>Documento *</span>
                                </div>
                                <input
                                    type="text"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    placeholder="Ingrese su documento"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />
                                {errors.documento && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.documento}
                                    </p>
                                )}
                            </div>
                        </div>


                        <div className="flex gap-20">
                            {/* NOMBRE PROVEEDOR */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Nombre Proveedor *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombreProveedor"
                                    value={formData.nombreProveedor}
                                    onChange={handleChange}
                                    placeholder="Ingrese el nombre del proveedor"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.nombreProveedor ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />
                                {errors.nombreProveedor && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nombreProveedor}
                                    </p>
                                )}
                            </div>

                            {/* CATEGORIAS ASOCIADAS */}
                            <div className="flex flex-col gap-3 w-80 relative">

                                {/* TITULO CON ICONO */}
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Categorías Asociadas</span>
                                </div>

                                {/* BOTON SELECTOR */}
                                <button
                                    type="button"
                                    onClick={() => setOpen(!open)}
                                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <span className="text-left">
                                        {formData.categoriasAsociadas.length > 0
                                            ? `${formData.categoriasAsociadas.length} seleccionada(s)`
                                            : "Seleccionar categorías"}
                                    </span>

                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* DROPDOWN */}
                                {open && (
                                    <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl p-3 max-h-48 overflow-y-auto z-20">
                                        {categorias.map(cat => (
                                            <label
                                                key={cat.id}
                                                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categoriasAsociadas.includes(cat.id)}
                                                    onChange={() => handleToggleCategoria(cat.id)}
                                                    className="accent-yellow-400"
                                                />
                                                {cat.nombre}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-20">
                            {/* NOMBRE CONTACTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Nombre Contacto *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombreContacto"
                                    value={formData.nombreContacto}
                                    onChange={handleChange}
                                    placeholder="Ingrese el nombre de contacto"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.nombreContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />
                                {errors.nombreContacto && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nombreContacto}
                                    </p>
                                )}
                            </div>

                            {/* TELEFONO CONTACTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Telefono Contacto*</span>
                                </div>
                                <input
                                    type="text"
                                    name="telefonoContacto"
                                    value={formData.telefonoContacto}
                                    onChange={handleChange}
                                    placeholder="Ingrese el telefono"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.telefonoContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                                />
                                {errors.telefonoContacto && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.telefonoContacto}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-end mt-6 w-full gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/providers")}
                            className="px-5 py-2  text-sm rounded-lg shadow-md font-medium transition flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 hover:shadow-lg duration-300 cursor-pointer"
                        >
                            <X size={16} />
                            Cancelar
                        </button>
                        <PrimaryButton
                            type="submit"
                            disabled={Object.values(errors).some(error => error)}
                        >
                            Registrar Proveedor
                        </PrimaryButton>
                    </div>
                </form >
            </div>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}