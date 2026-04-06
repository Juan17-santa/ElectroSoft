import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export function notFoundMiddleware(req, _res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function errorMiddleware(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Error de validación.",
      details: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "Ya existe un registro con uno de los valores únicos enviados.",
      details: error.keyValue ?? null,
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Ocurrió un error interno en el servidor.",
  });
}
