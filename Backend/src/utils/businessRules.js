export function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

export function formatLastAccess(date = new Date()) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function isCreditLabel(value = "") {
  return ["credito", "crédito"].includes(String(value).trim().toLowerCase());
}

export function isAnnulledLabel(value = "") {
  return ["anulado", "anulada"].includes(String(value).trim().toLowerCase());
}

export function calculateProductsTotals(products = []) {
  const subtotal = products.reduce(
    (sum, item) => sum + Number(item?.precio || 0) * Number(item?.cantidad || 0),
    0,
  );
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  return { subtotal, iva, total };
}

export function calculateActivePayments(abonos = []) {
  return abonos
    .filter((abono) => !abono?.anulado)
    .reduce((sum, abono) => sum + Number(abono?.monto || 0), 0);
}

export function normalizeDevolutionPayload(devolution = {}) {
  const { fecha, fechaISO, ...rest } = devolution;
  const fechaDevolucion = rest.fechaDevolucion ?? fechaISO ?? rest.fechaEstado ?? "";

  return {
    ...rest,
    cantidad: Number(rest.cantidad || 0),
    fechaDevolucion,
    fechaEstado: rest.fechaEstado ?? fechaDevolucion,
  };
}
