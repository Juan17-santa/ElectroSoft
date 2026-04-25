const KEY = "sales";

export const SalesService = {

    /** Obtiene todas las ventas almacenadas en localStorage */
    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Crea una nueva venta y la guarda en localStorage.
     * 
     * @param {string} numeroDocumento - Número de documento del cliente
     * @param {string} tipoVenta - "Contado" o "Crédito"
     * @param {string} fecha - Fecha de la venta (YYYY-MM-DD)
     * @param {string} estado - Estado inicial de la venta
     * @param {Array} productos - Lista de productos [{nombre, precio, cantidad}]
     * @returns {Object} La venta creada con id, subtotal, IVA, total calculados
     * 
     * Lógica especial:
     * - Calcula subtotal = suma(precio × cantidad)
     * - IVA = subtotal × 19%
     * - Total = subtotal + IVA
     * - Busca el nombre del cliente por documento en localStorage('clients')
     * - Si tipoVenta = "Contado": estado = "Finalizado", montoPagado = total
     * - Si tipoVenta = "Crédito": montoPagado = 0, montoPorPagar = total
     */
    create({ numeroDocumento, tipoVenta, diasPlazo, fecha, estado, productos, subtotal, iva, total }) {

        const sales = this.get();

        // Número de venta auto-incremental
        const numeroVenta = sales.length > 0
            ? Math.max(...sales.map(s => s.numeroVenta || 0)) + 1
            : 1;

        // Buscar nombre del cliente por documento en la lista de clientes
        let cliente = '';
        try {
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const found = clients.find(c => c.documento === numeroDocumento);
            if (found) {
                cliente = `${found.nombres} ${found.apellidos}`;
            }
        } catch (e) {
            console.error('Error buscando cliente:', e);
        }

        // Las ventas de contado se marcan como finalizadas y pagadas
        const esPagado = tipoVenta === 'Contado';

        const nuevaVenta = {
            id: Date.now(),
            numeroVenta,
            numeroDocumento,
            cliente,
            tipoVenta,
            diasPlazo: tipoVenta === "Credito" ? (diasPlazo || null) : null,
            fecha,
            estado: esPagado ? 'Finalizado' : estado,
            productos,
            subtotal,
            iva,
            total,
            montoPagado: esPagado ? total : 0,
            montoPorPagar: esPagado ? 0 : total,
            abonos: []   // Array de abonos para ventas a crédito
        };

        const nuevasVentas = [...sales, nuevaVenta];
        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        // Restar stock de los productos vendidos
        try {
            const productsKey = "products";
            const allProducts = JSON.parse(localStorage.getItem(productsKey) || "[]");
            const updatedProducts = allProducts.map(p => {
                const soldProduct = productos.find(sp => sp.nombre === p.nombre);
                if (soldProduct) {
                    return { ...p, stock: (p.stock || 0) - soldProduct.cantidad };
                }
                return p;
            });
            localStorage.setItem(productsKey, JSON.stringify(updatedProducts));
        } catch (e) {
            console.error('Error actualizando stock:', e);
        }

        return nuevaVenta;
    },

    /**
     * Agrega un abono (pago parcial) a una venta a crédito.
     * Recalcula montoPagado y montoPorPagar.
     * Si montoPorPagar llega a 0, el estado cambia a "Finalizado".
     * 
     * @param {number} id - ID de la venta
     * @param {number} monto - Monto del abono a agregar
     */
    addPayment(id, monto) {

        const sales = this.get();

        const nuevasVentas = sales.map(sale => {
            if (sale.id === id) {
                const now = new Date();
                const fechaConHora = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                
                const nuevoAbono = {
                    id: Date.now(),
                    fecha: fechaConHora,
                    monto: parseFloat(monto),
                    anulado: false
                };
                const abonos = [...(sale.abonos || []), nuevoAbono];
                const totalAbonado = abonos.filter(a => !a.anulado).reduce((sum, a) => sum + a.monto, 0);
                const montoPorPagar = sale.total - totalAbonado;
                return {
                    ...sale,
                    abonos,
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    estado: montoPorPagar <= 0 ? "Finalizado" : "Vigente"
                };
            }
            return sale;
        });

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        return nuevasVentas;
    },

    /**
     * Anula un abono específico de una venta.
     * Recalcula montoPagado y montoPorPagar.
     * 
     * @param {number} saleId - ID de la venta
     * @param {number} paymentId - ID o índice del abono a anular
     */
    voidPayment(saleId, paymentId) {
        const sales = this.get();
        const nuevasVentas = sales.map(sale => {
            if (sale.id === saleId) {
                const abonos = (sale.abonos || []).map((a, idx) => {
                    // Soporta anulación por ID o por índice (para compatibilidad)
                    if (a.id === paymentId || idx === paymentId) {
                        return { ...a, anulado: true };
                    }
                    return a;
                });

                const totalAbonado = abonos.filter(a => !a.anulado).reduce((sum, a) => sum + a.monto, 0);
                const montoPorPagar = sale.total - totalAbonado;

                return {
                    ...sale,
                    abonos,
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    estado: montoPorPagar <= 0 ? "Finalizado" : "Vigente"
                };
            }
            return sale;
        });

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));
        return nuevasVentas;
    },


    /** Anula una venta — cambia el estado a "Anulado" y devuelve stock */
    anullSale(id) {
        const sales = this.get();
        let saleToAnull = null;

        const nuevasVentas = sales.map(sale => {
            if (sale.id === id) {
                saleToAnull = sale;
                return { ...sale, estado: "Anulado" };
            }
            return sale;
        });

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        // Devolver stock si la venta existía y no estaba ya anulada
        if (saleToAnull && saleToAnull.estado !== "Anulado") {
            try {
                const productsKey = "products";
                const allProducts = JSON.parse(localStorage.getItem(productsKey) || "[]");
                const updatedProducts = allProducts.map(p => {
                    const soldProduct = saleToAnull.productos.find(sp => sp.nombre === p.nombre);
                    if (soldProduct) {
                        return { ...p, stock: (p.stock || 0) + soldProduct.cantidad };
                    }
                    return p;
                });
                localStorage.setItem(productsKey, JSON.stringify(updatedProducts));
            } catch (e) {
                console.error('Error devolviendo stock al anular:', e);
            }
        }

        return nuevasVentas;
    },

    /** Devuelve una venta — cambia el estado a "Devuelto" o "Devolución Parcial" */
    returnSale(id, esParcial = false) {
        const sales = this.get();

        const nuevasVentas = sales.map(sale =>
            sale.id === id
                ? { ...sale, estado: esParcial ? "Devolución Parcial" : "Devuelto" }
                : sale
        );

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        return nuevasVentas;
    },

    /** Obtiene una venta específica por su ID */
    getById(id) {
        const sales = this.get();
        return sales.find(sale => sale.id === id);
    }
}