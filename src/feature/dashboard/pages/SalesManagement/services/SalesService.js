import api from "../../../../../utils/api.js";

const abbreviateDocType = (type) => {
    if (!type) return "";
    const t = type.toLowerCase();
    if (t.includes("ciudadan")) return "CC";
    if (t.includes("extranjer")) return "CE";
    if (t.includes("identidad")) return "TI";
    if (t.includes("pasaporte")) return "PA";
    if (type.length === 24 && /^[a-fA-F0-9]{24}$/.test(type)) return "";
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
    const tipoVenta = sale.tipoVenta || "Contado";
    const saldo = Number(sale.montoPorPagar ?? sale.total ?? 0);
    const estadoNormalizado = sale.estado === "ANULADA" ? "Anulado" : sale.estado;
    const estado = estadoNormalizado === "Anulado"
        ? "Anulado"
        : tipoVenta === "Contado" || saldo <= 0
            ? "Finalizado"
            : "Vigente";

    return {
        id: sale._id,
        // Extrae solo los números del numeroFactura, eliminando prefijos como "FAC"
        numeroVenta: String(sale.numeroFactura || "").replace(/\D/g, ""),
        numeroDocumento: sale.clienteId?.documentNumber ? `${abbreviateDocType(sale.clienteId.documentType?.name || sale.clienteId.documentType)} ${sale.clienteId.documentNumber}`.trim() : "N/A",
        // NUEVO: número de documento sin el tipo (CC/CE/TI...), para usar en navegación
        // y lookups del módulo de Pagos, donde solo se necesita el número puro.
        documentoNumero: sale.clienteId?.documentNumber || "",
        cliente: sale.clienteId ? `${sale.clienteId.firstName} ${sale.clienteId.lastName}` : "Cliente Desconocido",
        clienteId: sale.clienteId,
        //   FIX: normalizar tipoVenta a sin-tilde para comparaciones frontend simples
        tipoVenta: tipoVenta === "Crédito" ? "Credito" : tipoVenta,
        diasPlazo: sale.diasPlazo,
        fecha: sale.fechaVenta || localDate(sale.fechaCreacion),
        fechaCreacion: sale.fechaCreacion,
        //   FIX: estado más preciso (Finalizado se calcula en paymentsService al enriquecer con pagos, pero para Contado es automático)
        estado,
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

            const payload = {
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

            return mappedSale;
        } catch (error) {
            console.error("Error creating sale via API:", error);
            throw error;
        }
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