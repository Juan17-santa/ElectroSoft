import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Lightbulb, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { Validations } from "../../../utils/validations";
import { useToast } from "../../../context/ToastContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // ─── Lógica original intacta ───────────────────────────────────────────────

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);
    if (!Validations.campoRequerido(value)) {
      setPasswordError("La contraseña es obligatoria.");
    } else if (value.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

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

    setLoading(true);
    const result = await login(email, password);

    // ← Actualizar loading y alert en el mismo ciclo (lógica original)
    if (!result.ok) {
      setLoading(false);
      showToast("error", result.message);
      return;
    }

    setLoading(false);
    showToast("success", `Bienvenid@, ${result.user?.fullName}.`);
    const firstRoute = getFirstAllowedRoute(result.user?.permissions || []);
    setTimeout(() => navigate(firstRoute), 2000);
  };
  

  // ─── Clases de input (estilo nuevo) ───────────────────────────────────────

  const getInputClass = (touched, error, value) => {
    const base =
      "w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200";
    if (touched && error)
      return `${base} border-red-300 bg-red-50/50 ring-2 ring-red-200 focus:ring-red-300 focus:border-red-400`;
    if (touched && !error && value)
      return `${base} border-green-300 bg-green-50/50 ring-2 ring-green-200 focus:ring-green-300 focus:border-green-400`;
    return `${base} border-slate-200 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400`;
  };

  const getFirstAllowedRoute = (permissions) => {
    const routeMap = [
      { permission: "dashboard:acceso", path: "/dashboard" },
      { permission: "categorias:ver", path: "/dashboard/productCategory" },
      { permission: "productos:ver", path: "/dashboard/products" },
      { permission: "proveedores:ver", path: "/dashboard/providers" },
      { permission: "compras:ver", path: "/dashboard/shopping" },
      { permission: "clientes:ver", path: "/dashboard/clients" },
      { permission: "pedidos:ver", path: "/dashboard/orders" },
      { permission: "ventas:ver", path: "/dashboard/salesManagement" },
      { permission: "pagos:ver", path: "/dashboard/payments" },
      { permission: "devoluciones:ver", path: "/dashboard/devolutions" },
      { permission: "usuarios:ver", path: "/dashboard/users" },
      { permission: "roles:acceso", path: "/dashboard/roles" },
    ];

    const found = routeMap.find(r => permissions.includes(r.permission));
    return found ? found.path : "/";
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
                  <Lock className="w-8 h-8 text-slate-800" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Ingresa tus credenciales de administrador
                </p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="admin@electrosoft.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={getInputClass(emailTouched, emailError, email)}
                />
                {emailTouched && emailError && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {emailError}
                  </p>
                )}
                {emailTouched && !emailError && email && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Email válido
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Lock className="w-4 h-4 text-amber-500" />
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`${getInputClass(passwordTouched, passwordError, password)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched && passwordError && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {passwordError}
                  </p>
                )}
                {passwordTouched && !passwordError && password && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Contraseña válida
                  </p>
                )}
              </div>

              {/* Botón */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 font-semibold rounded-xl shadow-lg shadow-amber-400/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-400/35 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>


            </div>


          </div>
        </div>
      </div>
    </>
  );
}