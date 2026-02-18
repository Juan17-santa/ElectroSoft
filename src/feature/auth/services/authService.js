const USERS_KEY = "users";
const RESET_CODE_KEY = "reset_code";
const RESET_EMAIL_KEY = "reset_email";
const AUTH_USER_KEY = "auth_user";

// Inicializar usuarios si no existen
export function initUsers() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY));

  if (!users) {
    const defaultUsers = [
      {
        id: 1,
        documento: "C.C 123456789",
        nombre: "Administrador",
        email: "admin@gmail.com",
        telefono: "3001234567",
        rol: "Admin",
        estado: true,
        password: "123456",
      },
    ];

    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

// LOGIN (contraseña fija 123456)
export function login(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const user = users.find(
    (u) => u.email === email
  );

  if (!user) {
    return { ok: false, message: "Usuario no encontrado" };
  }

  if (!user.estado) {
    return { ok: false, message: "Usuario inactivo" };
  }

  if (password !== "123456") {
    return { ok: false, message: "Contraseña incorrecta" };
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  return { ok: true, user };
}

// Obtener usuario logueado
export function getAuthUser() {
  return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
}

// Cerrar sesión
export function logout() {
  localStorage.removeItem(AUTH_USER_KEY);
}

// ===============================
// RECUPERAR CONTRASEÑA
// ===============================

export function requestPasswordReset(email) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(u => u.email === email);

  if (!user) return false;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  localStorage.setItem(RESET_CODE_KEY, code);
  localStorage.setItem(RESET_EMAIL_KEY, email);

  console.log("Código de verificación:", code);

  return true;
}

export function verifyCode(codeInput) {
  const realCode = localStorage.getItem(RESET_CODE_KEY);
  return codeInput === realCode;
}

export function resetPassword(newPassword) {
  const email = localStorage.getItem(RESET_EMAIL_KEY);
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const updatedUsers = users.map(u =>
    u.email === email ? { ...u, password: newPassword } : u
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  localStorage.removeItem(RESET_CODE_KEY);
  localStorage.removeItem(RESET_EMAIL_KEY);

  return true;
}
