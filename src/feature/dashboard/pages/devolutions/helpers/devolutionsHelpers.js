// ─── Opciones de selects ───────────────────────────────────────────────────────
// Reemplaza los valores con los definitivos cuando los tengas.

export const MOTIVOS = [
    "No satisfecho",
    "Equivocación cliente",
    "Despacho errado",
    "Garantía",
];

export const CONDICIONES_PRODUCTO = [
    "Buen estado",
    "Equivocación cliente",
    "Despacho errado",
    "No funcional",
];

export const GESTIONES = [
    "Mismos productos",
    "Otro/s producto/s",
    "Rembolso total",
    "Rembolso parcial",
];

export const RESPONSABLES = [
    "Empresa",
    "Proveedor",
    "Cliente",
];

export const ESTADOS_RESOLUCION = [
    "Enviado proveedor",
    "Producto entregado Pr.",
    "Producto entregado Cl.",
    "Resuelto",
    "Rembolso proveedor",
    "Anulada",
];

// ─── Color del badge de estado ────────────────────────────────────────────────
export const getEstadoColor = (estado) => {
    switch (estado) {
        case "Resuelto":               return "bg-green-100 text-green-700";
        case "Anulada":                return "bg-red-100 text-red-600";
        case "Enviado proveedor":      return "bg-blue-100 text-blue-700";
        case "Rembolso proveedor":     return "bg-purple-100 text-purple-700";
        case "Producto entregado Pr.":
        case "Producto entregado Cl.": return "bg-yellow-100 text-yellow-700";
        default:                       return "bg-gray-100 text-gray-600";
    }
};