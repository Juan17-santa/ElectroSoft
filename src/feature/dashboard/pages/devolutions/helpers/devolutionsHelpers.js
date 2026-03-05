// ─── Enums cerrados (modelo formal) ──────────────────────────────────────────

export const MOTIVOS = ["GARANTIA", "LOGISTICA", "CLIENTE"];

/** Submotivos agrupados por motivo principal */
export const SUBMOTIVOS = {
    GARANTIA:  ["FALLA_FABRICA", "DEFECTO_PREMATURO"],
    LOGISTICA: ["DESPACHO_ERRADO", "PRODUCTO_INCOMPLETO", "PRODUCTO_DIFERENTE"],
    CLIENTE:   ["NO_SATISFECHO", "COMPRA_EQUIVOCADA"],
};

export const CONDICIONES_PRODUCTO = ["BUEN_ESTADO", "MAL_ESTADO", "NO_FUNCIONAL"];

export const GESTIONES = [
    "MISMO_PRODUCTO",
    "OTRO_PRODUCTO",
    "REEMBOLSO_TOTAL",
    "REEMBOLSO_PARCIAL",
];

/** Gestiones permitidas según motivo. Para CLIENTE depende del submotivo. */
const GESTIONES_MAPA = {
    GARANTIA:  ["MISMO_PRODUCTO", "OTRO_PRODUCTO", "REEMBOLSO_TOTAL", "REEMBOLSO_PARCIAL"],
    LOGISTICA: ["MISMO_PRODUCTO", "OTRO_PRODUCTO"],
    CLIENTE: {
        NO_SATISFECHO:     ["REEMBOLSO_TOTAL", "REEMBOLSO_PARCIAL"],
        COMPRA_EQUIVOCADA: ["OTRO_PRODUCTO", "REEMBOLSO_PARCIAL"],
    },
};

export const RESPONSABLES = ["EMPRESA", "PROVEEDOR"];

export const ESTADOS_RESOLUCION = [
    "CREADA",
    "PENDIENTE_PROVEEDOR",
    "ENVIADO_PROVEEDOR",
    "PRODUCTO_ENTREGADO_PROVEEDOR",
    "PRODUCTO_ENTREGADO_CLIENTE",
    "REEMBOLSO_PROVEEDOR",
    "RESUELTO",
    "RECHAZADA",
];

// ─── Helpers de negocio ───────────────────────────────────────────────────────

/**
 * Gestiones permitidas según motivo (y submotivo para CLIENTE).
 * Retorna array vacío si no hay regla definida aún.
 */
export function getGestionesPermitidas(motivo, submotivo) {
    if (!motivo) return GESTIONES;
    if (motivo === "CLIENTE") {
        return GESTIONES_MAPA.CLIENTE[submotivo] || [];
    }
    return GESTIONES_MAPA[motivo] || GESTIONES;
}

/**
 * Condiciones de producto permitidas según motivo.
 * GARANTIA  → MAL_ESTADO | NO_FUNCIONAL  (no BUEN_ESTADO)
 * CLIENTE   → BUEN_ESTADO solo
 * LOGISTICA → BUEN_ESTADO | MAL_ESTADO
 */
export function getCondicionesPermitidas(motivo) {
    if (motivo === "GARANTIA")  return ["MAL_ESTADO", "NO_FUNCIONAL"];
    if (motivo === "CLIENTE")   return ["BUEN_ESTADO"];
    if (motivo === "LOGISTICA") return ["BUEN_ESTADO", "MAL_ESTADO"];
    return CONDICIONES_PRODUCTO;
}

/**
 * Responsable auto-determinado según motivo y garantiaProveedor.
 * Retorna string o "" si aún no se puede determinar.
 */
export function getResponsableAuto(motivo, garantiaProveedor) {
    if (motivo === "LOGISTICA" || motivo === "CLIENTE") return "EMPRESA";
    if (motivo === "GARANTIA") {
        if (garantiaProveedor === true)  return "PROVEEDOR";
        if (garantiaProveedor === false) return "EMPRESA";
    }
    return "";
}

// ─── Color badges estado resolución ──────────────────────────────────────────

export function getEstadoColor(estado) {
    switch (estado) {
        case "RESUELTO":                     return "bg-green-100 text-green-700";
        case "RECHAZADA":                    return "bg-red-100 text-red-700";
        case "ENVIADO_PROVEEDOR":            return "bg-blue-100 text-blue-700";
        case "REEMBOLSO_PROVEEDOR":          return "bg-purple-100 text-purple-700";
        case "PRODUCTO_ENTREGADO_PROVEEDOR":
        case "PRODUCTO_ENTREGADO_CLIENTE":   return "bg-yellow-100 text-yellow-700";
        case "PENDIENTE_PROVEEDOR":          return "bg-orange-100 text-orange-700";
        case "CREADA":
        default:                             return "bg-gray-100 text-gray-600";
    }
}