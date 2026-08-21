import api from "../../../utils/api.js";
import { authStorage } from "../../../utils/authStorage.js";

// ── LOGIN ──────────────────────────────────────────────────────────────────
export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data.data;

    // Guarda el token y los datos del usuario
    authStorage.saveSession(token, user);

    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Error al iniciar sesión",
    };
  }
}

// ── OBTENER USUARIO AUTENTICADO ────────────────────────────────────────────
export function getAuthUser() {
  return authStorage.getUser();
}

// ── LOGOUT ─────────────────────────────────────────────────────────────────
export function logout() {
  authStorage.clear();
}

// ── ENVIAR CÓDIGO DE VERIFICACIÓN ──────────────────────────────────────────
export async function requestPasswordReset(email) {
  try {
    const response = await api.post("/auth/send-code", { email });
    const { code } = response.data.data;

    // El backend devuelve el código para que el frontend lo envíe al correo
    return { ok: true, code };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "No se pudo enviar el código",
    };
  }
}

// ── VERIFICAR CÓDIGO ───────────────────────────────────────────────────────
export async function verifyCode(email, code) {
  try {
    const response = await api.post("/auth/verify-code", { email, code });
    const { resetToken } = response.data.data;
    // Guarda el token temporal para usarlo en ResetPassword
    localStorage.setItem("reset_token", resetToken);
    return true;
  } catch {
    return false;
  }
}

// ── RECUPERAR CONTRASEÑA ───────────────────────────────────────────────────
export async function resetPassword(newPassword) {
  try {
    const resetToken = localStorage.getItem("reset_token");
    await api.post("/auth/reset-password", { resetToken, newPassword });
    // Limpiar datos temporales
    localStorage.removeItem("reset_email");
    localStorage.removeItem("reset_token");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "No se pudo cambiar la contraseña",
    };
  }
}

// ── CAMBIAR CONTRASEÑA (usuario autenticado) ───────────────────────────────
export async function changePassword(currentPassword, newPassword) {
  try {
    await api.post("/auth/change-password", { currentPassword, newPassword });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "No se pudo cambiar la contraseña",
    };
  }
}

// ── ACTUALIZAR PERFIL ──────────────────────────────────────────────────────
export async function updateProfile(updatedData) {
  try {
    const user = authStorage.getUser();
    if (!user) return { ok: false, message: "No autenticado" };

    const response = await api.put(`/users/${user.id}`, {
      fullName: updatedData.fullName,
      email: updatedData.email,
      phone: updatedData.phone,
      documentType: updatedData.documentType,
      documentNumber: updatedData.documentNumber,
      avatar: updatedData.avatar || "",
    });
    const updatedUser = response.data.data;

    authStorage.saveSession(authStorage.getToken(), {
      ...user,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      documentType: updatedUser.documentType,
      documentNumber: updatedUser.documentNumber,
      avatar: updatedUser.avatar || "",
    });

    window.dispatchEvent(new Event("profile-updated"));
    return { ok: true, user: updatedUser };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "No se pudo actualizar el perfil",
    };
  }
}