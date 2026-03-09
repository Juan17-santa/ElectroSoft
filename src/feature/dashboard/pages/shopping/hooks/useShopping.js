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
            comprasParseadas = comprasParseadas.map((compra) => ({
                ...compra,
                fechaCreacion: compra.fechaCreacion || new Date().toISOString(),
                movimientosInventario: compra.movimientosInventario || [],
                infoAnulacion: compra.infoAnulacion || null,
            }));
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
     * @returns {Object} { puedeAnularse: boolean, razon: string }
     */
    const validarAnulacion = (compra) => {
        // Validación 1: Estado debe ser "Activo"
        if (compra.estado !== "Activo") {
            return {
                puedeAnularse: false,
                razon: "Solo se pueden anular compras con estado 'Activo'.",
            };
        }

        // Validación 2: Debe haber sido creada hace menos de 7 días
        const fechaCreacion = new Date(compra.fechaCreacion);
        const ahora = new Date();
        const diferenciaDias = Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));

        if (diferenciaDias >= 7) {
            return {
                puedeAnularse: false,
                razon: `Esta compra fue creada hace ${diferenciaDias} días. Solo se pueden anular compras menores a 7 días.`,
            };
        }

        return { puedeAnularse: true, razon: "" };
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