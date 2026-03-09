// src/modules/payments/seedPayments.js
// ⚠️ SOLO PARA PRUEBAS — eliminar antes de producción

export const seedPayments = () => {

    const existing = JSON.parse(localStorage.getItem("sales")) || [];

    // Solo inserta si no hay datos previos
    if (existing.length > 0) return;

    const mockSales = [
        {
            id: 1,
            numeroVenta: "V-1001",
            numeroDocumento: "12345678",   // ✅ campo que usa SalesService
            cliente: "Juan Pérez",
            tipoVenta: "Credito",          // ✅ campo que filtra getPending()
            fecha: "2026-03-01",
            fechaLimite: "2026-04-01",
            estado: "Vigente",             // ✅ string, no booleano
            total: 1000000,
            montoPagado: 400000,
            montoPorPagar: 600000,         // ✅ campo que usa PaymentsService
            subtotal: 840336,
            iva: 159664,
            productos: [],
            abonos: [
                {
                    fecha: "2026-03-05",   // ✅ campo que usa SalesService
                    monto: 400000,         // ✅ monto no amount
                    metodoPago: "Efectivo" // ✅ metodoPago no paymentMethod
                }
            ]
        },
        {
            id: 2,
            numeroVenta: "V-1002",
            numeroDocumento: "87654321",
            cliente: "María Gómez",
            tipoVenta: "Credito",
            fecha: "2026-02-15",
            fechaLimite: "2026-03-15",
            estado: "Vigente",
            total: 800000,
            montoPagado: 0,
            montoPorPagar: 800000,
            subtotal: 672269,
            iva: 127731,
            productos: [],
            abonos: []                     // sin abonos aún
        },
        {
            id: 3,
            numeroVenta: "V-1003",
            numeroDocumento: "12345678",   // mismo documento que V-1001 (prueba múltiples ventas)
            cliente: "Juan Pérez",
            tipoVenta: "Credito",
            fecha: "2026-01-10",
            fechaLimite: "2026-02-10",
            estado: "Vigente",
            total: 500000,
            montoPagado: 200000,
            montoPorPagar: 300000,
            subtotal: 420168,
            iva: 79832,
            productos: [],
            abonos: [
                {
                    fecha: "2026-01-20",
                    monto: 200000,
                    metodoPago: "Transferencia"
                }
            ]
        },
        {
            id: 4,
            numeroVenta: "V-1004",
            numeroDocumento: "45678912",
            cliente: "Carlos Rodríguez",
            tipoVenta: "Credito",
            fecha: "2026-01-10",
            fechaLimite: "2026-02-10",
            estado: "Finalizado",          // esta NO debe aparecer en payments (ya pagada)
            total: 300000,
            montoPagado: 300000,
            montoPorPagar: 0,
            subtotal: 252101,
            iva: 47899,
            productos: [],
            abonos: [
                {
                    fecha: "2026-01-25",
                    monto: 300000,
                    metodoPago: "Tarjeta Débito"
                }
            ]
        }
    ];

    localStorage.setItem("sales", JSON.stringify(mockSales));
    console.log("✅ seedPayments: datos de prueba insertados en localStorage");
};