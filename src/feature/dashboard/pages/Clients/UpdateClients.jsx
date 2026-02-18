import { User, FileText, X, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";

export default function UpdateClients() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
        totalCompras: 0,
        estado: true
    });

    useEffect(() => {
        const data = localStorage.getItem("clientToEdit");

        if (data) {
            setFormData(JSON.parse(data));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleForm = (e) => {
        e.preventDefault();

        try {

            if (!formData.tipoDocumento) {
                alert("Seleccione un tipo de documento");
                return;
            }

            if (formData.documento.length < 5) {
                alert("El documento debe tener mínimo 5 caracteres");
                return;
            }

            if (formData.nombres.length < 3) {
                alert("El nombre debe tener mínimo 3 caracteres");
                return;
            }

            if (formData.apellidos.length < 3) {
                alert("El apellido debe tener mínimo 3 caracteres");
                return;
            }

            if (!formData.email.includes("@")) {
                alert("Ingrese un email válido");
                return;
            }

            if (formData.telefono.length < 7) {
                alert("El teléfono debe tener mínimo 7 dígitos");
                return;
            }

            ClientsService.update(formData);

            alert("Cliente actualizado correctamente!");

            // LIMPIEZA: Borramos el rastro del localStorage
            localStorage.removeItem("clientToEdit");

            navigate("/dashboard/clients");

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Editar <span className="text-yellow-400">cliente</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/clients")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm}>
                    <div className="flex flex-col gap-6 mt-6">

                        {/* FILA 1: TIPO DE DOCUMENTO Y DOCUMENTO */}
                        <div className="flex gap-6 justify-center">
                            {/* TIPO DE DOCUMENTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <FileText size={16} />
                                    <span>Tipo de documento *</span>
                                </div>
                                <select
                                    name="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="">Seleccione un tipo de documento</option>
                                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                                    <option value="NIT">NIT</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
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
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        {/* FILA 2: NOMBRES Y APELLIDOS */}
                        <div className="flex gap-6 justify-center">
                            {/* NOMBRES */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Nombres *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    placeholder="Ingrese su nombre completo"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* APELLIDOS */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Apellidos *</span>
                                </div>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    placeholder="Ingrese su nombre completo"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        {/* FILA 3: EMAIL Y TELEFONO */}
                        <div className="flex gap-6 justify-center">
                            {/* EMAIL */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <Mail size={16} />
                                    <span>Email *</span>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ingrese su email"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* TELEFONO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <Phone size={16} />
                                    <span>Teléfono *</span>
                                </div>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="Digite su teléfono"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        {/* BOTON */}
                        <div className="flex justify-end mt-4 pr-4">
                            <button
                                type="submit"
                                className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                            >
                                Registrar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}