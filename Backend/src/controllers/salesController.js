import Client from "../models/Client.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  calculateActivePayments,
  calculateProductsTotals,
  isAnnulledLabel,
  isCreditLabel,
} from "../utils/businessRules.js";
import { generateNumericId } from "../utils/generateNumericId.js";

async function updateProductStocks(products = [], multiplier = -1) {
  for (const item of products) {
    const productId = Number(item.idProducto ?? item.productId ?? item.id);
    let product = Number.isFinite(productId)
      ? await Product.findOne({ id: productId })
      : null;

    if (!product && item.nombre) {
      product = await Product.findOne({ nombre: item.nombre });
    }

    if (!product) {
      continue;
    }

    product.stock = Number(product.stock || 0) + multiplier * Number(item.cantidad || 0);
    await product.save();
  }
}

async function buildSalePayload(payload = {}) {
  const sales = await Sale.find().select("numeroVenta").lean();
  const client = payload.numeroDocumento
    ? await Client.findOne({ documento: String(payload.numeroDocumento) }).lean()
    : null;

  const { subtotal, iva, total } = calculateProductsTotals(payload.productos || []);
  const isCashSale = !isCreditLabel(payload.tipoVenta);
  const numeroVenta = sales.length > 0
    ? Math.max(...sales.map((sale) => Number(sale.numeroVenta || 0))) + 1
    : 1;

  return {
    id: payload.id ?? await generateNumericId(Sale),
    numeroVenta,
    numeroDocumento: String(payload.numeroDocumento || ""),
    cliente: client ? `${client.nombres} ${client.apellidos}` : String(payload.cliente || ""),
    tipoVenta: payload.tipoVenta || "Contado",
    diasPlazo: isCreditLabel(payload.tipoVenta) ? Number(payload.diasPlazo || 0) || null : null,
    fecha: payload.fecha || new Date().toISOString().split("T")[0],
    estado: isCashSale ? "Finalizado" : payload.estado || "Vigente",
    productos: payload.productos || [],
    subtotal,
    iva,
    total,
    montoPagado: isCashSale ? total : Number(payload.montoPagado || 0),
    montoPorPagar: isCashSale ? 0 : Number(payload.montoPorPagar ?? total),
    abonos: Array.isArray(payload.abonos) ? payload.abonos : [],
  };
}

export const listSales = asyncHandler(async (_req, res) => {
  const sales = await Sale.find().sort({ id: -1 }).lean();
  res.json(sales);
});

export const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) }).lean();

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  res.json(sale);
});

export const createSale = asyncHandler(async (req, res) => {
  const salePayload = await buildSalePayload(req.body);
  const sale = await Sale.create(salePayload);

  await updateProductStocks(salePayload.productos, -1);

  res.status(201).json(sale.toJSON());
});

export const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  Object.assign(sale, req.body);
  await sale.save();

  res.json(sale.toJSON());
});

export const deleteSale = asyncHandler(async (req, res) => {
  const deletedSale = await Sale.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedSale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  res.json({ message: "Venta eliminada correctamente." });
});

export const addSalePayment = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  const monto = Number(req.body.monto || req.body.amount || 0);

  if (monto <= 0) {
    throw new AppError("El monto del abono debe ser mayor a 0.", 400);
  }

  const now = new Date();
  const formattedDate = `${now.toISOString().split("T")[0]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  sale.abonos = [
    ...(sale.abonos || []),
    {
      id: Date.now(),
      fecha: formattedDate,
      monto,
      metodoPago: req.body.metodoPago || req.body.paymentMethod || "",
      anulado: false,
    },
  ];

  const totalPaid = calculateActivePayments(sale.abonos);
  const pendingAmount = Number(sale.total || 0) - totalPaid;

  sale.montoPagado = totalPaid;
  sale.montoPorPagar = pendingAmount > 0 ? pendingAmount : 0;
  sale.estado = pendingAmount <= 0 ? "Finalizado" : "Vigente";

  await sale.save();

  res.json(sale.toJSON());
});

export const voidSalePayment = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  const paymentId = req.params.paymentId;

  sale.abonos = (sale.abonos || []).map((payment, index) => {
    if (String(payment.id) === String(paymentId) || String(index) === String(paymentId)) {
      return { ...payment, anulado: true };
    }
    return payment;
  });

  const totalPaid = calculateActivePayments(sale.abonos);
  const pendingAmount = Number(sale.total || 0) - totalPaid;

  sale.montoPagado = totalPaid;
  sale.montoPorPagar = pendingAmount > 0 ? pendingAmount : 0;
  sale.estado = pendingAmount <= 0 ? "Finalizado" : "Vigente";

  await sale.save();

  res.json(sale.toJSON());
});

export const toggleSaleStatus = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  sale.estado = sale.estado === "Vigente" ? "Finalizado" : "Vigente";
  await sale.save();

  res.json(sale.toJSON());
});

export const annulSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  const wasAlreadyAnnulled = isAnnulledLabel(sale.estado);
  sale.estado = "Anulado";
  await sale.save();

  if (!wasAlreadyAnnulled) {
    await updateProductStocks(sale.productos || [], 1);
  }

  res.json(sale.toJSON());
});

export const returnSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ id: Number(req.params.id) });

  if (!sale) {
    throw new AppError("Venta no encontrada.", 404);
  }

  sale.estado = req.body.esParcial ? "Devolución Parcial" : "Devuelto";
  await sale.save();

  res.json(sale.toJSON());
});
