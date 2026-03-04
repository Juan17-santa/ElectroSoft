export const Validations = {
    // Permite solo números (0-9). Puede estar vacío.
    soloNumeros: (value) => {
        return /^[0-9]*$/.test(value);
    },

    // Permite solo letras (incluye tildes y ñ) y espacios. Puede estar vacío.
    soloLetras: (value) => {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
    },

    // Permite letras y números sin espacios ni símbolos. Puede estar vacío.
    alfanumerico: (value) => {
        return /^[a-zA-Z0-9]*$/.test(value);
    },

    // Valida formato básico de correo electrónico.
    formatoEmail: (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },

    // Permite letras, números, espacios, punto, coma, guion y &
    // Debe contener al menos una letra
    // Para proveedores, ya que pueden tener nombres como "Proveedor XYZ S.A." o "Servicios & Soluciones ABC"
    alfanumericoNombre: (value) => {
        return /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&-]+$/.test(value);
    },
    
    // Valida que un campo no esté vacío
    campoRequerido: (value) => {
        return value !== null && value !== undefined && String(value).trim() !== "";
    },
     // Para nombres de productos: permite letras, números y espacios
    // Debe contener al menos una letra (no solo números)
    nombreProducto: (value) => {
        return /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]*$/.test(value);
    },
};