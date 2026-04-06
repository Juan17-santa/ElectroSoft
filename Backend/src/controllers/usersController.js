import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureDefaultAdmin } from "../utils/ensureDefaultAdmin.js";
import { generateNumericId } from "../utils/generateNumericId.js";

function sanitizeUser(userDocument) {
  const user = typeof userDocument?.toJSON === "function"
    ? userDocument.toJSON()
    : { ...userDocument };

  delete user.password;
  delete user.resetCode;
  delete user.resetCodeExpiresAt;

  return user;
}

export const listUsers = asyncHandler(async (_req, res) => {
  await ensureDefaultAdmin();
  const users = await User.find().sort({ id: -1 });
  res.json(users.map(sanitizeUser));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) });

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  res.json(sanitizeUser(user));
});

export const createUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!req.body.nombre || !email) {
    throw new AppError("Nombre y correo son obligatorios.", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("El correo ya existe.", 409);
  }

  const user = await User.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(User),
    email,
    estado: req.body.estado ?? true,
    password: await bcrypt.hash(req.body.password || "123456", 10),
  });

  res.status(201).json(sanitizeUser(user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) }).select("+password");

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  if (req.body.email) {
    const normalizedEmail = String(req.body.email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.id !== user.id) {
      throw new AppError("El correo ya existe.", 409);
    }

    user.email = normalizedEmail;
  }

  const allowedFields = ["tipoDoc", "documento", "nombre", "telefono", "rol", "estado", "ultimoAcceso"];
  allowedFields.forEach((field) => {
    if (field in req.body) {
      user[field] = req.body[field];
    }
  });

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  await user.save();

  res.json(sanitizeUser(user));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedUser) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  res.json({ message: "Usuario eliminado correctamente." });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) });

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  user.estado = !user.estado;
  await user.save();

  res.json(sanitizeUser(user));
});
