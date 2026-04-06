import Product from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ id: -1 }).lean();
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) }).lean();

  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Product),
    precio: Number(req.body.precio || 0),
    stock: Number(req.body.stock || 0),
    costoPromedio: Number(req.body.costoPromedio || 0),
    estado: req.body.estado ?? true,
    createdAt: req.body.createdAt ?? new Date().toISOString(),
  });

  res.status(201).json(product.toJSON());
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) });

  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }

  Object.assign(product, {
    ...req.body,
    precio: req.body.precio != null ? Number(req.body.precio) : product.precio,
    stock: req.body.stock != null ? Number(req.body.stock) : product.stock,
    costoPromedio: req.body.costoPromedio != null ? Number(req.body.costoPromedio) : product.costoPromedio,
  });

  await product.save();

  res.json(product.toJSON());
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedProduct) {
    throw new AppError("Producto no encontrado.", 404);
  }

  res.json({ message: "Producto eliminado correctamente." });
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) });

  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }

  product.estado = !product.estado;
  await product.save();

  res.json(product.toJSON());
});
