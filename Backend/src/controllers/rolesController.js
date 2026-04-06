import Role from "../models/Role.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listRoles = asyncHandler(async (_req, res) => {
  const roles = await Role.find().sort({ id: -1 }).lean();
  res.json(roles);
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ id: Number(req.params.id) }).lean();

  if (!role) {
    throw new AppError("Rol no encontrado.", 404);
  }

  res.json(role);
});

export const createRole = asyncHandler(async (req, res) => {
  if (!req.body.nombre) {
    throw new AppError("El nombre del rol es obligatorio.", 400);
  }

  const existingRole = await Role.findOne({
    nombre: { $regex: new RegExp(`^${escapeRegExp(req.body.nombre.trim())}$`, "i") },
  });

  if (existingRole) {
    throw new AppError("Ya existe un rol con ese nombre.", 409);
  }

  const role = await Role.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Role),
    nombre: req.body.nombre.trim(),
    estado: req.body.estado ?? true,
    fechaCreacion: req.body.fechaCreacion ?? new Date().toISOString().split("T")[0],
  });

  res.status(201).json(role.toJSON());
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ id: Number(req.params.id) });

  if (!role) {
    throw new AppError("Rol no encontrado.", 404);
  }

  if (req.body.nombre) {
    const existingRole = await Role.findOne({
      nombre: { $regex: new RegExp(`^${escapeRegExp(req.body.nombre.trim())}$`, "i") },
    });

    if (existingRole && existingRole.id !== role.id) {
      throw new AppError("Ya existe un rol con ese nombre.", 409);
    }
  }

  Object.assign(role, req.body);
  await role.save();

  res.json(role.toJSON());
});

export const deleteRole = asyncHandler(async (req, res) => {
  const deletedRole = await Role.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedRole) {
    throw new AppError("Rol no encontrado.", 404);
  }

  res.json({ message: "Rol eliminado correctamente." });
});

export const toggleRoleStatus = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ id: Number(req.params.id) });

  if (!role) {
    throw new AppError("Rol no encontrado.", 404);
  }

  role.estado = !role.estado;
  await role.save();

  res.json(role.toJSON());
});
