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
 * Genera el siguiente número de factura incremental con padding de 3 dígitos.
 * Ej: si existen facturas 001 y 002, retorna "003".
 */
export const getNextNumeroFactura = () => {
    const compras = JSON.parse(localStorage.getItem("compras") || "[]");
    if (!compras.length) return "001";

    const numeros = compras
        .map((c) => parseInt(c.numeroFactura, 10))
        .filter((n) => !isNaN(n));

    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    return String(siguiente).padStart(3, "0");
};