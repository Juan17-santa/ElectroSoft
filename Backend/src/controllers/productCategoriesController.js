import ProductCategory from "../models/ProductCategory.js";
import Product from "../models/Product.js";
import Provider from "../models/Provider.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listProductCategories = asyncHandler(async (_req, res) => {
  const categories = await ProductCategory.find().sort({ id: -1 }).lean();
  res.json(categories);
});

export const getProductCategoryById = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findOne({ id: Number(req.params.id) }).lean();

  if (!category) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  res.json(category);
});

export const createProductCategory = asyncHandler(async (req, res) => {
  if (!req.body.nombre) {
    throw new AppError("El nombre de la categoría es obligatorio.", 400);
  }

  const existingCategory = await ProductCategory.findOne({
    nombre: { $regex: new RegExp(`^${escapeRegExp(req.body.nombre.trim())}$`, "i") },
  });

  if (existingCategory) {
    throw new AppError("Ya existe una categoría con ese nombre.", 409);
  }

  const category = await ProductCategory.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(ProductCategory),
    nombre: req.body.nombre.trim(),
    estado: req.body.estado ?? true,
  });

  res.status(201).json(category.toJSON());
});

export const updateProductCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findOne({ id: Number(req.params.id) });

  if (!category) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  if (req.body.nombre) {
    const existingCategory = await ProductCategory.findOne({
      nombre: { $regex: new RegExp(`^${escapeRegExp(req.body.nombre.trim())}$`, "i") },
    });

    if (existingCategory && existingCategory.id !== category.id) {
      throw new AppError("Ya existe una categoría con ese nombre.", 409);
    }
  }

  Object.assign(category, req.body);
  await category.save();

  res.json(category.toJSON());
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);

  const hasProducts = await Product.exists({ categoriaId: categoryId });
  if (hasProducts) {
    throw new AppError("RESTRICCION_PRODUCTOS", 409);
  }

  const hasProviders = await Provider.exists({ categoriasAsociadas: categoryId });
  if (hasProviders) {
    throw new AppError("RESTRICCION_PROVEEDORES", 409);
  }

  const deletedCategory = await ProductCategory.findOneAndDelete({ id: categoryId });

  if (!deletedCategory) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  res.json({ message: "Categoría eliminada correctamente." });
});

export const toggleProductCategoryStatus = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findOne({ id: Number(req.params.id) });

  if (!category) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  category.estado = !category.estado;
  await category.save();

  res.json(category.toJSON());
});
