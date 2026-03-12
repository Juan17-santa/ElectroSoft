const KEY = "clients";

export const ClientsService = {

    get() {
        const data = localStorage.getItem(KEY);
        const clients = data ? JSON.parse(data) : [];

        try {
            const salesData = localStorage.getItem("sales");
            const sales = salesData ? JSON.parse(salesData) : [];

            return clients.map(client => {
                // Filtrar ventas de este cliente que no estén Anuladas ni Devueltas
                const clientSales = sales.filter(s =>
                    s.numeroDocumento === client.documento &&
                    s.estado !== "Anulado" &&
                    s.estado !== "Devuelto"
                );

                // Sumar los totales
                const totalCalculado = clientSales.reduce((sum, sale) => sum + (sale.total || 0), 0);

                return {
                    ...client,
                    totalCompras: totalCalculado
                };
            });
        } catch (error) {
            console.error("Error calculando totalCompras:", error);
            return clients;
        }
    },

    create({ tipoDocumento, documento, nombres, apellidos, email, telefono }) {

        const clients = this.get();

        const nuevoClient = {
            id: Date.now(),
            tipoDocumento,
            documento,
            nombres,
            apellidos,
            email,
            telefono,
            totalCompras: 0,
            fechaCreacion: new Date().toISOString().split('T')[0],
            estado: true
        };

        const nuevosClients = [...clients, nuevoClient];

        localStorage.setItem(KEY, JSON.stringify(nuevosClients));

        return nuevoClient;
    },

    update(clientActualizado) {

        const clients = this.get();

        const nuevosClients = clients.map(client => client.id === clientActualizado.id ? clientActualizado : client);

        localStorage.setItem(KEY, JSON.stringify(nuevosClients));

        return nuevosClients;
    },

    delete(id) {

        const data = JSON.parse(localStorage.getItem(KEY)) || [];

        const newData = data.filter(client => client.id !== id);

        localStorage.setItem(KEY, JSON.stringify(newData));

        return newData;
    },

    toggleEstado(id) {

        const clients = this.get();

        const nuevosClients = clients.map(client =>
            client.id === id
                ? { ...client, estado: !client.estado }
                : client
        );

        localStorage.setItem(KEY, JSON.stringify(nuevosClients));

        return nuevosClients;
    },

    sumarCompra(documento, monto) {
        const clients = this.get();
        const nuevosClients = clients.map(client =>
            client.documento === documento
                ? { ...client, totalCompras: (client.totalCompras || 0) + monto }
                : client
        );
        localStorage.setItem(KEY, JSON.stringify(nuevosClients));
        return nuevosClients;
    },
}