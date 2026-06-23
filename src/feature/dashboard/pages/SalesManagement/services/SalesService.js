import api from "../../../../../utils/api.js";

// Mapea el modelo del backend al modelo del frontend
const mapSaleToFrontend = (sale) => {
    return {
        id: sale._id,
        // Extrae solo los números del numeroFactura, eliminando prefijos como "FAC"
        numeroVenta: String(sale.numeroFactura || "").replace(/\D/g, ""),
        numeroDocumento: sale.clienteId?.documentNumber || "N/A",
        cliente: sale.clienteId ? `${sale.clienteId.firstName} ${sale.clienteId.lastName}` : "Cliente Desconocido",
        // ✅ FIX: normalizar tipoVenta a sin-tilde para comparaciones frontend simples
        tipoVenta: sale.tipoVenta === "Crédito" ? "Credito" : (sale.tipoVenta || "Contado"),
        fecha: sale.fechaVenta || new Date(sale.fechaCreacion).toISOString().split('T')[0],
        fechaCreacion: sale.fechaCreacion,
        // ✅ FIX: estado más preciso (Finalizado se calcula en paymentsService al enriquecer con pagos, pero para Contado es automático)
        estado: sale.estado === 'ACTIVA' ? (sale.tipoVenta === 'Contado' ? 'Finalizado' : 'Vigente') : (sale.estado === 'ANULADA' ? 'Anulado' : sale.estado),
        productos: (sale.productos || []).map(p => ({
            productoId: p.productoId?._id || p.productoId,
            nombre: p.productoId?.name || p.nombre || "Producto",
            precio: p.precioUnitario,
            cantidad: p.cantidad
        })),
        subtotal: sale.total,
        iva: 0,
        total: sale.total,
        // montoPagado y montoPorPagar los enriquece paymentsService al consultar /payments/venta/:id para ventas a Crédito.
        // Para Contado, se pagan inmediatamente al crear la venta.
        montoPagado: sale.tipoVenta === 'Contado' ? sale.total : (sale.montoPagado || 0),
        montoPorPagar: sale.tipoVenta === 'Contado' ? 0 : (sale.montoPorPagar ?? sale.total),
        anuladaEn: sale.anuladaEn || null,
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
            const allSalesRes = await api.get('/sales');
            const allSalesData = allSalesRes.data.data || allSalesRes.data;
            const count = Array.isArray(allSalesData) ? allSalesData.length + 1 : 1;
            const numeroFactura = String(count).padStart(2, '0');

            const payload = {
                numeroFactura,
                clienteId: numeroDocumento, // ObjectId del cliente
                // ✅ FIX: el backend solo acepta "Crédito" (con tilde) en el enum
                tipoVenta: tipoVenta === "Credito" ? "Crédito" : (tipoVenta || "Contado"),
                productos: productos.map(p => ({
                    productoId: p.productoId || p.id || p.idProducto,
                    cantidad: p.cantidad,
                    precioUnitario: p.precio
                })),
                fechaVenta: fecha
            };

            const response = await api.post('/sales', payload);
            const newSale = response.data.data || response.data;
            const mappedSale = mapSaleToFrontend(newSale);

            // ✅ FIX: si el pago inicial de contado falla, lanzar warning pero no silenciar
            if (tipoVenta === 'Contado' || tipoVenta === "Contado") {
                try {
                    await api.post('/payments', {
                        ventaId: mappedSale.id,
                        monto: mappedSale.total,
                        metodoPago: "EFECTIVO",
                        notas: "Pago automático de contado"
                    });
                } catch (paymentErr) {
                    // No bloquea la venta, pero avisa en consola con detalle
                    console.warn("[SalesService] Venta creada pero el pago inicial de contado falló:", paymentErr?.response?.data || paymentErr.message);
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

    async anullSale(id, motivo) {
        try {
            const response = await api.patch(`/sales/${id}/cancel`, { motivo });
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