import { useState } from "react";
import { Mail, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import { Validations } from "../../../utils/validations";
import Alert from "../../dashboard/components/ui/alert";

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [email, setEmail]           = useState("");
  const [alert, setAlert]           = useState(null);
  const [loading, setLoading]       = useState(false);

  // Estado de validación en tiempo real
  const [emailError, setEmailError]   = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  // ─── Validación en tiempo real ────────────────────────────────────────────
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);

    if (!Validations.campoRequerido(value)) {
      setEmailError("El email es obligatorio.");
    } else if (!Validations.formatoEmail(value)) {
      setEmailError("Ingresa un email válido (ej: usuario@correo.com).");
    } else {
      setEmailError("");
    }
  };

  // ─── Envío ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setEmailTouched(true);

    if (!Validations.campoRequerido(email)) {
      setEmailError("El email es obligatorio.");
      return;
    }
    if (!Validations.formatoEmail(email)) {
      setEmailError("Ingresa un email válido (ej: usuario@correo.com).");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.ok) {
      setAlert({ type: "success", message: `Código enviado a ${email}. Revisa tu bandeja de entrada.` });
      setTimeout(() => navigate("/verify-code"), 2500);
    } else {
      setAlert({ type: "error", message: result.message });
    }
  };

  // ─── Helper de estilo del input ───────────────────────────────────────────
  const inputClass =
    `w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 transition
    ${emailTouched && emailError
      ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"
      : emailTouched && !emailError && email
      ? "ring-2 ring-green-400 bg-green-50 focus:ring-green-400"
      : "focus:ring-yellow-400"
    }`;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-10">

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* LADO IZQUIERDO */}
      <div
        className="hidden md:block md:col-span-6 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* LADO DERECHO */}
      <div className="col-span-1 md:col-span-4 flex flex-col bg-linear-to-b from-white to-yellow-300 relative">

        {/* HEADER */}
        <div className="p-8 flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro<span className="text-yellow-500">Soft</span></span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">

            <h2 className="text-2xl font-semibold text-center mb-2 tracking-wide">
              Cambiar contraseña
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Ingresa tu correo y te enviaremos un código de verificación.
            </p>

            {/* EMAIL */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-medium text-yellow-600 mb-1">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                placeholder="Ingrese el email registrado"
                value={email}
                onChange={handleEmailChange}
                className={inputClass}
              />
              {/* Error inline */}
              {emailTouched && emailError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {emailError}
                </p>
              )}
              {/* Éxito inline */}
              {emailTouched && !emailError && email && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Email válido
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-xl transition"
              >
                Volver
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-black font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}