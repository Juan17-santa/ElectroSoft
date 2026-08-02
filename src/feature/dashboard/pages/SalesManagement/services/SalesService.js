import api from "../../../../../utils/api.js";

const abbreviateDocType = (type) => {
    if (!type) return "";
    const t = type.toLowerCase();
    if (t.includes("ciudadan")) return "CC";
    if (t.includes("extranjer")) return "CE";
    if (t.includes("identidad")) return "TI";
    if (t.includes("pasaporte")) return "PA";
    return type;
};

const localDate = (dateParam) => {
    const d = dateParam ? new Date(dateParam) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Mapea el modelo del backend al modelo del frontend
const mapSaleToFrontend = (sale) => {
    return {
        id: sale._id,
        // Extrae solo los números del numeroFactura, eliminando prefijos como "FAC"
        numeroVenta: String(sale.numeroFactura || "").replace(/\D/g, ""),
        numeroDocumento: sale.clienteId?.documentNumber ? `${abbreviateDocType(sale.clienteId.documentType)} ${sale.clienteId.documentNumber}`.trim() : "N/A",
        cliente: sale.clienteId ? `${sale.clienteId.firstName} ${sale.clienteId.lastName}` : "Cliente Desconocido",
        //   FIX: normalizar tipoVenta a sin-tilde para comparaciones frontend simples
        tipoVenta: sale.tipoVenta === "Crédito" ? "Credito" : (sale.tipoVenta || "Contado"),
        diasPlazo: sale.diasPlazo,
        fecha: sale.fechaVenta || localDate(sale.fechaCreacion),
        fechaCreacion: sale.fechaCreacion,
        //   FIX: estado más preciso (Finalizado se calcula en paymentsService al enriquecer con pagos, pero para Contado es automático)
        estado: sale.estado === 'ACTIVA' ? (sale.tipoVenta === 'Contado' ? 'Finalizado' : 'Vigente') : (sale.estado === 'ANULADA' ? 'Anulado' : sale.estado),
        productos: (sale.productos || []).map(p => ({
            productoId: p.productoId?._id || p.productoId,
            nombre: p.productoId?.name || p.nombre || "Producto",
            precio: p.precioUnitario,
            cantidad: p.cantidad,
            garantia: p.productoId?.warranty || 0
        })),
        subtotal: sale.subtotal || sale.total,
        iva: sale.iva || 0,
        total: sale.total,
        // montoPagado y montoPorPagar los enriquece paymentsService al consultar /payments/venta/:id para ventas a Crédito.
        // Para Contado, se pagan inmediatamente al crear la venta.
        montoPagado: sale.tipoVenta === 'Contado' ? sale.total : (sale.montoPagado || 0),
        montoPorPagar: sale.tipoVenta === 'Contado' ? 0 : (sale.montoPorPagar ?? sale.total),
        montoContado: sale.montoContado || 0,
        montoCredito: sale.montoCredito || 0,
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

    async create({ numeroDocumento, tipoVenta, diasPlazo, fecha, estado, productos, subtotal, iva, total, montoPagado, montoPorPagar, montoCredito, montoContado }) {
        try {
            const allSalesRes = await api.get('/sales');
            const allSalesData = allSalesRes.data.data || allSalesRes.data;
            const count = Array.isArray(allSalesData) ? allSalesData.length + 1 : 1;
            const numeroFactura = String(count).padStart(2, '0');

            const payload = {
                numeroFactura,
                clienteId: numeroDocumento, // ObjectId del cliente
                //   FIX: el backend solo acepta "Crédito" (con tilde) en el enum
                tipoVenta: tipoVenta === "Credito" ? "Crédito" : (tipoVenta || "Contado"),
                diasPlazo: diasPlazo != null ? Number(diasPlazo) : null,
                productos: productos.map(p => ({
                    productoId: p.productoId || p.id || p.idProducto,
                    cantidad: p.cantidad,
                    precioUnitario: p.precio
                })),
                fechaVenta: fecha,
                montoPagado: montoPagado != null ? Number(montoPagado) : (tipoVenta === "Contado" ? total : 0),
                montoPorPagar: montoPorPagar != null ? Number(montoPorPagar) : (tipoVenta === "Contado" ? 0 : total),
                montoCredito: montoCredito != null ? Number(montoCredito) : ((tipoVenta === "Credito" || tipoVenta === "Crédito") ? total : 0),
                montoContado: montoContado != null ? Number(montoContado) : (tipoVenta === "Contado" ? total : 0)
            };

            const response = await api.post('/sales', payload);
            const newSale = response.data.data || response.data;
            const mappedSale = mapSaleToFrontend(newSale);

            //   FIX: Registrar el pago inicial si la venta es de Contado o Mixta
            const pagoInicial = (tipoVenta === 'Contado' || tipoVenta === "Contado")
                ? mappedSale.total
                : (tipoVenta === 'Mixto' || tipoVenta === "Mixto")
                    ? Number(montoPagado || mappedSale.montoContado || 0)
                    : 0;

            if (pagoInicial > 0) {
                try {
                    await api.post('/payments', {
                        ventaId: mappedSale.id,
                        monto: pagoInicial,
                        metodoPago: "EFECTIVO",
                        notas: (tipoVenta === 'Contado' || tipoVenta === "Contado")
                            ? "Pago automático de contado"
                            : "Pago inicial en efectivo (Venta Mixta)"
                    });
                } catch (paymentErr) {
                    console.warn("[SalesService] Venta creada pero el pago inicial falló:", paymentErr?.response?.data || paymentErr.message);
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