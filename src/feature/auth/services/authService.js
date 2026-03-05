import emailjs from "@emailjs/browser";

const USERS_KEY      = "users";
const RESET_CODE_KEY = "reset_code";
const RESET_EMAIL_KEY = "reset_email";
const AUTH_USER_KEY  = "auth_user";

// ── EmailJS config ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_owxmc0p";
const EMAILJS_TEMPLATE_ID = "template_a23pxva";
const EMAILJS_PUBLIC_KEY  = "WXWGLAjiTmbUXWdlK";

// ── Inicializar usuarios ─────────────────────────────────────────────────────
export function initUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
}

// LOGIN
export function login(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const user = users.find((u) => u.email === email);

  if (!user)         return { ok: false, message: "Usuario no encontrado" };
  if (!user.estado)  return { ok: false, message: "Usuario inactivo" };
  if (user.password !== password) return { ok: false, message: "Contraseña incorrecta" };

  // Guardar fecha y hora del último acceso
  const ultimoAcceso = new Date().toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const userConAcceso = { ...user, ultimoAcceso };

  const updatedUsers = users.map((u) =>
    u.email === email ? userConAcceso : u
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userConAcceso));

  if (!user.estado) {
    return { ok: false, message: "Usuario inactivo" };
  }

  if (user.password !== password) {
    return { ok: false, message: "Contraseña incorrecta" };
  }


  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  return { ok: true, user };
}

// ── Obtener usuario logueado ─────────────────────────────────────────────────
export function getAuthUser() {
  return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
}

// ── Cerrar sesión ────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem(AUTH_USER_KEY);
}

// ACTUALIZAR PERFIL
export function updateProfile(updatedData) {
  const authUser = getAuthUser();
  if (!authUser) return { ok: false, message: "No autenticado" };

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const updatedUsers = users.map(user =>
    user.email === authUser.email
      ? { ...user, ...updatedData }
      : user
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  // Actualizar también el usuario logueado
  const updatedAuthUser = { ...authUser, ...updatedData };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedAuthUser));

  return { ok: true, user: updatedAuthUser };
}

// ===============================
// RECUPERAR CONTRASEÑA
// ===============================

  

// ── Recuperar contraseña — envía código real por EmailJS ─────────────────────
export async function requestPasswordReset(email) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find((u) => u.email === email);

  if (!user) return { ok: false, message: "Ese correo no está registrado en el sistema." };

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  localStorage.setItem(RESET_CODE_KEY, code);
  localStorage.setItem(RESET_EMAIL_KEY, email);

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { to_email: email, code },
      EMAILJS_PUBLIC_KEY
    );
    return { ok: true };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { ok: false, message: "No se pudo enviar el correo. Intenta de nuevo." };
  }
}

// ── Verificar código ─────────────────────────────────────────────────────────
export function verifyCode(codeInput) {
  const realCode = localStorage.getItem(RESET_CODE_KEY);
  return codeInput === realCode;
}

// ── Resetear contraseña ──────────────────────────────────────────────────────
export function resetPassword(newPassword) {
  const email = localStorage.getItem(RESET_EMAIL_KEY);
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const updatedUsers = users.map((u) =>
    u.email === email ? { ...u, password: newPassword } : u
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.removeItem(RESET_CODE_KEY);
  localStorage.removeItem(RESET_EMAIL_KEY);

  return true;
}

// CAMBIAR CONTRASEÑA DESDE PERFIL
export function changePassword(currentPassword, newPassword) {
  const authUser = getAuthUser();
  if (!authUser) return { ok: false, message: "No autenticado" };

  if (authUser.password !== currentPassword) {
    return { ok: false, message: "La contraseña actual es incorrecta" };
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const updatedUsers = users.map(user =>
    user.email === authUser.email
      ? { ...user, password: newPassword }
      : user
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  // actualizar sesión
  const updatedAuthUser = { ...authUser, password: newPassword };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedAuthUser));

  return { ok: true };
}
