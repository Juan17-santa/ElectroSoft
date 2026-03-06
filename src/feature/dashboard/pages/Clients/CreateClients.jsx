import { User, FileText, X, Mail, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";
import Alert from "../../components/ui/Alert";

// ─── Validaciones ─────────────────────────────────────────────────────────────
function validarTipoDocumento(v) {
    if (!v) return { valido: false, mensaje: "Seleccione un tipo de documento." };
    return { valido: true, mensaje: "" };
}
function validarDocumento(v, formData) {
    if (!v) return { valido: false, mensaje: "El documento es requerido." };
    if (!/^\d+$/.test(v)) return { valido: false, mensaje: "Solo se permiten números." };
    if (formData?.tipoDocumento === "Cédula de ciudadanía" && v.length !== 10) {
        return { valido: false, mensaje: "La cédula debe tener exactamente 10 dígitos." };
    }
    return { valido: true, mensaje: "" };
}
function validarNombres(v) {
    if (!v) return { valido: false, mensaje: "El nombre es requerido." };
    if (v.length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
    if (/\d/.test(v)) return { valido: false, mensaje: "No debe contener números." };
    return { valido: true, mensaje: "" };
}
function validarApellidos(v) {
    if (!v) return { valido: false, mensaje: "El apellido es requerido." };
    if (v.length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
    if (/\d/.test(v)) return { valido: false, mensaje: "No debe contener números." };
    return { valido: true, mensaje: "" };
}
function validarEmail(v) {
    if (!v) return { valido: false, mensaje: "El email es requerido." };
    if (!v.includes("@")) return { valido: false, mensaje: "Ingrese un email válido." };
    return { valido: true, mensaje: "" };
}
function validarTelefono(v) {
    if (!v) return { valido: false, mensaje: "El teléfono es requerido." };
    if (v.length < 7) return { valido: false, mensaje: "Mínimo 7 dígitos." };
    if (!/^\d+$/.test(v)) return { valido: false, mensaje: "Solo se permiten números." };
    return { valido: true, mensaje: "" };
}

// ─── Mini-componente indicador ────────────────────────────────────────────────
function FieldStatus({ estado }) {
    if (estado === null || estado.valido) return null;
    return (
        <div className="flex items-center gap-1 text-xs mt-1 text-red-500">
            <AlertCircle size={12} /><span>{estado.mensaje}</span>
        </div>
    );
}

export default function CreateClients() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: ""
    });

    // Touched: solo muestra error después de que el usuario tocó el campo
    const [tocado, setTocado] = useState({
        tipoDocumento: false, documento: false, nombres: false,
        apellidos: false, email: false, telefono: false
    });

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    // Estados calculados en tiempo real
    const estadoTipoDoc = tocado.tipoDocumento ? validarTipoDocumento(formData.tipoDocumento) : null;
    const estadoDocumento = tocado.documento ? validarDocumento(formData.documento, formData) : null;
    const estadoNombres = tocado.nombres ? validarNombres(formData.nombres) : null;
    const estadoApellidos = tocado.apellidos ? validarApellidos(formData.apellidos) : null;
    const estadoEmail = tocado.email ? validarEmail(formData.email) : null;
    const estadoTelefono = tocado.telefono ? validarTelefono(formData.telefono) : null;

    const ringClass = (estado) => {
        if (estado === null || estado.valido) return "focus:ring-yellow-400";
        return "ring-1 ring-red-300 focus:ring-red-400";
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        // Forzar solo dígitos en campos numéricos
        if (name === "documento") value = value.replace(/\D/g, "").slice(0, 10);
        if (name === "telefono") value = value.replace(/\D/g, "").slice(0, 15);
        // Filtrar números en nombres y apellidos
        if (name === "nombres" || name === "apellidos") value = value.replace(/[0-9]/g, "");

        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleForm = (e) => {
        e.preventDefault();
        // Marcar todos como tocados al intentar enviar
        setTocado({ tipoDocumento: true, documento: true, nombres: true, apellidos: true, email: true, telefono: true });

        const v = [
            validarTipoDocumento(formData.tipoDocumento),
            validarDocumento(formData.documento, formData),
            validarNombres(formData.nombres),
            validarApellidos(formData.apellidos),
            validarEmail(formData.email),
            validarTelefono(formData.telefono),
        ];
        if (v.some(x => !x.valido)) return;

        try {
            ClientsService.create(formData);
            setAlert({ type: "success", message: "Cliente creado correctamente." });
            setFormData({ tipoDocumento: "", documento: "", nombres: "", apellidos: "", email: "", telefono: "" });
            setTimeout(() => navigate("/dashboard/clients"), 1500);
        } catch (error) {
            console.error(error);
            setAlert({ type: "error", message: "Error al crear el cliente." });
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nuevo <span className="text-yellow-400">cliente</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer" onClick={() => navigate("/dashboard/clients")}>
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm}>
                    <div className="flex flex-col gap-6 mt-6">

                        {/* FILA 1 */}
                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <FileText size={16} /><span>Tipo de documento *</span>
                                </div>
                                <select
                                    name="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                    onBlur={() => tocar("tipoDocumento")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoTipoDoc)}`}
                                >
                                    <option value="">Seleccione un tipo de documento</option>
                                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                                    <option value="NIT">NIT</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                                <FieldStatus estado={estadoTipoDoc} />
                            </div>

                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <FileText size={16} /><span>Documento *</span>
                                </div>
                                <input
                                    type="text"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    onBlur={() => tocar("documento")}
                                    placeholder="Ingrese su documento"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoDocumento)}`}
                                />
                                <FieldStatus estado={estadoDocumento} />
                            </div>
                        </div>

                        {/* FILA 2 */}
                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <User size={16} /><span>Nombres *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    onBlur={() => tocar("nombres")}
                                    placeholder="Ingrese su nombre completo"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoNombres)}`}
                                />
                                <FieldStatus estado={estadoNombres} />
                            </div>

                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <User size={16} /><span>Apellidos *</span>
                                </div>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    onBlur={() => tocar("apellidos")}
                                    placeholder="Ingrese sus apellidos"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoApellidos)}`}
                                />
                                <FieldStatus estado={estadoApellidos} />
                            </div>
                        </div>

                        {/* FILA 3 */}
                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <Mail size={16} /><span>Email *</span>
                                </div>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={() => tocar("email")}
                                    placeholder="Ingrese su email"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoEmail)}`}
                                />
                                <FieldStatus estado={estadoEmail} />
                            </div>

                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2">
                                    <Phone size={16} /><span>Teléfono *</span>
                                </div>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    onBlur={() => tocar("telefono")}
                                    placeholder="Digite su teléfono"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoTelefono)}`}
                                />
                                <FieldStatus estado={estadoTelefono} />
                            </div>
                        </div>

                        {/* BOTON */}
                        <div className="flex justify-end mt-4 pr-4">
                            <button type="submit" className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium">
                                Registrar
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}