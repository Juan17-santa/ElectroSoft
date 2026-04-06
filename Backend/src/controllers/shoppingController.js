import Shopping from "../models/Shopping.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listShopping = asyncHandler(async (_req, res) => {
  const shopping = await Shopping.find().sort({ id: -1 }).lean();
  res.json(shopping);
});

export const getShoppingById = asyncHandler(async (req, res) => {
  const shopping = await Shopping.findOne({ id: Number(req.params.id) }).lean();

  if (!shopping) {
    throw new AppError("Compra no encontrada.", 404);
  }

  res.json(shopping);
});

export const createShopping = asyncHandler(async (req, res) => {
  const shopping = await Shopping.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Shopping),
    fechaCreacion: req.body.fechaCreacion ?? new Date().toISOString(),
  });

  res.status(201).json(shopping.toJSON());
});

export const updateShopping = asyncHandler(async (req, res) => {
  const shopping = await Shopping.findOne({ id: Number(req.params.id) });

  if (!shopping) {
    throw new AppError("Compra no encontrada.", 404);
  }

  Object.assign(shopping, req.body);
  await shopping.save();

  res.json(shopping.toJSON());
});

export const deleteShopping = asyncHandler(async (req, res) => {
  const deletedShopping = await Shopping.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedShopping) {
    throw new AppError("Compra no encontrada.", 404);
  }

  res.json({ message: "Compra eliminada correctamente." });
});

export const replaceAllShopping = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  await Shopping.deleteMany({});

  if (items.length > 0) {
    await Shopping.insertMany(items.map((item) => ({
      ...item,
      id: item.id ?? Date.now(),
      fechaCreacion: item.fechaCreacion ?? new Date().toISOString(),
    })));
  }

  const shopping = await Shopping.find().sort({ id: -1 }).lean();
  res.json(shopping);
});
