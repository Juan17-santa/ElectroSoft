import { User, FileText, Mail, IdCard, Users, X, ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById, updateUser } from "./services/usersService";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    tipoDocumento: "",
    documento: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    rol: "",
  });




  // 🔹 Cargar usuario desde localStorage
  useEffect(() => {
    const user = getUserById(id);

    if (!user) {
      alert("Usuario no encontrado");
      navigate("/dashboard/users");
      return;
    }

    // 🔥 separar documento
    const [tipoDoc, numeroDoc] = user.documento.split(" ");

    // 🔥 separar nombre
    const nombreCompleto = user.nombre.split(" ");
    const nombres = nombreCompleto[0] || "";
    const apellidos = nombreCompleto.slice(1).join(" ") || "";

    setForm({
      tipoDocumento: tipoDoc,
      documento: numeroDoc,
      nombres,
      apellidos,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
    });

  }, [id, navigate]);




  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      documento: `${form.tipoDocumento} ${form.documento}`,
      nombre: `${form.nombres} ${form.apellidos}`,
      email: form.email,
      telefono: form.telefono,
      rol: form.rol,
    };

    updateUser(id, updatedUser);

    alert("Usuario actualizado correctamente");
    navigate("/dashboard/users");
  };



  return (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-semibold mb-2">
            Editar <span className="text-yellow-400">usuario</span>
          </p>
          <p className="text-sm text-gray-600">
            Modifique los datos del usuario
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-10 mt-6 justify-around mx-28"
      >
        {/* TIPO DOCUMENTO */}
        <div className="flex flex-col gap-3 w-80">
          <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
            <IdCard size={16} />
            <span>Tipo de documento *</span>
          </div>
          <div className="relative">
            <select
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            >
              <option value="">Seleccione...</option>
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
            name="documento"
            value={form.documento}
            onChange={handleChange}
            required
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
            name="nombres"
            value={form.nombres}
            onChange={handleChange}
            required
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
            name="apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
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
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
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
              name="rol"
              value={form.rol}
              onChange={handleChange}
              required
              className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Seleccione...</option>
              <option value="Admin">Admin</option>
              <option value="Empleado">Empleado</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
        </div>

        {/* BOTÓN */}
        <div className="flex justify-end mt-6 w-full">
          <button
            type="submit"
            className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow transition cursor-pointer font-medium"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
