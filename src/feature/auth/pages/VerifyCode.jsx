import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { verifyCode } from "../services/authService";

export default function VerifyCode() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // solo números

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
  };

  const handleVerify = () => {
    const code = digits.join("");

    if (code.length !== 6) {
      alert("Ingresa los 6 dígitos");
      return;
    }

    const ok = verifyCode(code);

    if (ok) {
      navigate("/reset-password");
    } else {
      alert("Código incorrecto");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-10">
      {/* ===== LADO IZQUIERDO - IMAGEN (70%) ===== */}
      <div
        className="hidden md:block md:col-span-6 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* ===== LADO DERECHO - PANEL (30%) ===== */}
      <div className="col-span-1 md:col-span-4 flex flex-col bg-linear-to-b from-white to-yellow-300 relative">
        {/* HEADER */}
        <div className="p-8 flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="text-yellow-500" />
          <span>Electro<span className="text-yellow-500">Soft</span></span>
        </div>

        {/* CONTENIDO */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur-md">
            {/* TÍTULO */}
            <h2 className="text-2xl font-semibold text-center mb-2 tracking-wide">
              Verificar código
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Ingresa el código de 6 dígitos que enviamos a tu correo.
            </p>

            {/* INPUTS DEL CÓDIGO */}
            <div className="flex justify-center gap-3 mb-8">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition hover:shadow-md"
                />
              ))}
            </div>

            {/* BOTONES */}
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
