import { useState, useEffect } from "react";
import { formatCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { ServicesShopping } from "../services/ServicesShopping";

/**
 * Hook centralizado para el módulo de compras.
 * Maneja: carga, guardado, anulación, inventario y búsqueda.
 *
 * Reglas de negocio aplicadas:
 *  - Al guardar una compra se incrementa el stock de cada producto
 *    y se actualiza su precio de venta en el catálogo (precioVenta → precio).
 *  - La anulación solo está disponible dentro de las 48 h posteriores
 *    al registro de la compra (fechaCreacion), no a la fecha de factura.
 *  - Al anular se revierte el inventario; si el stock actual es menor
 *    al que se había ingresado, se trunca a 0 y se registra una advertencia.
 */
export function useShopping() {
    const [compras, setCompras] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        // #5 / #6: Se usa ServicesShopping en lugar de leer localStorage directo.
        // #2: Se elimina el bloque de "backward compatibility" que sobreescribía
        //     fechaCreacion con fechaCompra, confundiendo dos conceptos distintos:
        //     la fecha de la factura del proveedor ≠ la fecha de registro en el sistema.
        const comprasGuardadas = ServicesShopping.get().map((compra) => ({
            ...compra,
            // Garantizar que campos opcionales siempre existan
            fechaCreacion: compra.fechaCreacion || new Date(0).toISOString(),
            movimientosInventario: compra.movimientosInventario || [],
            infoAnulacion: compra.infoAnulacion || null,
        }));
        setCompras(comprasGuardadas);
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
     * Guarda una nueva compra, actualiza el inventario y el catálogo de precios.
     *
     * @param {Object} params
     * @param {string}   params.numeroFactura
     * @param {string}   params.fechaFactura    - Fecha formateada (DD/MM/YYYY)
     * @param {string}   params.proveedor       - Nombre del proveedor (display)
     * @param {number}   params.proveedorId     - ID del proveedor (referencia)
     * @param {number}   params.total           - Total de la compra (con IVA, base coste)
     * @param {Array}    params.productos        - Lista de productos con { id, nombre, cantidad, precio, costeProducto, precioVenta, subtotal }
     */
    const guardarCompra = ({ numeroFactura, fechaFactura, proveedor, proveedorId, total, productos }) => {
        const fechaCreacion = new Date().toISOString();
        const movimientos = [];

        productos.forEach((producto) => {
            const productoActual = ServicesProducts.getById(producto.id);

            if (productoActual) {
                const stockAnterior = productoActual.stock;
                const stockNuevo = stockAnterior + producto.cantidad;

                // WAC = (stockAnterior × precioActual + cantidadNueva × precioVenta) / stockNuevo
                // Redondeado hacia arriba a la centena: 1922 → 2000 | 1270 → 1300 | 2050 → 2100
                const precioActual = productoActual.precio ?? 0;
                const precioVenta  = Number(producto.precioVenta);

                const wacExacto = stockAnterior > 0
                    ? (stockAnterior * precioActual + producto.cantidad * precioVenta) / stockNuevo
                    : precioVenta;
                const costoPromedioNuevo = Math.ceil(wacExacto / 100) * 100;

                // precio se actualiza con el WAC redondeado → cambio visible en Products
                // y en todo el sistema. costoPromedio guarda el mismo valor para auditoría.
                // Si el usuario confirma el modal de precio de venta en CreateShopping,
                // ese paso sobreescribirá precio con precioVenta después de este llamado.
                ServicesProducts.update({
                    ...productoActual,
                    stock:         stockNuevo,
                    precio:        costoPromedioNuevo, // WAC → visible en Products y todo el sistema
                    costoPromedio: costoPromedioNuevo, // ídem, guardado para auditoría
                });

                movimientos.push({
                    productoId: producto.id,
                    productoNombre: producto.nombre,

                    cantidad: producto.cantidad,
                    cantidadAnterior: stockAnterior,
                    cantidadNueva: stockNuevo,

                    precioVentaUnitario:   precioVenta,
                    precioAnterior:        precioActual,
                    costoPromedioNuevo:    costoPromedioNuevo,

                    tipo: "ENTRADA",
                    fecha: fechaCreacion,
                });
            }
        });

        const nuevaCompra = {
            id: Date.now(),
            numeroFactura,
            fechaCompra:          fechaFactura,
            proveedor,            // Nombre — para búsqueda y display
            proveedorId,          // #7: ID del proveedor para trazabilidad
            iva:                  formatCOP(Math.round(total * (0.19 / 1.19))),
            total:                formatCOP(Math.round(total)),
            estado:               "Activo",
            productos,
            fechaCreacion,        // Momento exacto del registro en el sistema
            movimientosInventario: movimientos,
            infoAnulacion:        null,
        };

        // #5: Persistencia a través de la capa de servicio
        ServicesShopping.create(nuevaCompra);
        setCompras((prev) => [...prev, nuevaCompra]);
    };

    /**
     * Valida si una compra puede anularse según las reglas de negocio.
     *
     * Se aplican DOS controles independientes de 48 h:
     *  1. Desde fechaCreacion  → cuándo se registró la compra en el sistema.
     *  2. Desde fechaCompra    → la fecha de la factura del proveedor (DD/MM/YYYY).
     *
     * Si CUALQUIERA de las dos supera las 48 h, la compra no puede anularse.
     * Esto garantiza que:
     *  - Una compra registrada hoy con factura de hace 5 días → bloqueada (regla de fecha de factura).
     *  - Una compra con factura de hoy registrada hace 3 días → bloqueada (regla de registro).
     *
     * @param {Object} compra
     * @returns {{ puedeAnularse: boolean, razon: string, horasRestantes: number }}
     */
    const validarAnulacion = (compra) => {
        if (compra.estado !== "Activo") {
            return {
                puedeAnularse:  false,
                razon:          "Solo se pueden anular compras con estado 'Activo'.",
                horasRestantes: 0,
            };
        }

        const ahora = new Date();

        // ── Control 1: fecha de registro en el sistema ────────────────────────
        const fechaCreacion       = new Date(compra.fechaCreacion);
        const horasDesdeCreacion  = (ahora - fechaCreacion) / (1000 * 60 * 60);

        if (horasDesdeCreacion >= 48) {
            return {
                puedeAnularse:  false,
                razon:          "Han pasado más de 48 h desde el registro de la compra.",
                horasRestantes: 0,
            };
        }

        // ── Control 2: fecha de la factura del proveedor (DD/MM/YYYY) ─────────
        if (compra.fechaCompra) {
            const partes = compra.fechaCompra.split("/"); // ["DD","MM","YYYY"]
            if (partes.length === 3) {
                // Se toma el final del día de la factura para no penalizar
                // compras realizadas el mismo día pero en horas tempranas.
                const fechaFactura = new Date(
                    Number(partes[2]),
                    Number(partes[1]) - 1,
                    Number(partes[0]),
                    23, 59, 59, 999
                );
                const horasDesdeFactura = (ahora - fechaFactura) / (1000 * 60 * 60);

                if (horasDesdeFactura >= 48) {
                    return {
                        puedeAnularse:  false,
                        razon:          "La fecha de la factura supera el plazo de 48 horas permitido para anular.",
                        horasRestantes: 0,
                    };
                }
            }
        }

        // Horas restantes basadas en el control más restrictivo
        const horasRestantes = Math.max(
            0,
            48 - Math.floor(horasDesdeCreacion)
        );

        return { puedeAnularse: true, razon: "", horasRestantes };
    };

    /**
     * Anula una compra y revierte el inventario.
     * #14: Si el stock actual es menor al que se ingresó en la compra (p. ej. ya se
     * vendió parte del lote), el stock se trunca a 0 y se devuelve una advertencia
     * en lugar de quedar en negativo silenciosamente.
     *
     * @param {number} id               - ID de la compra a anular
     * @param {Object} infoAnulacion    - { motivo, fechaAnulacion, usuario }
     * @returns {{ advertencias: string[] }} - Lista de advertencias de inventario
     */
    const handleAnular = (id, infoAnulacion) => {
        const compraAAnular = compras.find((c) => c.id === id);
        const advertencias = [];

        if (compraAAnular?.movimientosInventario?.length) {
            compraAAnular.movimientosInventario.forEach((mov) => {
                const producto = ServicesProducts.getById(mov.productoId);
                if (!producto) return;

                const stockCalculado = producto.stock - mov.cantidad;

                // #14: Detectar y advertir sobre stock que sería negativo
                if (stockCalculado < 0) {
                    advertencias.push(
                        `"${mov.productoNombre}": el stock actual (${producto.stock}) es menor ` +
                        `a las unidades ingresadas en la compra (${mov.cantidad}). ` +
                        `Se ajustó a 0, pero puede haber inconsistencia en el inventario.`
                    );
                }

                ServicesProducts.update({
                    ...producto,
                    stock: Math.max(0, stockCalculado),
                });
            });
        }

        const updated = compras.map((c) =>
            c.id === id
                ? {
                    ...c,
                    estado: "Anulada",
                    infoAnulacion: {
                        motivo:         infoAnulacion.motivo,
                        fechaAnulacion: infoAnulacion.fechaAnulacion,
                        usuario:        infoAnulacion.usuario,
                    },
                }
                : c
        );

        // #5: Persistencia a través de la capa de servicio
        ServicesShopping.saveAll(updated);
        setCompras(updated);

        return { advertencias };
    };

    /** Busca una compra por su id */
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