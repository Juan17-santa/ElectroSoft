const KEY = "roles";

export const PERMISSION_SCOPES = [
    { name: "Categoria de productos", actions: ["Crear", "Editar", "Eliminar"] },
    { name: "Productos", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Ficha tecnica", actions: ["Ver", "Crear", "Eliminar"] },
    { name: "Compras", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Proveedores", actions: ["Crear", "Editar", "Eliminar"] },
    { name: "Ventas", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Clientes", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Pedidos", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Pagos y abonos", actions: ["Crear", "Editar", "Eliminar"] },
    { name: "Devoluciones", actions: ["Crear", "Editar", "Eliminar"] },
    { name: "Usuarios", actions: ["Ver", "Crear", "Editar", "Eliminar"] },
    { name: "Roles", actions: ["Crear", "Editar", "Eliminar"] }
];

export const RolesService = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Crea un nuevo rol
     * @param {object} param0 - { nombre, descripcion, permisos }
     * permisos es un objeto: { "Ventas": ["Crear", "Editar"], ... }
     */
    create({ nombre, descripcion, estado = true, permisos = {} }) {

        const roles = this.get();

        const nuevoRole = {
            id: Date.now(),
            nombre,
            descripcion,
            permisos,
            fechaCreacion: new Date().toLocaleDateString('es-CO'),
            estado
        };

        const nuevosRoles = [...roles, nuevoRole];

        localStorage.setItem(KEY, JSON.stringify(nuevosRoles));

        return nuevoRole;
    },

    update(roleActualizado) {

        const roles = this.get();

        const nuevosRoles = roles.map(role => role.id === roleActualizado.id ? roleActualizado : role);

        localStorage.setItem(KEY, JSON.stringify(nuevosRoles));

        return nuevosRoles;
    },

    delete(id) {

        const data = JSON.parse(localStorage.getItem(KEY)) || [];

        const newData = data.filter(role => role.id !== id);

        localStorage.setItem(KEY, JSON.stringify(newData));

        return newData;
    },

    toggleEstado(id) {

        const roles = this.get();

        const nuevosRoles = roles.map(role =>
            role.id === id
                ? { ...role, estado: !role.estado }
                : role
        );

        localStorage.setItem(KEY, JSON.stringify(nuevosRoles));

        return nuevosRoles;
    },
}