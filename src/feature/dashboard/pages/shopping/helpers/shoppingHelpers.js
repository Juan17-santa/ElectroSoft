// ─── Constantes ───────────────────────────────────────────────────────────────
export const IVA_RATE = 0.19;

// ─── Formateo de moneda ────────────────────────────────────────────────────────

/** Convierte un número a formato pesos colombianos. Ej: 15000 → "$15.000" */
export const formatCOP = (value) =>
    "$" + Number(value).toLocaleString("es-CO");

/** Convierte un string con formato COP a número. Ej: "$15.000" → 15000 */
export const parseCOP = (str) =>
    parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;

// ─── Factura ───────────────────────────────────────────────────────────────────

/**
 * Verifica si un número de factura ya existe en las compras ACTIVAS.
 * Las compras anuladas no bloquean la reutilización del número,
 * ya que la restricción de unicidad aplica solo sobre registros vigentes.
 *
 * @param {string} numeroFactura - El número de factura a validar
 * @returns {boolean} - true si ya existe en una compra activa, false si está libre
 */
export const numeroFacturaYaExiste = (numeroFactura) => {
    const compras = JSON.parse(localStorage.getItem("compras") || "[]");
    return compras
        .filter((c) => c.estado !== "Anulada")
        .some((c) => String(c.numeroFactura) === String(numeroFactura));
};