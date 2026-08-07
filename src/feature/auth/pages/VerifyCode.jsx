import { useState, useRef } from "react";
import { Lightbulb, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { verifyCode } from "../services/authService";
import { useToast } from "../../../context/ToastContext";

export default function VerifyCode() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // ─── Lógica original intacta ───────────────────────────────────────────────

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);

    const lastIndex = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      showToast("error", "Ingresa los 6 dígitos.");
      return;
    }

    const email = localStorage.getItem("reset_email");
    const ok = await verifyCode(email, code);

    if (ok) {
      showToast("success", "Código verificado. Redirigiendo...");
      setTimeout(() => navigate("/reset-password"), 2000);
    } else {
      showToast("error", "Código incorrecto. Intenta de nuevo.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
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
                  <ShieldCheck className="w-8 h-8 text-slate-800" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Verificar código</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Ingresa el código de 6 dígitos que enviamos a tu correo.
                </p>
              </div>

              {/* Inputs del código */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-slate-50
                      focus:outline-none transition-all duration-200 caret-transparent
                      hover:border-amber-300
                      ${digit
                        ? "border-amber-400 bg-amber-50 text-slate-800 ring-2 ring-amber-200"
                        : "border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                      }`}
                  />
                ))}
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  Volver
                </button>
                <button
                  onClick={handleVerify}
                  className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-800 font-semibold rounded-xl shadow-lg shadow-amber-400/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-400/35 active:scale-[0.98]"
                >
                  Verificar
                </button>
              </div>
            </div>

        
          </div>
        </div>
      </div>
    </>
  );
}