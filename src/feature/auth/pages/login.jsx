import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login, initUsers } from "../services/authService";
import Alert from "../../dashboard/components/ui/Alert"; // Asegúrate de que esta ruta sea correcta

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert]       = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    initUsers();
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      setAlert({ type: "error", message: "Por favor completa todos los campos." });
      return;
    }

    const result = login(email, password);

    if (!result.ok) {
      setAlert({ type: "error", message: result.message });
      return;
    }

    // Éxito: mostrar alerta y luego navegar
    setAlert({ type: "success", message: `Bienvenido, ${result.user?.fullName || result.user?.nombre || "usuario"}.` });
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-10">

      {/* Alert toast */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* LADO IZQUIERDO - IMAGEN */}
      <div
        className="hidden md:block md:col-span-6 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* LADO DERECHO - LOGIN */}
      <div className="col-span-1 md:col-span-4 flex flex-col bg-linear-to-b from-white to-yellow-300 relative">

        {/* HEADER */}
        <div className="p-8 flex items-center gap-3 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro</span>
          <span className="text-yellow-500">Soft</span>
        </div>

        {/* CONTENIDO */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">
            <h2 className="text-3xl font-semibold text-center mb-8 tracking-wide">
              Lo<span className="text-yellow-500">gin</span>
            </h2>

            {/* EMAIL */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                placeholder="Ingrese su email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>

            {/* CONTRASEÑA */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-1">
                <label className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                  <Lock size={16} /> Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-gray-500 hover:text-yellow-500 transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BOTÓN */}
            <button
              onClick={handleLogin}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Acceder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}