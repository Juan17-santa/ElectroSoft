// ─── Constantes ───────────────────────────────────────────────────────────────
export const IVA_RATE = 0.19;

// ─── Formateo de moneda ────────────────────────────────────────────────────────

/** Convierte un número a formato pesos colombianos. Ej: 15000 → "$15.000" */
export const formatCOP = (value) =>
    "$" + Number(value).toLocaleString("es-CO");

/** Convierte un string con formato COP a número. Ej: "$15.000" → 15000 */
export const parseCOP = (str) =>
    parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;

// ─── Formateo de texto ────────────────────────────────────────────────────────

/** Convierte la primera letra de cada palabra a mayúscula. Ej: "juan perez" → "Juan Perez" */
export const toTitleCase = (str) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

// ─── Validación de inputs numéricos ───────────────────────────────────────────

/** Bloquea caracteres no numéricos (e, -, +, ., etc.) en campos tipo number */
export const blockInvalidKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};
