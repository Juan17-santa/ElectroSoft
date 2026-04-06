import Client from "../models/Client.js";
import Sale from "../models/Sale.js";
import Devolution from "../models/Devolution.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateNumericId } from "../utils/generateNumericId.js";
import { isAnnulledLabel } from "../utils/businessRules.js";

function enrichClients(clients = [], sales = [], devolutions = []) {
  return clients.map((client) => {
    const clientSales = sales.filter(
      (sale) =>
        String(sale.numeroDocumento) === String(client.documento) &&
        !isAnnulledLabel(sale.estado),
    );

    const totalVendido = clientSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const totalDevuelto = devolutions.reduce((sum, devolution) => {
      const relatedSale = clientSales.find((sale) => String(sale.id) === String(devolution.idVenta));

      if (!relatedSale || String(devolution.estadoResolucion || "").toLowerCase() === "anulada") {
        return sum;
      }

      const soldProduct = (relatedSale.productos || []).find(
        (product) => product.nombre === devolution.producto,
      );

      if (!soldProduct) {
        return sum;
      }

      return sum + Number(soldProduct.precio || 0) * Number(devolution.cantidad || 0);
    }, 0);

    return {
      ...client,
      totalCompras: Math.max(0, totalVendido - totalDevuelto),
    };
  });
}

async function getEnrichedClients() {
  const [clients, sales, devolutions] = await Promise.all([
    Client.find().sort({ id: -1 }).lean(),
    Sale.find().lean(),
    Devolution.find().lean(),
  ]);

  return enrichClients(clients, sales, devolutions);
}

export const listClients = asyncHandler(async (_req, res) => {
  res.json(await getEnrichedClients());
});

export const getClientById = asyncHandler(async (req, res) => {
  const clients = await getEnrichedClients();
  const client = clients.find((item) => item.id === Number(req.params.id));

  if (!client) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  res.json(client);
});

export const createClient = asyncHandler(async (req, res) => {
  if (!req.body.documento || !req.body.nombres || !req.body.apellidos) {
    throw new AppError("Documento, nombres y apellidos son obligatorios.", 400);
  }

  const existingClient = await Client.findOne({ documento: String(req.body.documento).trim() });

  if (existingClient) {
    throw new AppError("Ya existe un cliente con ese documento.", 409);
  }

  const client = await Client.create({
    ...req.body,
    id: req.body.id ?? await generateNumericId(Client),
    documento: String(req.body.documento).trim(),
    email: String(req.body.email || "").trim().toLowerCase(),
    totalCompras: Number(req.body.totalCompras || 0),
    estado: req.body.estado ?? true,
    cupoActivo: req.body.cupoActivo ?? false,
    cupoTotal: Number(req.body.cupoTotal || 0),
    fechaCreacion: req.body.fechaCreacion ?? new Date().toISOString().split("T")[0],
  });

  res.status(201).json(client.toJSON());
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ id: Number(req.params.id) });

  if (!client) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  if (req.body.documento && req.body.documento !== client.documento) {
    const existingClient = await Client.findOne({ documento: String(req.body.documento).trim() });
    if (existingClient && existingClient.id !== client.id) {
      throw new AppError("Ya existe un cliente con ese documento.", 409);
    }
  }

  Object.assign(client, {
    ...req.body,
    email: req.body.email != null ? String(req.body.email).trim().toLowerCase() : client.email,
    cupoTotal: req.body.cupoTotal != null ? Number(req.body.cupoTotal) : client.cupoTotal,
  });

  await client.save();

  res.json(client.toJSON());
});

export const deleteClient = asyncHandler(async (req, res) => {
  const deletedClient = await Client.findOneAndDelete({ id: Number(req.params.id) });

  if (!deletedClient) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  res.json({ message: "Cliente eliminado correctamente." });
});

export const toggleClientStatus = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ id: Number(req.params.id) });

  if (!client) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  client.estado = !client.estado;
  await client.save();

  res.json(client.toJSON());
});
