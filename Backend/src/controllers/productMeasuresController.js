import ProductMeasure from "../models/ProductMeasure.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listProductMeasures = asyncHandler(async (_req, res) => {
  const measures = await ProductMeasure.find().sort({ id: 1 }).lean();
  res.json(measures);
});

export const createProductMeasure = asyncHandler(async (req, res) => {
  if (!req.body.nombre) {
    throw new AppError("El nombre de la medida es obligatorio.", 400);
  }

  const normalizedName = String(req.body.nombre).trim();
  const existingMeasure = await ProductMeasure.findOne({
    nombre: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });

  if (existingMeasure) {
    return res.json(existingMeasure.toJSON());
  }

  const measure = await ProductMeasure.create({
    id: req.body.id ?? await generateNumericId(ProductMeasure),
    nombre: normalizedName,
  });

  res.status(201).json(measure.toJSON());
});

export const deleteProductMeasure = asyncHandler(async (req, res) => {
  const deletedMeasure = await ProductMeasure.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedMeasure) {
    throw new AppError("Medida no encontrada.", 404);
  }

  res.json({ message: "Medida eliminada correctamente." });
});
