import Provider from "../models/Provider.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listProviders = asyncHandler(async (_req, res) => {
  const providers = await Provider.find().sort({ id: -1 }).lean();
  res.json(providers);
});

export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ id: Number(req.params.id) }).lean();

  if (!provider) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  res.json(provider);
});

export const createProvider = asyncHandler(async (req, res) => {
  if (!req.body.documento || !req.body.nombreProveedor) {
    throw new AppError("Documento y nombre del proveedor son obligatorios.", 400);
  }

  const existingProvider = await Provider.findOne({ documento: String(req.body.documento).trim() });

  if (existingProvider) {
    throw new AppError("Ya existe un proveedor con ese documento.", 409);
  }

  const provider = await Provider.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Provider),
    documento: String(req.body.documento).trim(),
    estado: req.body.estado ?? true,
  });

  res.status(201).json(provider.toJSON());
});

export const updateProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ id: Number(req.params.id) });

  if (!provider) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  if (req.body.documento && req.body.documento !== provider.documento) {
    const existingProvider = await Provider.findOne({ documento: String(req.body.documento).trim() });
    if (existingProvider && existingProvider.id !== provider.id) {
      throw new AppError("Ya existe un proveedor con ese documento.", 409);
    }
  }

  Object.assign(provider, req.body);
  await provider.save();

  res.json(provider.toJSON());
});

export const deleteProvider = asyncHandler(async (req, res) => {
  const deletedProvider = await Provider.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedProvider) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  res.json({ message: "Proveedor eliminado correctamente." });
});

export const toggleProviderStatus = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ id: Number(req.params.id) });

  if (!provider) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  provider.estado = !provider.estado;
  await provider.save();

  res.json(provider.toJSON());
});
