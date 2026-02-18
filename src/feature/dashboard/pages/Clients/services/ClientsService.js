const KEY = "clients";

export const ClientsService = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
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
}