// ─── Constantes ───────────────────────────────────────────────────────────────
export const IVA_RATE = 0.19;

// ─── Formateo de moneda ────────────────────────────────────────────────────────

/** Convierte un número a formato pesos colombianos. Ej: 15000 → "$15.000" */
export const formatCOP = (value) =>
    "$" + Number(value).toLocaleString("es-CO");

/** Convierte un string con formato COP a número. Ej: "$15.000" → 15000 */
export const parseCOP = (str) =>
    parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
