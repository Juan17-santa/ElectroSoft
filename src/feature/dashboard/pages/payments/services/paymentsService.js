const KEY = "sales";


const seedData = () => {

    const existing = localStorage.getItem(KEY);

    if (!existing) {

        const mockSales = [
            {
                id: 1,
                numeroVenta: "V-1001",
                fecha: "01/03/2026",
                fechaLimite: "01/04/2026",
                documentoCliente: "12345678",
                cliente: "Juan Pérez",
                total: 1000000,
                saldoPendiente: 600000,
                estado: true,
                abonos: [
                    {
                        id: 1,
                        date: "05/03/2026",
                        paymentMethod: "Efectivo",
                        amount: 400000
                    }
                ]
            },
            {
                id: 2,
                numeroVenta: "V-1002",
                fecha: "15/02/2026",
                fechaLimite: "15/03/2026",
                documentoCliente: "87654321",
                cliente: "María Gómez",
                total: 800000,
                saldoPendiente: 0,
                estado: false,
                abonos: [
                    {
                        id: 1,
                        date: "20/02/2026",
                        paymentMethod: "Transferencia",
                        amount: 800000
                    }
                ]
            },
            {
                id: 3,
                numeroVenta: "V-1003",
                fecha: "10/01/2026",
                fechaLimite: "10/02/2026",
                documentoCliente: "45678912",
                cliente: "Carlos Rodríguez",
                total: 500000,
                saldoPendiente: 500000,
                estado: true,
                abonos: []
            }
        ];

        localStorage.setItem(KEY, JSON.stringify(mockSales));
    }
};

const paymentsService = {


    // 🔹 Obtener todas las ventas
    // get() {
    //     return JSON.parse(localStorage.getItem(KEY)) || [];
    // },

    get() {
        seedData(); // 🔥 Asegura datos iniciales
        return JSON.parse(localStorage.getItem(KEY)) || [];
    },

    // 🔹 Guardar ventas
    save(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    },

    // 🔹 Obtener venta por ID
    getById(id) {
        return this.get().find(sale => sale.id === Number(id));
    },

    // 🔹 Obtener venta por documento
    getByDocument(document) {
        return this.get().find(
            sale => sale.documentoCliente === document
        );
    },

    // 🔹 Crear abono a una venta
    createAbono(document, abonoData) {

        const sales = this.get();

        const sale = sales.find(
            s => s.documentoCliente === document
        );

        if (!sale) return null;

        // Asegurar que exista el array
        if (!sale.abonos) {
            sale.abonos = [];
        }

        const newAbono = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            paymentMethod: abonoData.paymentMethod,
            amount: Number(abonoData.amount)
        };

        sale.abonos.push(newAbono);

        // 🔥 Recalcular saldo correctamente
        const totalAbonado = sale.abonos.reduce(
            (acc, a) => acc + Number(a.amount),
            0
        );

        sale.saldoPendiente = sale.total - totalAbonado;

        if (sale.saldoPendiente <= 0) {
            sale.saldoPendiente = 0;
            sale.estado = false; // Finalizado
        } else {
            sale.estado = true; // Pendiente
        }

        this.save(sales);

        return sale;
    }
};

export default paymentsService;