import { SalesService } from "../../../../../feature/dashboard/pages/SalesManagement/services/SalesService";
import { ServicesOrders } from "../../../../../feature/dashboard/pages/orders/services/ServicesOrders";
import { ClientsService } from "../../../../../feature/dashboard/pages/Clients/services/ClientsService";
import api from "../../../../../utils/api.js";

// ✅ Cache de clientes para evitar N llamadas a GET /clients por cada venta
let _clientsCache = null;
let _clientsCacheTime = 0;
const CLIENTS_CACHE_TTL = 30_000; // 30 segundos

const getCachedClients = async () => {
    const now = Date.now();
    if (_clientsCache && (now - _clientsCacheTime) < CLIENTS_CACHE_TTL) {
        return _clientsCache;
    }
    _clientsCache = await ClientsService.get();
    _clientsCacheTime = now;
    return _clientsCache;
};

// Invalida el cache al registrar pagos o actualizar cupos
const invalidateClientsCache = () => {
    _clientsCache = null;
    _clientsCacheTime = 0;
};

const getClientName = async (documento, clienteId) => {
    try {
        const clients = await getCachedClients();
        const found = documento
            ? clients.find(c => c.documento === String(documento))
            : clients.find(c => String(c.id) === String(clienteId));
        if (!found) return "Sin nombre";
        return `${found.nombres} ${found.apellidos}`;
    } catch {
        return "Sin nombre";
    }
};


const calcularFechaLimite = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    d.setDate(d.getDate() + 60);
    return d.toISOString().split("T")[0];
};

const enriquecerVenta = (venta) => {
    if (venta.fechaLimite) return venta;
    return {
        ...venta,
        fechaLimite: calcularFechaLimite(venta.fecha),
    };
};

const esCredito = (tipoVenta) =>
    tipoVenta === "Crédito" || tipoVenta === "Credito";

const esAnulada = (estado) =>
    estado === "Anulada" || estado === "Anulado" || estado === "ANULADA";

// ✅ FIX: Las ventas ANULADAS no deben aparecer en pagos pendientes
const esPendiente = (estado) =>
    estado === "Vigente" || estado === "ACTIVA" || estado === "Pendiente";

// ✅ Helper: parsea la respuesta de /payments/venta/:id correctamente.
// El backend devuelve { venta, totalPagado, saldoPendiente, estadoPago, pagos: [] }
// NO devuelve directamente un array.
const parsePagosResponse = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.pagos)) return responseData.pagos;
    return [];
};

