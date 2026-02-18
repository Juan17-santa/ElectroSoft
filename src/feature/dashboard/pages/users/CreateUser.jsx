import { User, FileText, Mail, IdCard, Users, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addUser} from "./services/usersService";

export default function CreateUser() {
  const navigate = useNavigate();

  const [tipoDoc, setTipoDoc] = useState("");
  const [documento, setDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("");

  // ✅ Inicializar localStorage una sola vez
  // useEffect(() => {
  //   initUsers();
  // }, []);

  const handleSubmit = () => {
    if (!tipoDoc || !documento || !nombres || !apellidos || !email || !telefono || !rol) {
      alert("Completa todos los campos");
      return;
    }

    const nuevoUsuario = {
      documento: `${tipoDoc} ${documento}`,
      nombre: `${nombres} ${apellidos}`,
      email,
      telefono,
      rol,
      estado: true,
    };



    // ✅ addUser devuelve el usuario creado
    addUser(nuevoUsuario);

    alert("Usuario creado correctamente");
    navigate("/dashboard/users");
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-semibold mb-2">
            Crear nuevo <span className="text-yellow-400">usuario</span>
          </p>
          <p className="text-sm text-gray-600">
            Complete todos los campos del formulario
          </p>
        </div>

        <button
          className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
          onClick={() => navigate("/dashboard/users")}
        >
          <X size={20} />
        </button>
      </div>

      {/* FORM */}
      <div className="flex flex-wrap gap-10 mt-6 justify-around mx-28">

        {/* TIPO DOCUMENTO */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <IdCard size={16} />
            <span>Tipo de documento *</span>
          </div>
          <div className="relative">
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value)}
              className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Seleccione un tipo</option>
              <option value="C.C">C.C</option>
              <option value="T.I">T.I</option>
              <option value="C.E">C.E</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
        </div>

        {/* DOCUMENTO */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <FileText size={16} />
            <span>Documento *</span>
          </div>
          <input
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            type="text"
            placeholder="Ingrese su documento"
            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* NOMBRES */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <User size={16} />
            <span>Nombres *</span>
          </div>
          <input
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            type="text"
            placeholder="Ingrese sus nombres"
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
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            type="text"
            placeholder="Ingrese sus apellidos"
            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* EMAIL */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <Mail size={16} />
            <span>Email *</span>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Ingrese su email"
            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        {/* TELEFONO */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <span>Teléfono *</span>
          </div>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            type="text"
            placeholder="Ingrese su teléfono"
            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>


        {/* ROL */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <Users size={16} />
            <span>Rol *</span>
          </div>
          <div className="relative">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Seleccione un rol</option>
              <option value="Admin">Admin</option>
              <option value="Empleado">Empleado</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
        </div>

        {/* BOTON */}
        <div className="flex justify-end mt-6 w-full">
          <button
            onClick={handleSubmit}
            className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow transition cursor-pointer font-medium"
          >
            Registrar Usuario
          </button>
        </div>
      </div>
    </div>
  );
}
