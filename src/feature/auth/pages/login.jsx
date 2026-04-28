import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { Validations } from "../../../utils/validations";
import Alert from "../../dashboard/components/ui/Alert";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert]       = useState(null);

  // Estado para errores inline de cada campo
  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Estado para saber si el campo fue tocado (evita mostrar errores antes de que el usuario escriba)
  const [emailTouched, setEmailTouched]       = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();


  // ─── Validación en tiempo real del EMAIL ───────────────────────────────────
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);

    if (!Validations.campoRequerido(value)) {
      setEmailError("El email es obligatorio.");
    } else if (!Validations.formatoEmail(value)) {
      setEmailError("Ingresa un email válido (ej: usuario@correo.com).");
    } else {
      setEmailError(""); // Sin error
    }
  };

  // ─── Validación en tiempo real de la CONTRASEÑA ───────────────────────────
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);

    if (!Validations.campoRequerido(value)) {
      setPasswordError("La contraseña es obligatoria.");
    } else if (value.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
    } else {
      setPasswordError(""); // Sin error
    }
  };

  // ─── Envío del formulario ──────────────────────────────────────────────────
  const handleLogin = () => {
    // Marcar ambos campos como tocados para mostrar errores si están vacíos
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validar manualmente antes de enviar
    let valid = true;

    if (!Validations.campoRequerido(email)) {
      setEmailError("El email es obligatorio.");
      valid = false;
    } else if (!Validations.formatoEmail(email)) {
      setEmailError("Ingresa un email válido (ej: usuario@correo.com).");
      valid = false;
    }

    if (!Validations.campoRequerido(password)) {
      setPasswordError("La contraseña es obligatoria.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      valid = false;
    }

    if (!valid) return;

    const result = login(email, password);

    if (!result.ok) {
      setAlert({ type: "error", message: result.message });
      return;
    }

    setAlert({
      type: "success",
      message: `Bienvenid@, ${result.user?.fullName || result.user?.nombre || "usuario"}.`,
    });
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  // ─── Helpers de estilo para inputs ────────────────────────────────────────
  const inputClass = (touched, error) =>
    `w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 transition
    ${touched && error
      ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"
      : touched && !error
      ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400"
      : "focus:ring-yellow-400"
    }`;

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
        <div className="p-8 flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro<span className="text-yellow-500">Soft</span></span>
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
                onChange={handleEmailChange}
                className={inputClass(emailTouched, emailError)}
              />
              {/* Mensaje de error inline bajo el campo */}
              {emailTouched && emailError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {emailError}
                </p>
              )}
              {/* Mensaje de validación exitosa */}
              {emailTouched && !emailError && email && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Email válido
                </p>
              )}
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
                  onChange={handlePasswordChange}
                  className={inputClass(passwordTouched, passwordError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Mensaje de error inline bajo el campo */}
              {passwordTouched && passwordError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {passwordError}
                </p>
              )}
              {/* Mensaje de validación exitosa */}
              {passwordTouched && !passwordError && password && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Contraseña válida
                </p>
              )}
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