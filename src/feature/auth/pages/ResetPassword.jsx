import { Lock, Lightbulb, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { Validations } from "../../../utils/validations";
import Alert from "../../dashboard/components/ui/alert";

// ─── Función para calcular la fortaleza de la contraseña ──────────────────────
const getPasswordStrength = (value) => {
  if (!value) return null;

  let score = 0;
  if (value.length >= 6) score++;   // longitud mínima
  if (value.length >= 10) score++;   // longitud buena
  if (/[A-Z]/.test(value)) score++;  // mayúscula
  if (/[0-9]/.test(value)) score++;  // número
  if (/[^a-zA-Z0-9]/.test(value)) score++; // símbolo

  if (score <= 2) return { label: "Poco segura", color: "text-red-500", bar: "w-1/3 bg-red-400", bars: 1 };
  if (score <= 3) return { label: "Segura", color: "text-yellow-500", bar: "w-2/3 bg-yellow-400", bars: 2 };
  return { label: "Muy segura", color: "text-green-600", bar: "w-full bg-green-500", bars: 3 };
};

export default function ResetPassword() {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [alert, setAlert] = useState(null);

  // Touched
  const [pass1Touched, setPass1Touched] = useState(false);
  const [pass2Touched, setPass2Touched] = useState(false);

  // Errores inline
  const [pass1Error, setPass1Error] = useState("");
  const [pass2Error, setPass2Error] = useState("");

  const navigate = useNavigate();

  const strength = getPasswordStrength(pass1);

  // ─── Validación en tiempo real - contraseña nueva ─────────────────────────
  const handlePass1Change = (e) => {
    const value = e.target.value;
    setPass1(value);
    setPass1Touched(true);

    if (!Validations.campoRequerido(value)) {
      setPass1Error("La contraseña es obligatoria.");
    } else if (value.length < 6) {
      setPass1Error("Mínimo 6 caracteres.");
    } else {
      setPass1Error("");
    }

    // Revalidar confirmación si ya fue tocada
    if (pass2Touched) {
      if (pass2 && value !== pass2) {
        setPass2Error("Las contraseñas no coinciden.");
      } else {
        setPass2Error("");
      }
    }
  };

  // ─── Validación en tiempo real - confirmar contraseña ─────────────────────
  const handlePass2Change = (e) => {
    const value = e.target.value;
    setPass2(value);
    setPass2Touched(true);

    if (!Validations.campoRequerido(value)) {
      setPass2Error("Debes confirmar la contraseña.");
    } else if (value !== pass1) {
      setPass2Error("Las contraseñas no coinciden.");
    } else {
      setPass2Error("");
    }
  };

  // ─── Envío ────────────────────────────────────────────────────────────────
  // ─── Envío ────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    setPass1Touched(true);
    setPass2Touched(true);

    let valid = true;

    if (!Validations.campoRequerido(pass1)) {
      setPass1Error("La contraseña es obligatoria.");
      valid = false;
    } else if (pass1.length < 6) {
      setPass1Error("Mínimo 6 caracteres.");
      valid = false;
    }

    if (!Validations.campoRequerido(pass2)) {
      setPass2Error("Debes confirmar la contraseña.");
      valid = false;
    } else if (pass1 !== pass2) {
      setPass2Error("Las contraseñas no coinciden.");
      valid = false;
    }

    if (!valid) return;

    const result = await resetPassword(pass1); // solo la nueva contraseña

    if (result.ok) {
      setAlert({ type: "success", message: "Contraseña cambiada con éxito." });
      setTimeout(() => navigate("/"), 2000);
    } else {
      setAlert({ type: "error", message: result.message });
    }
  };

  // ─── Helper clase input ───────────────────────────────────────────────────
  const inputClass = (touched, error) =>
    `w-full px-4 py-3.5 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 transition pr-10
    ${touched && error
      ? "ring-2 ring-red-400 bg-red-50 focus:ring-red-400"
      : touched && !error
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

        {/* CONTENIDO */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">

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
                  onChange={handlePass1Change}
                  placeholder="Ingrese nueva contraseña"
                  className={inputClass(pass1Touched, pass1Error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass1(!showPass1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Error */}
              {pass1Touched && pass1Error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {pass1Error}
                </p>
              )}

              {/* ── Indicador de fortaleza ── */}
              {pass1 && !pass1Error && (
                <div className="mt-2">
                  {/* Barra de progreso */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength?.bar}`} />
                  </div>
                  {/* Puntos indicadores */}
                  <div className="flex justify-between mt-1.5">
                    {["Poco segura", "Segura", "Muy segura"].map((label, i) => (
                      <span
                        key={label}
                        className={`text-xs font-medium transition-colors duration-200
                          ${strength?.bars > i ? strength?.color : "text-gray-300"}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  onChange={handlePass2Change}
                  placeholder="Confirme la contraseña"
                  className={inputClass(pass2Touched, pass2Error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass2(!showPass2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition"
                >
                  {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Error */}
              {pass2Touched && pass2Error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {pass2Error}
                </p>
              )}
              {/* Éxito */}
              {pass2Touched && !pass2Error && pass2 && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Las contraseñas coinciden
                </p>
              )}
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