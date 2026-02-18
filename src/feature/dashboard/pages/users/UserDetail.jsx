import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function UserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find((u) => u.id === Number(id));

    if (!foundUser) {
      alert("Usuario no encontrado");
      navigate("/dashboard/users");
      return;
    }

    setUser(foundUser);
  }, [id, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden">

        {/* DECORACIÓN */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top_right,#facc15,transparent_40%),radial-gradient(circle_at_bottom_left,#facc15,transparent_40%)]" />

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b relative z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Detalles del <span className="text-yellow-500">Usuario</span>
          </h2>

          <button
            onClick={() => navigate("/dashboard/users")}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex justify-center items-center py-10 px-6 relative z-10">

          <div className="bg-gray-50 rounded-2xl shadow-md border-l-4 border-yellow-400 p-6 w-full max-w-md">

            {/* NOMBRE */}
            <h3 className="text-lg font-semibold text-gray-800">
              {user.nombre}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {user.documento}
            </p>

            {/* DATOS */}
            <div className="space-y-4 text-sm">

              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Teléfono" value={user.telefono} />
              <InfoRow label="Rol" value={user.rol} />

              {/* 🔥 AQUI ESTA EL FIX */}
              <InfoRow
                label="Estado"
                value={user.estado ? "Activo" : "Inactivo"}
              />

            </div>

            {/* BOTÓN */}
            <div className="border-t mt-6 pt-4 flex justify-center">
              <button
                onClick={() => navigate("/dashboard/users")}
                className="flex items-center gap-2 px-6 py-2 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-gray-100 transition"
              >
                <X size={16} />
                Volver
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium text-gray-700">{value || "-"}</p>
    </div>
  );
}
