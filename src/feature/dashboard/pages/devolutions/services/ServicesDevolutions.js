const KEY = "devolutions";

export const ServicesDevolutions = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    getById(id) {
        return this.get().find((d) => String(d.id) === String(id)) || null;
    },

    /** Todas las devoluciones asociadas a una venta */
    getByIdVenta(idVenta) {
        return this.get().filter((d) => String(d.idVenta) === String(idVenta));
    },

    /** Productos ya devueltos para una venta (nombres) */
    getProductosDevueltosByVenta(idVenta) {
        return this.getByIdVenta(idVenta).map((d) => d.producto);
    },

    create(devolution) {
        const all = this.get();
        const hoy  = new Date().toISOString().split("T")[0];
        const ahora = new Date().toISOString();
        const nueva = {
            id:                 Date.now(),
            idVenta:            devolution.idVenta            ?? "",
            motivo:             devolution.motivo             ?? "",
            submotivo:          devolution.submotivo          ?? "",
            producto:           devolution.producto           ?? "",
            cantidad:           devolution.cantidad           ?? "",
            condicionProducto:  devolution.condicionProducto  ?? "",
            gestion:            devolution.gestion            ?? "",
            responsable:        devolution.responsable        ?? "",
            garantiaProveedor:  devolution.garantiaProveedor  ?? false,
            descripcion:        devolution.descripcion        ?? "",
            observaciones:      devolution.observaciones      ?? "",
            fecha:              devolution.fecha              ?? "",
            fechaISO:           devolution.fechaISO           ?? hoy,
            fechaEstado:        hoy,
            estadoResolucion:   devolution.estadoResolucion   ?? "",
            creadoEn:           ahora,
            actualizadoEn:      ahora,   // timestamp completo para ordenar por edición
        };
        localStorage.setItem(KEY, JSON.stringify([...all, nueva]));
        return nueva;
    },

    update(devolucionActualizada) {
        const hoy   = new Date().toISOString().split("T")[0];
        const ahora = new Date().toISOString();
        const updated = this.get().map((d) =>
            String(d.id) === String(devolucionActualizada.id)
                ? { ...d, ...devolucionActualizada, fechaEstado: hoy, actualizadoEn: ahora }
                : d
        );
        localStorage.setItem(KEY, JSON.stringify(updated));
        return devolucionActualizada;
    },

    delete(id) {
        const updated = this.get().filter((d) => String(d.id) !== String(id));
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },

    anular(id) {
        const updated = this.get().map((d) =>
            String(d.id) === String(id)
                ? { ...d, estadoResolucion: "Anulada" }
                : d
        );
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },

    /** Anula TODAS las devoluciones de una venta */
    anularByIdVenta(idVenta) {
        const updated = this.get().map((d) =>
            String(d.idVenta) === String(idVenta)
                ? { ...d, estadoResolucion: "Anulada" }
                : d
        );
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },
};