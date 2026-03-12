/**
 * SalesService.js
 * 
 * Servicio de datos para la gestión de ventas.
 * Todas las operaciones se realizan contra localStorage con la clave "sales".
 * 
 * Métodos disponibles:
 * - get()                   → Obtener todas las ventas
 * - getById(id)             → Obtener una venta por ID
 * - create({...})           → Crear nueva venta (calcula subtotal, IVA, total)
 * - update(venta)           → Actualizar una venta existente
 * - delete(id)              → Eliminar una venta
 * - addPayment(id, monto)   → Agregar abono a venta crédito
 * - removePayment(id, idx)  → Eliminar un abono específico
 * - anullSale(id)           → Anular venta (estado → "Anulado")
 * - returnSale(id)          → Devolver venta (estado → "Devuelto")
 */
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
    create({ numeroDocumento, tipoVenta, fecha, estado, productos }) {

        const sales = this.get();

        // Cálculo de montos
        const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;

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

        return nuevaVenta;
    },

    /** Actualiza una venta existente (reemplaza por ID) */
    update(ventaActualizada) {

        const sales = this.get();

        const nuevasVentas = sales.map(sale => sale.id === ventaActualizada.id ? ventaActualizada : sale);

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        return nuevasVentas;
    },

    /** Elimina una venta por ID */
    delete(id) {

        const data = JSON.parse(localStorage.getItem(KEY)) || [];

        const newData = data.filter(sale => sale.id !== id);

        localStorage.setItem(KEY, JSON.stringify(newData));

        return newData;
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
                const nuevoAbono = {
                    fecha: new Date().toISOString().split('T')[0],
                    monto: parseFloat(monto)
                };
                const abonos = [...(sale.abonos || []), nuevoAbono];
                const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0);
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
     * Elimina un abono específico de una venta por índice.
     * Recalcula montoPagado y montoPorPagar.
     * Si aún queda saldo pendiente, el estado vuelve a "Vigente".
     * 
     * @param {number} saleId - ID de la venta
     * @param {number} paymentIndex - Índice del abono a eliminar
     */
    removePayment(saleId, paymentIndex) {

        const sales = this.get();

        const nuevasVentas = sales.map(sale => {
            if (sale.id === saleId) {
                const abonos = (sale.abonos || []).filter((_, i) => i !== paymentIndex);
                const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0);
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

    /** Alterna el estado de una venta entre "Vigente" y "Finalizado" */
    toggleEstado(id) {

        const sales = this.get();

        const nuevasVentas = sales.map(sale =>
            sale.id === id
                ? { ...sale, estado: sale.estado === "Vigente" ? "Finalizado" : "Vigente" }
                : sale
        );

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        return nuevasVentas;
    },

    /** Anula una venta — cambia el estado a "Anulado" */
    anullSale(id) {
        const sales = this.get();

        const nuevasVentas = sales.map(sale =>
            sale.id === id
                ? { ...sale, estado: "Anulado" }
                : sale
        );

        localStorage.setItem(KEY, JSON.stringify(nuevasVentas));

        return nuevasVentas;
    },

    /** Devuelve una venta — cambia el estado a "Devuelto" */
    returnSale(id) {
        const sales = this.get();

        const nuevasVentas = sales.map(sale =>
            sale.id === id
                ? { ...sale, estado: "Devuelto" }
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