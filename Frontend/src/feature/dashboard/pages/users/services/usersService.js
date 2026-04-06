const KEY = "users";

export const usersService = {

    // OBTENER TODOS
    get() {
        const data = localStorage.getItem(KEY);
        let users = data ? JSON.parse(data) : [];

        // Si el local storage está vacío, creamos el admin global por defecto
        if (users.length === 0) {
            const defaultAdmin = {
                id: 1,
                nombre: "Administrador Global",
                email: "admin@gmail.com",
                password: "admin", // Contraseña por defecto
                rol: "Administrador",
                estado: true,
                documento: "000000000",
                telefono: "0000000000"
            };
            users.push(defaultAdmin);
            localStorage.setItem(KEY, JSON.stringify(users));
        }

        return users;
    },

    // GUARDAR
    save(users) {
        localStorage.setItem(KEY, JSON.stringify(users));
    },

    // CREAR
    create(user) {

        const users = this.get();

        // Validación básica
        if (!user.nombre || !user.email) {
            alert("Nombre y email son obligatorios");
            return users;
        }

        // Validar email duplicado
        const existe = users.some(u => u.email === user.email);
        if (existe) {
            alert("El email ya existe");
            return users;
        }

        const newUser = {
            ...user,
            id: Date.now(),
            estado: true,
            password: "123456"
        };

        const updated = [...users, newUser];

        this.save(updated);

        return updated; // 🔥 IMPORTANTE
    },

    // ACTUALIZAR
    update(userActualizado) {

        const users = this.get();

        const updated = users.map(u =>
            u.id === userActualizado.id
                ? { ...u, ...userActualizado }
                : u
        );

        this.save(updated);

        return updated;
    },

    // ELIMINAR
    delete(id) {

        const users = this.get();

        const updated = users.filter(u => u.id !== Number(id));

        this.save(updated);

        return updated;
    },

    // CAMBIAR ESTADO
    toggleEstado(id) {

        const users = this.get();

        const updated = users.map(u =>
            u.id === Number(id)
                ? { ...u, estado: !u.estado }
                : u
        );

        this.save(updated);

        return updated;
    },

    // OBTENER POR ID
    getById(id) {
        return this.get().find(u => u.id === Number(id));
    }
};