const paymentsService = {

    getCupos() {
        try {
            return JSON.parse(localStorage.getItem("cupos") || "{}");
        } catch { return {}; }
    },

    getCupo(documento) {
        return this.getCupos()[String(documento)] || 0;
    },

    setCupo(documento, monto) {
        const cupos = this.getCupos();
        cupos[String(documento)] = monto;
        localStorage.setItem("cupos", JSON.stringify(cupos));
        window.dispatchEvent(new Event("payments-updated"));
    },

    async checkAndExpireOverdue() {
        // Backend doesn't have overdue status logic yet, skip for now
    },

    async getPending() {
        // Get sales from backend
        let sales = [];
        try {
            sales = await SalesService.get();
        } catch (error) {
            console.error("Error fetching sales for payments:", error);
        }

        // We must fetch payments for each sale to know saldoPendiente
        // Alternatively, the backend could aggregate it, but since it doesn't, we will fetch payments
        const ventasPromises = sales
            .filter(s => esCredito(s.tipoVenta) && esPendiente(s.estado))
            .map(async s => {
                let abonos = [];
                try {
                    const payRes = await api.get(`/payments/venta/${s.id}`);
                    // ✅ FIX: el backend devuelve { pagos: [], totalPagado, ... } no un array directo
                    const pagosRaw = parsePagosResponse(payRes.data.data || payRes.data);
                    abonos = pagosRaw.map(p => ({
                        id: p._id,
                        fecha: new Date(p.fechaPago).toISOString().split('T')[0],
                        monto: p.monto,
                        metodoPago: p.metodoPago,
                        anulado: p.estado === 'ANULADO' || false
                    }));
                } catch (e) {
                    console.error(`Error fetching payments for sale ${s.id}:`, e);
                }

                const totalAbonado = abonos
                    .filter(a => !a.anulado)
                    .reduce((acc, a) => acc + Number(a.monto), 0);
                const montoPorPagar = s.total - totalAbonado;
                // ✅ FIX: calcular estado Finalizado cuando ya está pagado
                const estadoFinal = montoPorPagar <= 0 ? "Finalizado" : s.estado;

                return enriquecerVenta({
                    ...s,
                    fuente: "venta",
                    cliente: s.cliente || await getClientName(s.numeroDocumento, null),
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    estado: estadoFinal,
                    abonos
                });
            });

        const ventas = (await Promise.all(ventasPromises)).filter(s => s.montoPorPagar > 0);

        // Orders are from backend now
        let allOrders = [];
        try {
            allOrders = await ServicesOrders.getAllOrders();
        } catch(e) { console.error("Error fetching orders:", e); }

        const pedidos = allOrders
            .filter(o =>
                esCredito(o.formaPago) &&
                o.estado === "Pendiente"
            )
            .map(async o => {
                const subtotal = (o.productos || []).reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
                const total = subtotal * 1.19;
                const totalAbonado = (o.abonos || [])
                    .filter(a => !a.anulado)
                    .reduce((acc, a) => acc + Number(a.monto), 0);
                const montoPorPagar = total - totalAbonado;
                return enriquecerVenta({
                    id: o.id,
                    fuente: "pedido",
                    numeroVenta: `P-${o.id}`,
                    numeroDocumento: o.documento,
                    cliente: await getClientName(o.documento, o.clienteId),
                    tipoVenta: o.formaPago,
                    fecha: o.fechaPedido,
                    fechaLimite: o.fechaVencimiento,
                    estado: "Vigente",
                    total,
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    abonos: o.abonos || [],
                });
            });

        const pedidosResolved = (await Promise.all(pedidos)).filter(o => o.montoPorPagar > 0);
        return [...ventas, ...pedidosResolved];
    },

    async getById(id) {
        let venta = null;
        try {
            venta = await SalesService.getById(id);
        } catch (e) {
            // Might be order id
        }

        if (venta) {
            let abonos = [];
            try {
                const payRes = await api.get(`/payments/venta/${venta.id}`);
                // ✅ FIX: parsear correctamente la respuesta del backend
                const pagosRaw = parsePagosResponse(payRes.data.data || payRes.data);
                abonos = pagosRaw.map(p => ({
                    id: p._id,
                    fecha: new Date(p.fechaPago).toISOString().split('T')[0],
                    monto: p.monto,
                    metodoPago: p.metodoPago,
                    anulado: p.estado === 'ANULADO' || false
                }));
            } catch (e) {
                console.error(`Error fetching abonos for sale ${venta.id}:`, e);
            }

            const totalAbonado = abonos.filter(a => !a.anulado).reduce((acc, a) => acc + Number(a.monto), 0);
            const montoPorPagar = venta.total - totalAbonado > 0 ? venta.total - totalAbonado : 0;
            const estadoFinal = montoPorPagar <= 0 ? "Finalizado" : venta.estado;
            return enriquecerVenta({
                ...venta,
                montoPagado: totalAbonado,
                montoPorPagar,
                estado: estadoFinal,
                abonos
            });
        }

        let allOrders = [];
        try {
            allOrders = await ServicesOrders.getAllOrders();
        } catch(e) { console.error("Error fetching orders:", e); }

        const pedido = allOrders.find(o => o.id === Number(id) || String(o.id) === String(id) || String(o._id) === String(id));
        if (!pedido) return null;

        const subtotal = (pedido.productos || []).reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
        const total = subtotal * 1.19;
        const totalAbonado = (pedido.abonos || [])
            .filter(a => !a.anulado)
            .reduce((acc, a) => acc + Number(a.monto), 0);

        return enriquecerVenta({
            id: pedido.id,
            fuente: "pedido",
            numeroVenta: `P-${pedido.id}`,
            numeroDocumento: pedido.documento,
            cliente: await getClientName(pedido.documento, pedido.clienteId),
            fecha: pedido.fechaPedido,
            fechaLimite: pedido.fechaVencimiento,
            estado: "Vigente",
            total,
            montoPagado: totalAbonado,
            montoPorPagar: total - totalAbonado > 0 ? total - totalAbonado : 0,
            abonos: pedido.abonos || [],
        });
    },

    async createAbono(documento, ventaId, { paymentMethod, amount }) {
        let isSale = false;
        try {
            const sale = await SalesService.getById(ventaId);
            if (sale) isSale = true;
        } catch (e) {
            // No es una venta
        }

        if (isSale) {
            let mappedMethod = paymentMethod.toUpperCase();
            if (mappedMethod.includes("TARJETA")) mappedMethod = "TARJETA";
            if (mappedMethod === "CHEQUE") mappedMethod = "TRANSFERENCIA"; // Fallback to avoid crash

            // Sabemos que es una venta real, enviamos al backend y PROPAGAMOS errores
            const paymentRes = await api.post('/payments', {
                ventaId,
                monto: Number(amount),
                metodoPago: mappedMethod,
                notas: "Pago de crédito"
            });
            window.dispatchEvent(new Event("payments-updated"));
            return paymentRes.data.data || paymentRes.data;
        }

        let orders = [];
        try {
            orders = await ServicesOrders.getAllOrders();
        } catch(e) { console.error("Error fetching orders:", e); }
        const order = orders.find(o => String(o.id) === String(ventaId) || String(o._id) === String(ventaId));

        if (order) {
            const nuevoAbono = {
                id: Date.now(),
                fecha: new Date().toISOString().split("T")[0],
                monto: Number(amount),
                metodoPago: paymentMethod,
                anulado: false,
            };

            const abonos = [...(order.abonos || []), nuevoAbono];
            const subtotal = (order.productos || []).reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
            const total = subtotal * 1.19;
            const totalAbonado = abonos
                .filter(a => !a.anulado)
                .reduce((acc, a) => acc + Number(a.monto), 0);
            const montoPorPagar = total - totalAbonado;
            const saldado = montoPorPagar <= 0;

            const pedidoActualizado = {
                ...order,
                abonos,
                montoPagado: totalAbonado,
                montoPorPagar: saldado ? 0 : montoPorPagar,
                estado: saldado ? "Finalizado" : "Pendiente",
            };

            const ordersActualizados = orders.map(o =>
                String(o.id) === String(ventaId) ? pedidoActualizado : o
            );
            localStorage.setItem("orders", JSON.stringify(ordersActualizados));
            window.dispatchEvent(new Event("payments-updated"));

            return pedidoActualizado;
        }

        return null;
    },

    buildAbonosTable(venta) {
        if (!venta) return [];

        const rows = [{
            fecha: venta.fecha,
            abono: 0,
            saldoPendiente: venta.total,
            tipo: "inicio",
        }];

        let saldo = venta.total;

        (venta.abonos || []).forEach((abono, i, arr) => {
            if (!abono.anulado) saldo -= Number(abono.monto);
            const esUltimo = i === arr.length - 1 && saldo <= 0 && !abono.anulado;
            rows.push({
                fecha: abono.fecha,
                abono: -Number(abono.monto),
                saldoPendiente: Math.max(saldo, 0),
                metodoPago: abono.metodoPago,
                tipo: abono.anulado ? "anulado" : esUltimo ? "ultimo" : "abono",
                esUltimoReal: i === arr.length - 1,
                anulado: abono.anulado || false,
            });
        });

        return rows;
    },

    formatCurrency(value) {
        return new Intl.NumberFormat("es-CO").format(value ?? 0);
    },

    async isClienteSuspendido(documento) {
        try {
            const clients = await ClientsService.get();
            const client = clients.find(c => c.documento === String(documento));
            return client ? client.estado === false : false;
        } catch {
            return false;
        }
    },

    // Obtiene clientes del backend y filtra los que tienen cupo activo
    async getClientesConCupo() {
        const clients = await getCachedClients();
        const filtered = clients.filter(c => c.cupoActivo === true && c.cupoTotal > 0);

        const promises = filtered.map(async c => {
            const ventasCredito = await this.getVentasCredito(c.documento);
            const cupoOcupado = ventasCredito.reduce((acc, v) => acc + v.montoPorPagar, 0);
            return {
                id: c.id,
                documento: c.documento,
                tipoDocumento: c.tipoDocumento,
                nombres: c.nombres,
                apellidos: c.apellidos,
                email: c.email,
                telefono: c.telefono,
                estado: c.estado,
                cupoCredito: c.cupoTotal,
                cupoOcupado,
                cupoDisponible: Math.max(c.cupoTotal - cupoOcupado, 0),
                totalVentas: ventasCredito.length,
                ventas: ventasCredito,
            };
        });

        return Promise.all(promises);
    },

    async getResumenCliente(documento) {
        const clients = await getCachedClients();
        const client = clients.find(c => c.documento === String(documento));
        if (!client) return null;

        const cupoCredito = client.cupoTotal || 0;
        const ventasCredito = await this.getVentasCredito(documento);
        const cupoOcupado = ventasCredito.reduce((acc, v) => acc + v.montoPorPagar, 0);
        const cupoDisponible = Math.max(cupoCredito - cupoOcupado, 0);

        return {
            id: client.id,
            documento: client.documento,
            tipoDocumento: client.tipoDocumento,
            nombres: client.nombres,
            apellidos: client.apellidos,
            email: client.email,
            telefono: client.telefono,
            estado: client.estado,
            cupoCredito,
            cupoOcupado,
            cupoDisponible,
            totalVentas: ventasCredito.length,
        };
    },

    // Actualiza el cupo de crédito de un cliente en el backend
    async actualizarCupo(clienteId, nuevoCupo) {
        try {
            await ClientsService.updateCupo(clienteId, {
                cupoTotal: Number(nuevoCupo),
                cupoActivo: true
            });
            invalidateClientsCache(); // ✅ Invalidar cache para que la próxima carga sea fresca
            window.dispatchEvent(new Event("payments-updated"));
            return true;
        } catch (e) {
            console.error("Error actualizando cupo:", e);
            return false;
        }
    },

    async getVentasCredito(documento) {
        const pendingSales = await this.getPending();
        return pendingSales.filter(s => String(s.numeroDocumento) === String(documento));
    },

    // Anula el último abono activo de una venta usando el backend
    async anularUltimoAbono(ventaId) {
        try {
            const payRes = await api.get(`/payments/venta/${ventaId}`);
            // ✅ FIX: parsear correctamente — el backend devuelve { pagos: [] }
            const pagosRaw = parsePagosResponse(payRes.data.data || payRes.data);
            const pagos = pagosRaw
                .filter(p => p.estado !== 'ANULADO')
                .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

            if (pagos.length === 0) {
                throw new Error("No hay pagos activos para anular");
            }

            const ultimoPago = pagos[0];
            await api.patch(`/payments/${ultimoPago._id}/cancel`);

            // Recalcular y retornar el estado de la venta con abonos actualizados
            return await this.getById(ventaId);
        } catch (e) {
            console.error("Error anulando abono:", e);
            throw e;
        }
    },
};

export default paymentsService;