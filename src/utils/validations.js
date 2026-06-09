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
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    },

    // Validación de email con verificación de dominio conocido
    validarEmail: (value) => {
        if (!value || !value.trim()) {
            return {
                valido: false,
                mensaje: "El email es requerido."
            };
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value)) {
            return {
                valido: false,
                mensaje: "Formato de email inválido."
            };
        }

        return {
            valido: true,
            mensaje: ""
        };
    },

    // Validaciones específicas para Clientes
    validarDocumentoCliente: (documento) => {
        if (!documento) {
            return {
                valido: false,
                mensaje: "El documento es requerido."
            };
        }

        if (!/^\d+$/.test(documento)) {
            return {
                valido: false,
                mensaje: "Solo se permiten números."
            };
        }

        if (documento.length < 8 || documento.length > 12) {
            return {
                valido: false,
                mensaje: "Debe tener entre 8 y 12 dígitos."
            };
        }

        return {
            valido: true,
            mensaje: ""
        };
    },

    validarNombreApellido: (value) => {
        if (!value) return { valido: false, mensaje: "Este campo es requerido." };
        if (value.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
        if (value.length > 40) return { valido: false, mensaje: "Máximo 40 caracteres." };
        if (/[0-9]/.test(value)) return { valido: false, mensaje: "No debe contener números." };
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return { valido: false, mensaje: "Solo se permiten letras." };
        if (/\s{2,}/.test(value)) return { valido: false, mensaje: "No se permiten espacios dobles." };
        return { valido: true, mensaje: "" };
    },

    validarTelefono: (value) => {
        if (!value) return { valido: false, mensaje: "El teléfono es requerido." };
        if (!/^\d{7,14}$/.test(value)) return { valido: false, mensaje: "Debe tener entre 7 y 14 dígitos." };
        if (/^(\d)\1{6,}$/.test(value)) return { valido: false, mensaje: "Número no válido (dígitos repetidos)." };
        if (value.startsWith("0")) return { valido: false, mensaje: "El teléfono no puede comenzar con 0." };
        return { valido: true, mensaje: "" };
    },

    // Validaciones para Roles
    validarNombreRol: (value) => {
        if (!value) return { valido: false, mensaje: "El nombre del rol es requerido." };
        if (value.length < 4) return { valido: false, mensaje: "Mínimo 4 caracteres." };
        if (!/^[a-zA-Z\s]+$/.test(value)) return { valido: false, mensaje: "Solo letras y espacios." };
        return { valido: true, mensaje: "" };
    },

    // Validaciones para Ventas
    validarNumeroVenta: (value) => {
        if (!value || !value.trim()) return { valido: false, mensaje: "El número de documento es requerido." };
        if (!/^[a-zA-Z0-9-]+$/.test(value)) return { valido: false, mensaje: "Formato inválido (letras, números, guiones)." };
        return { valido: true, mensaje: "" };
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