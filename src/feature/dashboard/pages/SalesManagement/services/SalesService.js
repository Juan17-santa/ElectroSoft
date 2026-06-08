import api from "../../../../../utils/api.js";

// Mapea el modelo del backend al modelo del frontend
const mapSaleToFrontend = (sale) => {
    return {
        id: sale._id,
        numeroVenta: sale.numeroFactura,
        numeroDocumento: sale.clienteId?.documentNumber || "N/A",
        cliente: sale.clienteId ? `${sale.clienteId.firstName} ${sale.clienteId.lastName}` : "Cliente Desconocido",
        tipoVenta: sale.tipoVenta || "Contado",
        fecha: sale.fechaVenta || new Date(sale.fechaCreacion).toISOString().split('T')[0],
        estado: sale.estado === 'ACTIVA' ? 'Vigente' : (sale.estado === 'ANULADA' ? 'Anulado' : sale.estado),
        productos: (sale.productos || []).map(p => ({
            productoId: p.productoId?._id || p.productoId,
            nombre: p.productoId?.name || p.nombre || "Producto",
            precio: p.precioUnitario,
            cantidad: p.cantidad
        })),
        subtotal: sale.total,
        iva: 0,
        total: sale.total,
        montoPagado: sale.montoPagado || 0,
        montoPorPagar: sale.montoPorPagar || sale.total,
        abonos: sale.abonos || [],
        observaciones: sale.observaciones || "",
    };
};

export const SalesService = {
    async get() {
        try {
            const response = await api.get('/sales');
            const data = response.data.data || response.data;
            const sales = Array.isArray(data) ? data : [];
            return sales.map(mapSaleToFrontend);
        } catch (error) {
            console.error("Error fetching sales from API:", error);
            throw error;
        }
    },

    async create({ numeroDocumento, tipoVenta, diasPlazo, fecha, estado, productos, subtotal, iva, total }) {
        try {
            const numeroFactura = `FAC-${Date.now().toString().slice(-6)}`;

            const payload = {
                numeroFactura,
                clienteId: numeroDocumento, // ObjectId del cliente
                tipoVenta: tipoVenta || "Contado",
                productos: productos.map(p => ({
                    productoId: p.productoId || p.id,
                    cantidad: p.cantidad,
                    precioUnitario: p.precio
                })),
                fechaVenta: fecha
            };

            const response = await api.post('/sales', payload);
            const newSale = response.data.data || response.data;
            const mappedSale = mapSaleToFrontend(newSale);

            // Crear pago inicial si es Contado
            if (tipoVenta === 'Contado') {
                try {
                    await api.post('/payments', {
                        ventaId: mappedSale.id,
                        monto: mappedSale.total,
                        metodoPago: "EFECTIVO",
                        notas: "Pago automático de contado"
                    });
                } catch (paymentErr) {
                    console.error("Error creating initial payment:", paymentErr);
                }
            }

            return mappedSale;
        } catch (error) {
            console.error("Error creating sale via API:", error);
            throw error;
        }
    },

    async addPayment(id, monto) {
         // Delegated to paymentsService /api/payments, but keeping signature for compatibility if needed.
         // Recommend using paymentsService.js instead.
         console.warn("addPayment called on SalesService. Use paymentsService instead.");
    },

    async voidPayment(saleId, paymentId) {
        console.warn("voidPayment called on SalesService. Not supported in backend.");
    },

    async anullSale(id) {
        try {
            const response = await api.patch(`/sales/${id}/cancel`);
            const updatedSale = response.data.data || response.data;
            return mapSaleToFrontend(updatedSale);
        } catch (error) {
            console.error("Error anulling sale via API:", error);
            throw error;
        }
    },

    async returnSale(id, esParcial = false) {
        console.warn("returnSale called. Not implemented in backend.");
    },

    async getById(id) {
        try {
            const response = await api.get(`/sales/${id}`);
            const data = response.data.data || response.data;
            return mapSaleToFrontend(data);
        } catch (error) {
            console.error("Error fetching sale by ID:", error);
            throw error;
        }
    }
};