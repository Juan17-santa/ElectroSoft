import { useState, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { verifyCode } from "../services/authService";
import Alert from "../../dashboard/components/ui/Alert"; // Asegúrate de que esta ruta sea correcta

export default function VerifyCode() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [alert, setAlert]   = useState(null);
  const inputRefs           = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // solo números

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Si escribió un dígito, saltar al siguiente input automáticamente
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Si presiona Backspace y el campo está vacío, volver al anterior
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

    // Enfocar el último campo llenado
    const lastIndex = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleVerify = () => {
    const code = digits.join("");

    if (code.length !== 6) {
      setAlert({ type: "error", message: "Por favor ingresa los 6 dígitos del código." });
      return;
    }

    const ok = verifyCode(code);

    if (ok) {
      setAlert({ type: "success", message: "Código verificado correctamente. Redirigiendo..." });
      setTimeout(() => navigate("/reset-password"), 2000);
    } else {
      setAlert({ type: "error", message: "El código ingresado es incorrecto. Intenta de nuevo." });
      // Limpiar campos y volver al primero
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    }
  };

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
      <div className="col-span-1 md:col-span-4 flex flex-col bg-linear-to-b from-white to-yellow-300">

        <div className="p-8 flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro<span className="text-yellow-500">Soft</span></span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">

            <h2 className="text-2xl font-semibold text-center mb-2 tracking-wide">
              Verificar código
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Ingresa el código de 6 dígitos que enviamos a tu correo.
            </p>

            {/* Inputs del código */}
            <div className="flex justify-center gap-3 mb-8">
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
                  className="w-12 h-12 text-center text-xl font-semibold rounded-xl bg-gray-100
                             shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400
                             transition hover:shadow-md caret-transparent"
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/forgot-password")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-xl transition"
              >
                Volver
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Verificar
              </button>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
}