import { useEffect, useState } from "react";
import { Trash, Pencil, Plus, Search, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getUsers,
  // initUsers, para cargar los datos de prueba
  toggleUserStatus,
  deleteUser,
} from "./services/usersService";

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
  // initUsers(); para cargar los datos de prueba
  setUsuarios(getUsers());
}, [location]);


  const handleToggleEstado = (id) => {
    const updated = toggleUserStatus(id);
    setUsuarios(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      const updated = deleteUser(id);
      setUsuarios(updated);
    }
  };

  const filteredUsers = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.documento || "").toLowerCase().includes(q) ||
      (u.telefono || "").toLowerCase().includes(q) ||
      (u.rol || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
      <p className="text-xl font-semibold">Gestión de Usuarios</p>

      {/* BUSCADOR Y BOTÓN */}
      <div className="flex justify-between">
        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-4/5 bg-white">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none bg-transparent"
          />
        </div>

        <div
          onClick={() => navigate("/dashboard/users/createUser")}
          className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md transition"
        >
          <Plus />
          Nuevo Usuario
        </div>
      </div>

      {/* TABLA */}
      <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr className="border-b border-gray-300 text-gray-700">
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">Nombre Completo</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Teléfono</th>
                <th className="px-4 py-3 text-center">Rol</th>
                <th className="px-4 py-3 w-28 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white text-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-300">
                    <td className="px-4 py-3 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="px-4 py-3">
                      {user.documento || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {user.nombre || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {user.email || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.telefono || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.rol || "-"}
                    </td>

                    {/* ESTADO (SOLO VISUAL) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            user.estado ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        <span className="font-medium w-8">
                          {user.estado ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-3">
                        {/* VER */}
                        <button
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}`)
                          }
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}/edit`)
                          }
                          className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition"
                        >
                          <Pencil size={18} className="text-yellow-600" />
                        </button>

                        {/* SWITCH */}
                        <div
                          onClick={() => handleToggleEstado(user.id)}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                            user.estado ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                              user.estado
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>

                        {/* ELIMINAR */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                        >
                          <Trash size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
