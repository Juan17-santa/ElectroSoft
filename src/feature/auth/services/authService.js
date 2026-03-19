import emailjs from "@emailjs/browser";

const USERS_KEY       = "users";
const RESET_CODE_KEY  = "reset_code";
const RESET_EMAIL_KEY = "reset_email";
const AUTH_USER_KEY   = "auth_user"; // ahora solo guarda { id }

const EMAILJS_SERVICE_ID  = "service_owxmc0p";
const EMAILJS_TEMPLATE_ID = "template_a23pxva";
const EMAILJS_PUBLIC_KEY  = "WXWGLAjiTmbUXWdlK";

export function login(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user  = users.find((u) => u.email === email);

    if (!user)                      return { ok: false, message: "Usuario no encontrado" };
    if (!user.estado)               return { ok: false, message: "Usuario inactivo" };
    if (user.password !== password) return { ok: false, message: "Contraseña incorrecta" };

    const ultimoAcceso = new Date().toLocaleString("es-CO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, ultimoAcceso } : u
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: user.id })); // ✅ solo el id

    return { ok: true, user: { ...user, ultimoAcceso } };
}

// ✅ Siempre lee de users, nunca datos desactualizados
export function getAuthUser() {
    const auth  = JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    if (!auth) return null;
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    return users.find((u) => u.id === auth.id) || null;
}

export function logout() {
    localStorage.removeItem(AUTH_USER_KEY);
}

export function updateProfile(updatedData) {
    const authUser = getAuthUser();
    if (!authUser) return { ok: false, message: "No autenticado" };

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const updatedUsers = users.map((u) =>
        u.id === authUser.id ? { ...u, ...updatedData } : u
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    window.dispatchEvent(new Event("profile-updated")); // ✅ notifica componentes

    return { ok: true, user: { ...authUser, ...updatedData } };
}

export function changePassword(currentPassword, newPassword) {
    const authUser = getAuthUser();
    if (!authUser) return { ok: false, message: "No autenticado" };

    if (authUser.password !== currentPassword)
        return { ok: false, message: "La contraseña actual es incorrecta" };

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const updatedUsers = users.map((u) =>
        u.id === authUser.id ? { ...u, password: newPassword } : u
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    return { ok: true };
}

export async function requestPasswordReset(email) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user  = users.find((u) => u.email === email);

    if (!user) return { ok: false, message: "Ese correo no está registrado en el sistema." };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(RESET_CODE_KEY, code);
    localStorage.setItem(RESET_EMAIL_KEY, email);

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email, code }, EMAILJS_PUBLIC_KEY);
        return { ok: true };
    } catch (error) {
        return { ok: false, message: "No se pudo enviar el correo. Intenta de nuevo." };
    }
}

export function verifyCode(codeInput) {
    return codeInput === localStorage.getItem(RESET_CODE_KEY);
}

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