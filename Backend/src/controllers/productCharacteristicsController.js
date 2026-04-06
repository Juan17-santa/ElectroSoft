import ProductCharacteristic from "../models/ProductCharacteristic.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listProductCharacteristics = asyncHandler(async (_req, res) => {
  const characteristics = await ProductCharacteristic.find().sort({ id: 1 }).lean();
  res.json(characteristics);
});

export const createProductCharacteristic = asyncHandler(async (req, res) => {
  if (!req.body.nombre) {
    throw new AppError("El nombre de la característica es obligatorio.", 400);
  }

  const normalizedName = String(req.body.nombre).trim();
  const existingCharacteristic = await ProductCharacteristic.findOne({
    nombre: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });

  if (existingCharacteristic) {
    return res.json(existingCharacteristic.toJSON());
  }

  const characteristic = await ProductCharacteristic.create({
    id: req.body.id ?? await generateNumericId(ProductCharacteristic),
    nombre: normalizedName,
  });

  res.status(201).json(characteristic.toJSON());
});

export const deleteProductCharacteristic = asyncHandler(async (req, res) => {
  const deletedCharacteristic = await ProductCharacteristic.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedCharacteristic) {
    throw new AppError("Característica no encontrada.", 404);
  }

  res.json({ message: "Característica eliminada correctamente." });
});
