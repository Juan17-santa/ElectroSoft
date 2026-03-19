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
        if (!value || !value.trim()) return { valido: false, mensaje: "El email es requerido." };

        const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!basicRegex.test(value)) return { valido: false, mensaje: "Formato de email inválido." };

        const dominiosValidos = [
            "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
            "icloud.com", "live.com", "msn.com", "protonmail.com",
            "mail.com", "zoho.com", "aol.com", "yandex.com",
            "edu.co", "gov.co", "mil.co", "org.co", "net.co", "com.co"
        ];

        const partes   = value.toLowerCase().split("@");
        const dominio  = partes[1];
        const esValido = dominiosValidos.some(d => dominio === d || dominio.endsWith("." + d));

        if (!esValido) return { valido: false, mensaje: "Dominio de email no reconocido." };

        return { valido: true, mensaje: "" };
    },

    // Validaciones específicas para Clientes
    validarDocumentoCliente: (tipo, documento) => {
        if (!documento) return { valido: false, mensaje: "El documento es requerido." };
        if (!/^\d+$/.test(documento) && tipo !== "Pasaporte") {
            return { valido: false, mensaje: "Solo se permiten números." };
        }

        switch (tipo) {
            case "CC":
                if (documento.length < 8 || documento.length > 12) {
                    return { valido: false, mensaje: "La cédula debe tener entre 8 y 12 dígitos." };
                }
                break;
            case "CE":
                if (documento.length < 6 || documento.length > 12) {
                    return { valido: false, mensaje: "La cédula de extranjería debe tener entre 6 y 12 dígitos." };
                }
                break;
            case "NIT":
                if (documento.length < 8 || documento.length > 12) {
                    return { valido: false, mensaje: "El NIT debe tener entre 8 y 12 dígitos." };
                }
                break;
            case "Pasaporte":
                if (!/^[a-zA-Z0-9]{5,15}$/.test(documento)) {
                    return { valido: false, mensaje: "Pasaporte inválido (5-15 caracteres alfanuméricos)." };
                }
                break;
            default:
                return { valido: false, mensaje: "Seleccione un tipo de documento válido." };
        }
        return { valido: true, mensaje: "" };
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
        if (!/^\d{7,10}$/.test(value)) return { valido: false, mensaje: "Debe tener entre 7 y 10 dígitos." };
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

    validarDescripcionRol: (value) => {
        if (!value || !value.trim()) return { valido: false, mensaje: "La descripción es requerida." };
        if (value.trim().length < 10) return { valido: false, mensaje: "Mínimo 10 caracteres." };
        if (value.length > 200) return { valido: false, mensaje: "Máximo 200 caracteres." };
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:\-()]+$/.test(value))
            return { valido: false, mensaje: "Solo letras, números y puntuación básica." };
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