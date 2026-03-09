import { SalesService } from "../../../../../feature/dashboard/pages/SalesManagement/services/SalesService";

const paymentsService = {

    getPending() {
        return SalesService.get()
            .filter(s =>
                (s.tipoVenta === "Crédito" || s.tipoVenta === "Credito") &&
                s.estado === "Vigente"
            )
            .map(s => {
                // ✅ Calculamos montoPorPagar en tiempo real por si Sales no lo guarda
                const totalAbonado = (s.abonos || []).reduce((acc, a) => acc + Number(a.monto), 0);
                const montoPorPagar = s.total - totalAbonado;
                return {
                    ...s,
                    montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
                };
            })
            .filter(s => s.montoPorPagar > 0); // solo las que aún tienen saldo
    },

    getById(id) {
        return SalesService.getById(Number(id)) || null;
    },

    getByDocument(documento) {
        return SalesService.get().filter(s => s.numeroDocumento === documento);
    },

    createAbono(documento, ventaId, { paymentMethod, amount }) {
        const sales = SalesService.get();

        const sale = ventaId
            ? sales.find(s => s.id === Number(ventaId))
            : sales.find(s => s.numeroDocumento === documento);

        if (!sale) return null;

        const nuevoAbono = {
            fecha: new Date().toISOString().split("T")[0],
            monto: Number(amount),
            metodoPago: paymentMethod,
        };

        const abonos = [...(sale.abonos || []), nuevoAbono];
        const totalAbonado = abonos.reduce((acc, a) => acc + a.monto, 0);
        const montoPorPagar = sale.total - totalAbonado;

        const ventaActualizada = {
            ...sale,
            abonos,
            montoPagado: totalAbonado,
            montoPorPagar: montoPorPagar > 0 ? montoPorPagar : 0,
            estado: montoPorPagar <= 0 ? "Finalizado" : "Vigente",
        };

        SalesService.update(ventaActualizada);
        return ventaActualizada;
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
            saldo -= Number(abono.monto);
            const esUltimo = i === arr.length - 1 && saldo <= 0;
            rows.push({
                fecha: abono.fecha,
                abono: -Number(abono.monto),
                saldoPendiente: Math.max(saldo, 0),
                metodoPago: abono.metodoPago,
                tipo: esUltimo ? "ultimo" : "abono",
            });
        });

        return rows;
    },

    formatCurrency(value) {
        return new Intl.NumberFormat("es-CO").format(value ?? 0);
    },
};

export default paymentsService;