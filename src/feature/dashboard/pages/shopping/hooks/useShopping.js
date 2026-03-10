import { useState, useEffect } from "react";
import { formatCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";

/**
 * Hook centralizado para el módulo de compras.
 * Maneja: carga desde localStorage, guardado, anulación, inventario y búsqueda.
 */
export function useShopping() {
    const [compras, setCompras] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem("compras");
        if (stored) {
            let comprasParseadas = JSON.parse(stored);
            // Backward compatibility: agregar campos faltantes a compras antiguas
            comprasParseadas = comprasParseadas.map((compra) => {
                // Derivar la fecha real de la compra desde fechaCompra (formato DD/MM/YYYY)
                // para detectar si fechaCreacion fue asignado incorrectamente.
                let fechaCreacionCorregida = compra.fechaCreacion || new Date(0).toISOString();

                if (compra.fechaCompra) {
                    const partes = compra.fechaCompra.split("/"); // ["DD","MM","YYYY"]
                    if (partes.length === 3) {
                        const fechaRealCompra = new Date(
                            Number(partes[2]),   // año
                            Number(partes[1]) - 1, // mes (0-indexed)
                            Number(partes[0])    // día
                        );
                        const ahora = new Date();
                        const diffHorasFechaCompra = (ahora - fechaRealCompra) / (1000 * 60 * 60);

                        // Si la fecha de la compra tiene más de 48h de antigüedad,
                        // forzamos fechaCreacion a esa fecha para que no pueda anularse,
                        // sin importar qué valor tenga fechaCreacion guardado.
                        if (diffHorasFechaCompra >= 48) {
                            fechaCreacionCorregida = fechaRealCompra.toISOString();
                        }
                    }
                }

                return {
                    ...compra,
                    fechaCreacion: fechaCreacionCorregida,
                    movimientosInventario: compra.movimientosInventario || [],
                    infoAnulacion: compra.infoAnulacion || null,
                };
            });
            setCompras(comprasParseadas);
        }
    }, []);

    // ─── Filtrado ──────────────────────────────────────────────────────────────
    const comprasFiltradas = compras.filter((c) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
            c.proveedor.toLowerCase().includes(term) ||
            c.numeroFactura.toLowerCase().includes(term) ||
            c.fechaCompra.toLowerCase().includes(term) ||
            c.estado.toLowerCase().includes(term)
        );
    });

    // ─── Acciones ──────────────────────────────────────────────────────────────

    /**
     * Guarda una nueva compra en localStorage e incrementa el inventario
     * @param {Object} params - { numeroFactura, fechaFactura, proveedor, total, productos }
     */
    const guardarCompra = ({ numeroFactura, fechaFactura, proveedor, total, productos }) => {
        const fechaCreacion = new Date().toISOString();
        
        // Registrar movimientos de inventario (entrada)
        const movimientos = [];
        
        productos.forEach((producto) => {
            // Obtener producto actual del sistema
            const productoActual = ServicesProducts.getById(producto.id);
            
            if (productoActual) {
                const cantidadOriginal = productoActual.stock;
                const cantidadNueva = cantidadOriginal + producto.cantidad;
                
                // Actualizar stock en productos
                ServicesProducts.update({
                    ...productoActual,
                    stock: cantidadNueva
                });
                
                // Registrar movimiento
                movimientos.push({
                    productoId: producto.id,
                    productoNombre: producto.nombre,
                    cantidad: producto.cantidad,
                    cantidadAnterior: cantidadOriginal,
                    cantidadNueva: cantidadNueva,
                    tipo: "ENTRADA",
                    fecha: fechaCreacion,
                });
            }
        });

        const nuevaCompra = {
            id: Date.now(),
            numeroFactura,
            fechaCompra: fechaFactura,
            proveedor,
            iva: formatCOP(Math.round(total * (0.19 / 1.19))),
            total: formatCOP(Math.round(total)),
            estado: "Activo",
            productos,
            fechaCreacion,
            movimientosInventario: movimientos,
            infoAnulacion: null,
        };
        
        const updated = [...compras, nuevaCompra];
        localStorage.setItem("compras", JSON.stringify(updated));
        setCompras(updated);
    };

    /**
     * Valida si una compra puede anularse según reglas de negocio
     * @param {Object} compra - La compra a validar
     * @returns {Object} { puedeAnularse: boolean, razon: string, horasRestantes: number }
     */
    const validarAnulacion = (compra) => {
        // Validación 1: Estado debe ser "Activo"
        if (compra.estado !== "Activo") {
            return {
                puedeAnularse: false,
                razon: "Solo se pueden anular compras con estado 'Activo'.",
                horasRestantes: 0,
            };
        }

        // Validación 2: Debe haber sido creada hace menos de 48 horas
        const fechaCreacion = new Date(compra.fechaCreacion);
        const ahora = new Date();
        const diferenciasMs = ahora - fechaCreacion;
        const diferenciasHoras = diferenciasMs / (1000 * 60 * 60);
        const horasRestantes = Math.max(0, 48 - Math.floor(diferenciasHoras));

        if (diferenciasHoras >= 48) {
            return {
                puedeAnularse: false,
                razon: "Ha pasado más de 48 horas desde la creación de esta compra. No se puede anular.",
                horasRestantes: 0,
            };
        }

        return { puedeAnularse: true, razon: "", horasRestantes };
    };

    /**
     * Anula una compra y revierte los cambios en el inventario
     * @param {number} id - ID de la compra
     * @param {Object} infoAnulacion - Objeto con { motivo, fechaAnulacion, usuario }
     */
    const handleAnular = (id, infoAnulacion) => {
        const compraAAnular = compras.find((c) => c.id === id);
        
        if (compraAAnular && compraAAnular.movimientosInventario) {
            // Revertir movimientos de inventario
            compraAAnular.movimientosInventario.forEach((movimiento) => {
                const producto = ServicesProducts.getById(movimiento.productoId);
                
                if (producto) {
                    // Restar la cantidad que se había sumado
                    const nuevoStock = producto.stock - movimiento.cantidad;
                    
                    ServicesProducts.update({
                        ...producto,
                        stock: Math.max(0, nuevoStock), // Evitar stock negativo
                    });
                }
            });
        }

        // Actualizar estado de la compra
        const updated = compras.map((c) =>
            c.id === id
                ? {
                    ...c,
                    estado: "Anulada",
                    infoAnulacion: {
                        motivo: infoAnulacion.motivo,
                        fechaAnulacion: infoAnulacion.fechaAnulacion,
                        usuario: infoAnulacion.usuario,
                    },
                }
                : c
        );
        
        setCompras(updated);
        localStorage.setItem("compras", JSON.stringify(updated));
    };

    /** Busca una compra por su id (útil para ShoppingDetails) */
    const getCompraById = (id) =>
        compras.find((c) => String(c.id) === String(id)) || null;

    return {
        compras,
        comprasFiltradas,
        searchTerm,
        setSearchTerm,
        guardarCompra,
        handleAnular,
        getCompraById,
        validarAnulacion,
    };
}