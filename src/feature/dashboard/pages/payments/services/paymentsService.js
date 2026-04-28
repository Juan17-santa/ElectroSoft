import { SalesService } from "../../../../../feature/dashboard/pages/SalesManagement/services/SalesService";
import { ServicesOrders } from "../../../../../feature/dashboard/pages/orders/services/ServicesOrders";
import { ClientsService } from "../../../../../feature/dashboard/pages/Clients/services/ClientsService";

const getClientName = (documento, clienteId) => {
    try {
        const clients = ClientsService.get();
        const found = documento
            ? clients.find(c => c.documento === String(documento))
            : clients.find(c => c.id === Number(clienteId));
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
    estado === "Anulada" || estado === "Anulado";

const esPendiente = (estado) =>
    estado === "Vigente" || esAnulada(estado);

const paymentsService = {

    // ✅ Cupos separados de ClientsService — nunca los pisa
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

    checkAndExpireOverdue() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = SalesService.get().map(s =>
            esCredito(s.tipoVenta) ? enriquecerVenta(s) : s
        );

        sales.forEach(sale => {
            if (
                esCredito(sale.tipoVenta) &&
                sale.estado === "Vigente" &&
                sale.fechaLimite
            ) {
                const fechaLimite = new Date(sale.fechaLimite);
                fechaLimite.setHours(0, 0, 0, 0);
                if (fechaLimite < today) {
                    SalesService.update({ ...sale, estado: "Anulado" });
                    try {
                        const clients = ClientsService.get();
                        const client = clients.find(c => c.documento === String(sale.numeroDocumento));
                        if (client && client.estado !== false) {
                            ClientsService.update({ ...client, estado: false });
                        }
                    } catch (e) {
                        console.error("Error suspendiendo cliente:", e);
                    }
                }
            }
        });
    },

    getPending() {
        const ventas = SalesService.get()
            .filter(s =>
                esCredito(s.tipoVenta) &&
                esPendiente(s.estado)
            )
            .map(s => {
                const totalAbonado = (s.abonos || [])
                    .filter(a => !a.anulado)
                    .reduce((acc, a) => acc + Number(a.monto), 0);
                const montoPorPagar = s.total - totalAbonado;
                return enriquecerVenta({
                    ...s,
                    fuente: "venta",
                    cliente: s.cliente || getClientName(s.numeroDocumento, null),
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                });
            })
            .filter(s => s.montoPorPagar > 0);

        const pedidos = ServicesOrders.get()
            .filter(o =>
                esCredito(o.formaPago) &&
                o.estado === "Pendiente"
            )
            .map(o => {
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
                    cliente: getClientName(o.documento, o.clienteId),
                    tipoVenta: o.formaPago,
                    fecha: o.fechaPedido,
                    fechaLimite: o.fechaVencimiento,
                    estado: "Vigente",
                    total,
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    abonos: o.abonos || [],
                });
            })
            .filter(o => o.montoPorPagar > 0);

        return [...ventas, ...pedidos];
    },

    getById(id) {
        const venta = SalesService.getById(Number(id));
        if (venta) return enriquecerVenta(venta);

        const pedido = ServicesOrders.get().find(o => o.id === Number(id));
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
            cliente: getClientName(pedido.documento, pedido.clienteId),
            fecha: pedido.fechaPedido,
            fechaLimite: pedido.fechaVencimiento,
            estado: "Vigente",
            total,
            montoPagado: totalAbonado,
            montoPorPagar: total - totalAbonado > 0 ? total - totalAbonado : 0,
            abonos: pedido.abonos || [],
        });
    },

    createAbono(documento, ventaId, { paymentMethod, amount }) {
        const nuevoAbono = {
            fecha: new Date().toISOString().split("T")[0],
            monto: Number(amount),
            metodoPago: paymentMethod,
            anulado: false,
        };

        const sales = SalesService.get();
        const sale = sales.find(s => s.id === Number(ventaId));

        if (sale) {
            const abonos = [...(sale.abonos || []), nuevoAbono];
            const totalAbonado = abonos
                .filter(a => !a.anulado)
                .reduce((acc, a) => acc + Number(a.monto), 0);
            const montoPorPagar = sale.total - totalAbonado;
            const saldado = montoPorPagar <= 0;

            const ventaEnriquecida = enriquecerVenta(sale);
            const ventaActualizada = {
                ...ventaEnriquecida,
                abonos,
                montoPagado: totalAbonado,
                montoPorPagar: saldado ? 0 : montoPorPagar,
                estado: saldado ? "Finalizado" : sale.estado,
            };

            SalesService.update(ventaActualizada);
            window.dispatchEvent(new Event("payments-updated"));

            if (saldado) {
                try {
                    const clients = ClientsService.get();
                    const client = clients.find(c => c.documento === String(sale.numeroDocumento));
                    if (client && client.estado === false) {
                        ClientsService.update({ ...client, estado: true });
                    }
                } catch (e) {
                    console.error("Error reactivando cliente:", e);
                }
            }

            return ventaActualizada;
        }

        const orders = ServicesOrders.get();
        const order = orders.find(o => o.id === Number(ventaId));

        if (order) {
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
                o.id === Number(ventaId) ? pedidoActualizado : o
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

    isClienteSuspendido(documento) {
        try {
            const clients = ClientsService.get();
            const client = clients.find(c => c.documento === String(documento));
            return client ? client.estado === false : false;
        } catch {
            return false;
        }
    },

    getClientesConCupo() {
    const clients = JSON.parse(localStorage.getItem("clients") || "[]");
    return clients
        .filter(c => c.cupoActivo === true && c.cupoTotal && c.cupoTotal > 0)
        .map(c => {
            const resumen = this.getResumenCliente(c.documento);
            return {
                ...resumen,
                ventas: this.getVentasCredito(c.documento), // ✅ incluye ventas para el reporte
            };
        });
},

    getResumenCliente(documento) {
        // ✅ Lee raw directo — evita el bug de ClientsService.get()
        const clients = JSON.parse(localStorage.getItem("clients") || "[]");
        const client = clients.find(c => c.documento === String(documento));
        if (!client) return null;

        const cupoCredito = client.cupoTotal || 0;
        const ventasCredito = this.getVentasCredito(documento);
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
    actualizarCupo(documento, nuevoCupo) {
        const clients = JSON.parse(localStorage.getItem("clients") || "[]");
        const client = clients.find(c => c.documento === String(documento));
        if (!client) return false;

        const clientActualizado = {
            ...client,
            cupoActivo: true,
            cupoTotal: Number(nuevoCupo),
        };

        const nuevosClients = clients.map(c =>
            c.documento === String(documento) ? clientActualizado : c
        );

        localStorage.setItem("clients", JSON.stringify(nuevosClients));
        window.dispatchEvent(new Event("payments-updated"));
        return true;
    },

    getVentasCredito(documento) {
        const ventas = SalesService.get()
            .filter(s =>
                String(s.numeroDocumento) === String(documento) &&
                esCredito(s.tipoVenta) &&
                esPendiente(s.estado)
            )
            .map(s => {
                const totalAbonado = (s.abonos || [])
                    .filter(a => !a.anulado)
                    .reduce((acc, a) => acc + Number(a.monto), 0);
                const montoPorPagar = s.total - totalAbonado;
                return enriquecerVenta({
                    ...s,
                    fuente: "venta",
                    cliente: s.cliente || getClientName(s.numeroDocumento, null),
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                });
            })
            .filter(s => s.montoPorPagar > 0);

        const pedidos = ServicesOrders.get()
            .filter(o =>
                String(o.documento) === String(documento) &&
                esCredito(o.formaPago) &&
                o.estado === "Pendiente"
            )
            .map(o => {
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
                    cliente: getClientName(o.documento, o.clienteId),
                    tipoVenta: o.formaPago,
                    fecha: o.fechaPedido,
                    fechaLimite: o.fechaVencimiento,
                    estado: "Vigente",
                    total,
                    montoPagado: totalAbonado,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                    abonos: o.abonos || [],
                });
            })
            .filter(o => o.montoPorPagar > 0);

        return [...ventas, ...pedidos];
    },

    anularUltimoAbono(ventaId) {
        const sales = SalesService.get();
        const sale = sales.find(s => s.id === Number(ventaId));

        if (sale) {
            const abonos = [...(sale.abonos || [])];
            if (abonos.length === 0) return null;

            const ultimoIndex = abonos.length - 1;
            if (abonos[ultimoIndex].anulado) return null;

            abonos[ultimoIndex] = { ...abonos[ultimoIndex], anulado: true };

            const totalAbonado = abonos
                .filter(a => !a.anulado)
                .reduce((acc, a) => acc + Number(a.monto), 0);
            const montoPorPagar = sale.total - totalAbonado;

            const ventaActualizada = {
                ...sale,
                abonos,
                montoPagado: totalAbonado,
                montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                estado: montoPorPagar > 0
                    ? (esAnulada(sale.estado) ? sale.estado : "Vigente")
                    : "Finalizado",
            };

            SalesService.update(ventaActualizada);
            window.dispatchEvent(new Event("payments-updated"));
            return ventaActualizada;
        }

        const orders = ServicesOrders.get();
        const order = orders.find(o => o.id === Number(ventaId));

        if (order) {
            const abonos = [...(order.abonos || [])];
            if (abonos.length === 0) return null;

            const ultimoIndex = abonos.length - 1;
            if (abonos[ultimoIndex].anulado) return null;

            abonos[ultimoIndex] = { ...abonos[ultimoIndex], anulado: true };

            const subtotal = (order.productos || []).reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
            const total = subtotal * 1.19;
            const totalAbonado = abonos
                .filter(a => !a.anulado)
                .reduce((acc, a) => acc + Number(a.monto), 0);
            const montoPorPagar = total - totalAbonado;

            const pedidoActualizado = {
                ...order,
                abonos,
                montoPagado: totalAbonado,
                montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                estado: montoPorPagar > 0 ? "Pendiente" : "Finalizado",
            };

            const ordersActualizados = orders.map(o =>
                o.id === Number(ventaId) ? pedidoActualizado : o
            );
            localStorage.setItem("orders", JSON.stringify(ordersActualizados));
            window.dispatchEvent(new Event("payments-updated"));
            return pedidoActualizado;
        }

        return null;
    },
};

export default paymentsService;