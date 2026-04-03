const KEY = "providers";

export const ServicesProviders = {

    // OBTENER PROVEEDORES
    get() {
        const data = localStorage.getItem(KEY);
        const providers = data ? JSON.parse(data) : [];
        return providers.sort((a, b) => b.id - a.id);
    },

    // VALIDACION PARA NO CREAR PROVEEDOR CON DOCUMENTO EXISTENTE
    existsByDocumento(documento, idActual = null) {
        const providers = this.get();

        return providers.some(p =>
            p.documento === documento && p.id !== idActual
        );
    },

    // CREAR UN PROVEEDOR
    create({ tipoDoc, documento, nombreProveedor, nombreContacto, telefonoContacto, categoriasAsociadas }) {

        const proveedores = this.get();

        const nuevoProveedor = {
            id: Date.now(),
            tipoDoc,
            documento,
            nombreProveedor,
            nombreContacto,
            telefonoContacto,
            categoriasAsociadas,
            estado: true
        };

        const nuevosProveedores = [...proveedores, nuevoProveedor];

        localStorage.setItem(KEY, JSON.stringify(nuevosProveedores));

        return nuevoProveedor;
    },

    // MODIFICAR UN PROVEEDOR
    update(proveedorActualizado) {

        const proveedores = this.get();

        const nuevosProveedores = proveedores.map(cat => cat.id === proveedorActualizado.id ? proveedorActualizado : cat);

        localStorage.setItem(KEY, JSON.stringify(nuevosProveedores));

        return nuevosProveedores;
    },

    // ELIMINAR UN PROVEEDOR
    delete(id) {

        const data = JSON.parse(localStorage.getItem(KEY)) || [];

        const newData = data.filter(cat => cat.id !== id);

        localStorage.setItem(KEY, JSON.stringify(newData));

        return newData;
    },

    // CAMBIAR EL ESTADO DE UN PROVEEDOR
    toggleEstado(id) {

        const proveedores = this.get();

        const nuevosProveedores = proveedores.map(cat =>
            cat.id === id
                ? { ...cat, estado: !cat.estado }
                : cat
        );

        localStorage.setItem(KEY, JSON.stringify(nuevosProveedores));

        return nuevosProveedores;
    },
}