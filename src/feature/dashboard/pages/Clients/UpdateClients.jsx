import { User, FileText, X, Mail, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";
import Alert from "../../components/ui/Alert";

// ─── Validaciones ─────────────────────────────────────────────────────────────
import { Validations } from "../../../../utils/validations";

function FieldStatus({ estado }) {
    if (estado === null || estado === undefined) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 ${estado.valido ? "text-green-500" : "text-red-500"}`}>
            {estado.valido ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>{estado.valido ? "Listo" : estado.mensaje}</span>
        </div>
    );
}

export default function UpdateClients() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        id: "", tipoDocumento: "", documento: "",
        nombres: "", apellidos: "", email: "",
        telefono: "", totalCompras: 0, estado: true
    });

    const [tocado, setTocado] = useState({
        tipoDocumento: false, documento: false, nombres: false,
        apellidos: false, email: false, telefono: false
    });

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    useEffect(() => {
        const data = localStorage.getItem("clientToEdit");
        if (data) setFormData(JSON.parse(data));
    }, []);

    const estadoTipoDoc = tocado.tipoDocumento ? (Validations.campoRequerido(formData.tipoDocumento) ? { valido: true } : { valido: false, mensaje: "Seleccione un tipo de documento." }) : null;
    const estadoDocumento = tocado.documento ? Validations.validarDocumentoCliente(formData.tipoDocumento, formData.documento) : null;
    const estadoNombres = tocado.nombres ? Validations.validarNombreApellido(formData.nombres) : null;
    const estadoApellidos = tocado.apellidos ? Validations.validarNombreApellido(formData.apellidos) : null;
    const estadoEmail = tocado.email ? (Validations.formatoEmail(formData.email) ? { valido: true } : { valido: false, mensaje: "Ingrese un email válido." }) : null;
    const estadoTelefono = tocado.telefono ? Validations.validarTelefono(formData.telefono) : null;

    const ringClass = (estado) => {
        if (!estado) return "focus:ring-yellow-400";
        return estado.valido ? "ring-1 ring-green-400 focus:ring-green-500" : "ring-1 ring-red-300 focus:ring-red-400";
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
        setTocado({ tipoDocumento: true, documento: true, nombres: true, apellidos: true, email: true, telefono: true });

        const v = [
            Validations.campoRequerido(formData.tipoDocumento) ? { valido: true } : { valido: false, mensaje: "Requerido" },
            Validations.validarDocumentoCliente(formData.tipoDocumento, formData.documento),
            Validations.validarNombreApellido(formData.nombres),
            Validations.validarNombreApellido(formData.apellidos),
            Validations.formatoEmail(formData.email) ? { valido: true } : { valido: false, mensaje: "Email inválido" },
            Validations.validarTelefono(formData.telefono),
        ];
        if (v.some(x => !x.valido)) return;

        try {
            ClientsService.update(formData);
            localStorage.removeItem("clientToEdit");
            setAlert({ type: "success", message: "Cliente actualizado correctamente." });
            setTimeout(() => navigate("/dashboard/clients"), 1500);
        } catch (error) {
            console.error(error);
            setAlert({ type: "error", message: "Error al actualizar el cliente." });
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Editar <span className="text-yellow-400">cliente</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer" onClick={() => navigate("/dashboard/clients")}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleForm}>
                    <div className="flex flex-col gap-6 mt-6">

                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Tipo de documento *</span></div>
                                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} onBlur={() => tocar("tipoDocumento")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoTipoDoc)}`}>
                                    <option value="">Seleccione un tipo de documento</option>
                                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                                    <option value="NIT">NIT</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                                <FieldStatus estado={estadoTipoDoc} />
                            </div>
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><FileText size={16} /><span>Documento *</span></div>
                                <input type="text" name="documento" value={formData.documento} onChange={handleChange} onBlur={() => tocar("documento")}
                                    placeholder="Ingrese su documento"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoDocumento)}`} />
                                <FieldStatus estado={estadoDocumento} />
                            </div>
                        </div>

                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><User size={16} /><span>Nombres *</span></div>
                                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} onBlur={() => tocar("nombres")}
                                    placeholder="Ingrese su nombre completo"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoNombres)}`} />
                                <FieldStatus estado={estadoNombres} />
                            </div>
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><User size={16} /><span>Apellidos *</span></div>
                                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} onBlur={() => tocar("apellidos")}
                                    placeholder="Ingrese sus apellidos"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoApellidos)}`} />
                                <FieldStatus estado={estadoApellidos} />
                            </div>
                        </div>

                        <div className="flex gap-6 justify-center">
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><Mail size={16} /><span>Email *</span></div>
                                <input type="text" name="email" value={formData.email} onChange={handleChange} onBlur={() => tocar("email")}
                                    placeholder="Ingrese su email"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoEmail)}`} />
                                <FieldStatus estado={estadoEmail} />
                            </div>
                            <div className="flex flex-col gap-0 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium mb-2"><Phone size={16} /><span>Teléfono *</span></div>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} onBlur={() => tocar("telefono")}
                                    placeholder="Digite su teléfono"
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${ringClass(estadoTelefono)}`} />
                                <FieldStatus estado={estadoTelefono} />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pr-4">
                            <button type="submit" className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium">
                                Actualizar
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}