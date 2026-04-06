import Devolution from "../models/Devolution.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeDevolutionPayload, todayIsoDate } from "../utils/businessRules.js";
import { generateNumericId } from "../utils/generateNumericId.js";

export const listDevolutions = asyncHandler(async (_req, res) => {
  const devolutions = await Devolution.find().sort({ id: -1 }).lean();
  res.json(devolutions);
});

export const getDevolutionById = asyncHandler(async (req, res) => {
  const devolution = await Devolution.findOne({ id: Number(req.params.id) }).lean();

  if (!devolution) {
    throw new AppError("Devolución no encontrada.", 404);
  }

  res.json(devolution);
});

export const createDevolution = asyncHandler(async (req, res) => {
  const now = new Date().toISOString();
  const payload = normalizeDevolutionPayload(req.body);
  const initialState = payload.estadoResolucion ?? "CREADA";

  const devolution = await Devolution.create({
    ...payload,
    id: payload.id ?? await generateNumericId(Devolution),
    fechaDevolucion: payload.fechaDevolucion || todayIsoDate(),
    fechaEstado: todayIsoDate(),
    estadoResolucion: initialState,
    creadoEn: payload.creadoEn ?? now,
    actualizadoEn: now,
    historialEstados: payload.historialEstados?.length
      ? payload.historialEstados
      : [{ estado: initialState, fecha: now }],
  });

  res.status(201).json(devolution.toJSON());
});

export const updateDevolution = asyncHandler(async (req, res) => {
  const devolution = await Devolution.findOne({ id: Number(req.params.id) });

  if (!devolution) {
    throw new AppError("Devolución no encontrada.", 404);
  }

  const now = new Date().toISOString();
  const payload = normalizeDevolutionPayload(req.body);
  const historialEstados = Array.isArray(devolution.historialEstados) && devolution.historialEstados.length > 0
    ? [...devolution.historialEstados]
    : [{ estado: devolution.estadoResolucion, fecha: devolution.creadoEn ?? now }];

  if (
    payload.estadoResolucion &&
    payload.estadoResolucion !== devolution.estadoResolucion
  ) {
    historialEstados.push({ estado: payload.estadoResolucion, fecha: now });
  }

  Object.assign(devolution, payload, {
    historialEstados,
    fechaEstado: todayIsoDate(),
    actualizadoEn: now,
  });

  await devolution.save();

  res.json(devolution.toJSON());
});

export const deleteDevolution = asyncHandler(async (req, res) => {
  const deletedDevolution = await Devolution.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedDevolution) {
    throw new AppError("Devolución no encontrada.", 404);
  }

  res.json({ message: "Devolución eliminada correctamente." });
});

export const annulDevolution = asyncHandler(async (req, res) => {
  const devolution = await Devolution.findOne({ id: Number(req.params.id) });

  if (!devolution) {
    throw new AppError("Devolución no encontrada.", 404);
  }

  const now = new Date().toISOString();
  devolution.estadoResolucion = "Anulada";
  devolution.historialEstados = [
    ...(devolution.historialEstados || []),
    { estado: "Anulada", fecha: now },
  ];
  devolution.actualizadoEn = now;
  devolution.fechaEstado = todayIsoDate();

  await devolution.save();

  res.json(devolution.toJSON());
});

export const annulDevolutionsBySale = asyncHandler(async (req, res) => {
  const saleId = Number(req.params.saleId);
  const now = new Date().toISOString();
  const devolutions = await Devolution.find({ idVenta: saleId });

  for (const devolution of devolutions) {
    devolution.estadoResolucion = "Anulada";
    devolution.historialEstados = [
      ...(devolution.historialEstados || []),
      { estado: "Anulada", fecha: now },
    ];
    devolution.actualizadoEn = now;
    devolution.fechaEstado = todayIsoDate();
    await devolution.save();
  }

  res.json(devolutions.map((devolution) => devolution.toJSON()));
});
