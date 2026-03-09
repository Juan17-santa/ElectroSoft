import { useState } from "react";
import { X, Lock, AlertCircle, CheckCircle2, ShoppingBag, FileText } from "lucide-react";

const MIN_REASON_LENGTH = 20;
const ADMIN_PASSWORD = "123456";

export default function CancelShoppingModal({ compra, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!reason.trim()) {
      newErrors.reason = "El motivo es obligatorio.";
    } else if (reason.trim().length < MIN_REASON_LENGTH) {
      newErrors.reason = `Mínimo ${MIN_REASON_LENGTH} caracteres. (${reason.trim().length}/${MIN_REASON_LENGTH})`;
    }
    if (!adminPassword) {
      newErrors.password = "La clave es obligatoria.";
    } else if (adminPassword.length !== 6) {
      newErrors.password = "Debe tener exactamente 6 dígitos.";
    } else if (adminPassword !== ADMIN_PASSWORD) {
      newErrors.password = "Clave incorrecta.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateInputs()) {
      onConfirm({
        motivo: reason.trim(),
        fechaAnulacion: new Date().toISOString(),
        usuario: "Admin",
      });
    }
  };

  const isFormValid =
    reason.trim().length >= MIN_REASON_LENGTH &&
    adminPassword.length === 6 &&
    /^\d+$/.test(adminPassword) &&
    adminPassword === ADMIN_PASSWORD;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-[660px] shadow-2xl overflow-hidden">
        <div className="p-6">

          {/* TÍTULO */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-100 rounded-xl p-1.5 flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <span className="font-bold text-[15px] text-stone-900 tracking-tight">
                Anular Compra
              </span>
            </div>
            <button
              onClick={onCancel}
              className="bg-zinc-100 border-none rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors"
            >
              <X size={15} className="text-zinc-500" />
            </button>
          </div>

          {/* INFO COMPRA */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <div className="bg-amber-400 rounded-xl p-2 flex items-center justify-center flex-shrink-0 shadow-[0_2px_6px_rgba(251,191,36,0.3)]">
              <ShoppingBag size={15} className="text-white" />
            </div>
            <div className="flex gap-5 flex-1">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest m-0">Factura</p>
                <p className="text-[13.5px] font-bold text-stone-900 mt-0.5 m-0">
                  {compra?.numeroFactura ?? "F-00123"}
                </p>
              </div>
              <div className="w-px bg-stone-200 self-stretch" />
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest m-0">Proveedor</p>
                <p className="text-[13.5px] font-bold text-stone-900 mt-0.5 m-0">
                  {compra?.proveedor ?? "Proveedor Ejemplo"}
                </p>
              </div>
            </div>
          </div>

          {/* CAMPOS HORIZONTALES */}
          <div className="grid mb-5" style={{ gridTemplateColumns: "1fr 1px 1fr" }}>

            {/* MOTIVO */}
            <div className="pr-5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-[0.08em] mb-2">
                <FileText size={10} /> Motivo de Anulación
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors({ ...errors, reason: "" });
                }}
                placeholder="Describe el motivo de la anulación..."
                rows={4}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[13px] text-stone-900 bg-stone-50 resize-none outline-none transition-all focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)] font-[inherit] ${
                  errors.reason
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-none"
                    : "border-stone-200"
                }`}
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.reason ? (
                  <span className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.reason}
                  </span>
                ) : reason.trim().length >= MIN_REASON_LENGTH ? (
                  <span className="text-[10px] text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Válido
                  </span>
                ) : (
                  <span />
                )}
                <span className={`text-[10px] font-semibold ${
                  reason.trim().length >= MIN_REASON_LENGTH ? "text-green-600" : "text-amber-200"
                }`}>
                  {reason.trim().length}/{MIN_REASON_LENGTH}
                </span>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="bg-stone-100 mx-1" />

            {/* CLAVE */}
            <div className="pl-5 flex flex-col justify-center">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-[0.08em] mb-2">
                <Lock size={10} /> Clave del Administrador
              </label>

              {/* PIN DOTS */}
              <div className="flex justify-center gap-2 mb-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-200"
                    style={{
                      background:
                        i < adminPassword.length
                          ? errors.password
                            ? "#ef4444"
                            : "#fbbf24"
                          : "#e7e5e4",
                      border: `1.5px solid ${
                        i < adminPassword.length
                          ? errors.password
                            ? "#dc2626"
                            : "#f59e0b"
                          : "#d4c5a0"
                      }`,
                      boxShadow:
                        i < adminPassword.length && !errors.password
                          ? "0 0 5px rgba(251,191,36,0.35)"
                          : "none",
                    }}
                  />
                ))}
              </div>

              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setAdminPassword(value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="• • • • • •"
                maxLength="6"
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[17px] font-bold text-stone-900 text-center tracking-[0.45em] outline-none transition-all focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)] ${
                  errors.password
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-none"
                    : "border-stone-200 bg-stone-50"
                }`}
              />

              <div className="mt-1.5 min-h-[16px]">
                {errors.password ? (
                  <span className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.password}
                  </span>
                ) : adminPassword.length === 6 && adminPassword === ADMIN_PASSWORD ? (
                  <span className="text-[10px] text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Clave válida
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-[1.5px] border-stone-200 bg-white text-[13px] font-semibold text-stone-500 cursor-pointer transition-all hover:bg-stone-50 hover:border-stone-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid}
              className={`flex-1 py-3 rounded-xl border-none text-[13px] font-bold transition-all ${
                isFormValid
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.42)]"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
            >
              Anular Compra
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}