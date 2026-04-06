import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureDefaultAdmin } from "../utils/ensureDefaultAdmin.js";
import { formatLastAccess } from "../utils/businessRules.js";
import { generateNumericId } from "../utils/generateNumericId.js";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

function sanitizeUser(userDocument) {
  if (!userDocument) {
    return null;
  }

  const user = typeof userDocument.toJSON === "function"
    ? userDocument.toJSON()
    : { ...userDocument };

  delete user.password;
  delete user.resetCode;
  delete user.resetCodeExpiresAt;

  return user;
}

export const register = asyncHandler(async (req, res) => {
  await ensureDefaultAdmin();

  const {
    tipoDoc = "",
    documento = "",
    nombre,
    email,
    telefono = "",
    rol = "Administrador",
    estado = true,
    password,
  } = req.body;

  if (!nombre || !email || !password) {
    throw new AppError("Nombre, correo y contraseña son obligatorios.", 400);
  }

  const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });

  if (existingUser) {
    throw new AppError("El correo ya está registrado.", 409);
  }

  const user = await User.create({
    id: req.body.id ?? await generateNumericId(User),
    tipoDoc,
    documento,
    nombre: String(nombre).trim(),
    email: String(email).trim().toLowerCase(),
    telefono,
    rol,
    estado,
    password: await bcrypt.hash(password, 10),
  });

  const safeUser = sanitizeUser(user);

  res.status(201).json({
    message: "Usuario registrado correctamente.",
    token: signToken(safeUser),
    user: safeUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  await ensureDefaultAdmin();

  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Correo y contraseña son obligatorios.", 400);
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("Correo o contraseña incorrecto.", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new AppError("Correo o contraseña incorrecto.", 401);
  }

  if (!user.estado) {
    throw new AppError("Usuario inactivo.", 403);
  }

  user.ultimoAcceso = formatLastAccess();
  await user.save();

  const safeUser = sanitizeUser(user);

  res.json({
    message: "Inicio de sesión exitoso.",
    token: signToken(safeUser),
    user: safeUser,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const currentUser = await User.findOne({ id: req.user.id });

  if (!currentUser) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  if (req.body.email && req.body.email !== currentUser.email) {
    const existingUser = await User.findOne({ email: String(req.body.email).trim().toLowerCase() });
    if (existingUser && existingUser.id !== currentUser.id) {
      throw new AppError("El correo ya está registrado por otro usuario.", 409);
    }
  }

  const allowedFields = ["tipoDoc", "documento", "nombre", "email", "telefono", "rol"];
  allowedFields.forEach((field) => {
    if (field in req.body) {
      currentUser[field] = field === "email"
        ? String(req.body[field]).trim().toLowerCase()
        : req.body[field];
    }
  });

  await currentUser.save();

  res.json({
    message: "Perfil actualizado correctamente.",
    user: sanitizeUser(currentUser),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Debes enviar la contraseña actual y la nueva contraseña.", 400);
  }

  const currentUser = await User.findOne({ id: req.user.id }).select("+password");

  if (!currentUser) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const validPassword = await bcrypt.compare(currentPassword, currentUser.password);

  if (!validPassword) {
    throw new AppError("La contraseña actual es incorrecta.", 400);
  }

  currentUser.password = await bcrypt.hash(newPassword, 10);
  await currentUser.save();

  res.json({ message: "Contraseña actualizada correctamente." });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Debes enviar el correo del usuario.", 400);
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+resetCode +resetCodeExpiresAt");

  if (!user) {
    throw new AppError("Ese correo no está registrado en el sistema.", 404);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetCode = code;
  user.resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  res.json({
    message: "Código de recuperación generado correctamente.",
    email: user.email,
    code,
  });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new AppError("Correo y código son obligatorios.", 400);
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+resetCode +resetCodeExpiresAt");

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const isValid = user.resetCode === String(code) && user.resetCodeExpiresAt && user.resetCodeExpiresAt > new Date();

  if (!isValid) {
    throw new AppError("El código no es válido o ya expiró.", 400);
  }

  res.json({ ok: true, message: "Código verificado correctamente." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    throw new AppError("Correo, código y nueva contraseña son obligatorios.", 400);
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password +resetCode +resetCodeExpiresAt");

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const isValid = user.resetCode === String(code) && user.resetCodeExpiresAt && user.resetCodeExpiresAt > new Date();

  if (!isValid) {
    throw new AppError("El código no es válido o ya expiró.", 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = null;
  user.resetCodeExpiresAt = null;
  await user.save();

  res.json({ ok: true, message: "Contraseña restablecida correctamente." });
});
