import { Lock, Lightbulb, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    if (!pass1 || !pass2) {
      alert("Completa ambos campos");
      return;
    }

    if (pass1 !== pass2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (pass1.length < 6) {
      alert("Mínimo 6 caracteres");
      return;
    }

    resetPassword(pass1);
    alert("Contraseña cambiada con éxito");
    navigate("/");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-10">
      {/* ===== LADO IZQUIERDO - IMAGEN (70%) ===== */}
      <div
        className="hidden md:block md:col-span-6 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-y-0 right-0 w-40 bg-linear-to-l from-white via-white/70 to-transparent" />
      </div>

      {/* ===== LADO DERECHO - PANEL (30%) ===== */}
      <div className="col-span-1 md:col-span-3 flex flex-col bg-white relative">
        {/* HEADER */}
        <div className="p-8 flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro</span>
          <span className="text-yellow-500">Soft</span>
        </div>

        {/* CONTENIDO */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">
            {/* TÍTULO */}
            <h2 className="text-2xl font-semibold text-center mb-2 tracking-wide">
              Nueva contraseña
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Ingresa y confirma tu nueva contraseña.
            </p>

            {/* NUEVA CONTRASEÑA */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Lock size={16} /> Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass1 ? "text" : "password"}
                  value={pass1}
                  onChange={(e) => setPass1(e.target.value)}
                  placeholder="Ingrese nueva contraseña"
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass1(!showPass1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Lock size={16} /> Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass2 ? "text" : "password"}
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  placeholder="Confirme la contraseña"
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass2(!showPass2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/verify-code")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-xl transition"
              >
                Volver
              </button>

              <button
                onClick={handleReset}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
