import { Lock, Lightbulb, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { Validations } from "../../../utils/validations";
import Alert from "../../dashboard/components/ui/alert";

// ─── Fortaleza de contraseña (lógica original intacta) ────────────────────────
const getPasswordStrength = (value) => {
  if (!value) return null;

  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;

  if (score <= 2) return { label: "Poco segura", color: "text-red-500",   bar: "w-1/3 bg-red-400",   bars: 1 };
  if (score <= 3) return { label: "Segura",      color: "text-amber-500", bar: "w-2/3 bg-amber-400", bars: 2 };
  return             { label: "Muy segura",  color: "text-green-600", bar: "w-full bg-green-500", bars: 3 };
};

export default function ResetPassword() {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [alert, setAlert] = useState(null);
  const [pass1Touched, setPass1Touched] = useState(false);
  const [pass2Touched, setPass2Touched] = useState(false);
  const [pass1Error, setPass1Error] = useState("");
  const [pass2Error, setPass2Error] = useState("");

  const navigate = useNavigate();
  const strength = getPasswordStrength(pass1);

  // ─── Lógica original intacta ───────────────────────────────────────────────

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

    if (pass2Touched) {
      if (pass2 && value !== pass2) {
        setPass2Error("Las contraseñas no coinciden.");
      } else {
        setPass2Error("");
      }
    }
  };

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

    const result = await resetPassword(pass1);

    if (result.ok) {
      setAlert({ type: "success", message: "Contraseña cambiada con éxito." });
      setTimeout(() => navigate("/"), 2000);
    } else {
      setAlert({ type: "error", message: result.message });
    }
  };

  // ─── Clase de input (estilo nuevo) ────────────────────────────────────────

  const getInputClass = (touched, error, value) => {
    const base =
      "w-full px-4 py-3.5 pr-12 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200";
    if (touched && error)
      return `${base} border-red-300 bg-red-50/50 ring-2 ring-red-200 focus:ring-red-300 focus:border-red-400`;
    if (touched && !error && value)
      return `${base} border-green-300 bg-green-50/50 ring-2 ring-green-200 focus:ring-green-300 focus:border-green-400`;
    return `${base} border-slate-200 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="min-h-screen flex bg-slate-50">

        {/* ── Panel Izquierdo – Imagen ── */}
        <div className="hidden lg:flex lg:w-[55%] relative">
          <img
            src="/login-bg.jpg"
            alt="ElectroSoft Store"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent" />

          <div className="relative z-10 flex flex-col justify-between p-10 w-full">
            {/* Logo superior */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                Electro<span className="text-amber-400">Soft</span>
              </span>
            </div>

            
          </div>
        </div>

        {/* ── Panel Derecho – Formulario ── */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-10">
          <div className="w-full max-w-md">

            {/* Logo móvil */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Lightbulb className="w-6 h-6 text-slate-800" />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                Electro<span className="text-amber-500">Soft</span>
              </span>
            </div>

            {/* Card formulario */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-400/30 mb-4">
                  <Lock className="w-8 h-8 text-slate-800" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Nueva contraseña</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Ingresa y confirma tu nueva contraseña.
                </p>
              </div>

              {/* Nueva contraseña */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass1 ? "text" : "password"}
                    value={pass1}
                    onChange={handlePass1Change}
                    placeholder="Ingrese nueva contraseña"
                    className={getInputClass(pass1Touched, pass1Error, pass1)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass1(!showPass1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {showPass1 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {pass1Touched && pass1Error && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {pass1Error}
                  </p>
                )}

                {/* Indicador de fortaleza */}
                {pass1 && !pass1Error && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength?.bar}`} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {["Poco segura", "Segura", "Muy segura"].map((label, i) => (
                        <span
                          key={label}
                          className={`text-xs font-medium transition-colors duration-200
                            ${strength?.bars > i ? strength?.color : "text-slate-300"}`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass2 ? "text" : "password"}
                    value={pass2}
                    onChange={handlePass2Change}
                    placeholder="Confirme la contraseña"
                    className={getInputClass(pass2Touched, pass2Error, pass2)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass2(!showPass2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {pass2Touched && pass2Error && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {pass2Error}
                  </p>
                )}
                {pass2Touched && !pass2Error && pass2 && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/verify-code")}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  Volver
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-800 font-semibold rounded-xl shadow-lg shadow-amber-400/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-400/35 active:scale-[0.98]"
                >
                  Confirmar
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}