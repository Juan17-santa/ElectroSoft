import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Client from "../models/Client.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateProductsTotals, isCreditLabel } from "../utils/businessRules.js";
import { generateNumericId } from "../utils/generateNumericId.js";

async function updateOrderProductStocks(products = [], multiplier = -1) {
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

async function createSaleFromOrder(order, diasPlazo) {
  const client = await Client.findOne({ documento: String(order.documento || "") }).lean();
  const sales = await Sale.find().select("numeroVenta").lean();
  const { subtotal, iva, total } = calculateProductsTotals(order.productos || []);
  const saleNumber = sales.length > 0
    ? Math.max(...sales.map((sale) => Number(sale.numeroVenta || 0))) + 1
    : 1;

  const salePayload = {
    id: await generateNumericId(Sale),
    numeroVenta: saleNumber,
    numeroDocumento: String(order.documento || ""),
    cliente: client ? `${client.nombres} ${client.apellidos}` : "",
    tipoVenta: order.formaPago || "Contado",
    diasPlazo: isCreditLabel(order.formaPago) ? Number(diasPlazo || 0) || null : null,
    fecha: new Date().toISOString().split("T")[0],
    estado: isCreditLabel(order.formaPago) ? "Vigente" : "Finalizado",
    productos: (order.productos || []).map((item) => ({
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      idProducto: item.idProducto ?? item.id,
    })),
    subtotal,
    iva,
    total,
    montoPagado: isCreditLabel(order.formaPago) ? 0 : total,
    montoPorPagar: isCreditLabel(order.formaPago) ? total : 0,
    abonos: [],
  };

  await Sale.create(salePayload);
  await updateOrderProductStocks(order.productos || [], -1);

  return salePayload;
}

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ id: -1 }).lean();
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: Number(req.params.id) }).lean();

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  res.json(order);
});

export const createOrder = asyncHandler(async (req, res) => {
  const { subtotal, iva, total } = calculateProductsTotals(req.body.productos || []);

  const order = await Order.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Order),
    subtotal,
    iva,
    total,
    estado: req.body.estado ?? "Pendiente",
    fechaCreacion: req.body.fechaCreacion ?? new Date().toISOString(),
    montoPagado: Number(req.body.montoPagado || 0),
    montoPorPagar: Number(req.body.montoPorPagar ?? total),
    abonos: Array.isArray(req.body.abonos) ? req.body.abonos : [],
  });

  await updateOrderProductStocks(req.body.productos || [], -1);

  res.status(201).json(order.toJSON());
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: Number(req.params.id) });

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  Object.assign(order, req.body);
  await order.save();

  res.json(order.toJSON());
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await Order.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedOrder) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  res.json({ message: "Pedido eliminado correctamente." });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: Number(req.params.id) });

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  await updateOrderProductStocks(order.productos || [], 1);

  order.estado = "Anulado";
  order.cancelInfo = {
    motivo: req.body.motivo || "",
    fechaAnulacion: req.body.fechaAnulacion || new Date().toISOString(),
  };

  await order.save();

  res.json(order.toJSON());
});

export const processOrderToSale = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: Number(req.params.id) });

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  await updateOrderProductStocks(order.productos || [], 1);
  const sale = await createSaleFromOrder(order, req.body.diasPlazo);
  await Order.deleteOne({ id: order.id });

  res.json({
    message: "Pedido procesado a venta correctamente.",
    sale,
  });
});
