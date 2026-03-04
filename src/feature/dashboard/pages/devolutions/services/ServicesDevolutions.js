const KEY = "devolutions";

export const ServicesDevolutions = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    getById(id) {
        return this.get().find((d) => String(d.id) === String(id)) || null;
    },

    create(devolution) {
        const all = this.get();
        const nueva = {
            id:                 Date.now(),
            idVenta:            devolution.idVenta            ?? "",
            motivo:             devolution.motivo             ?? "",
            producto:           devolution.producto           ?? "",
            cantidad:           devolution.cantidad           ?? "",
            condicionProducto:  devolution.condicionProducto  ?? "",
            gestion:            devolution.gestion            ?? "",
            responsable:        devolution.responsable        ?? "",
            garantiaProveedor:  devolution.garantiaProveedor  ?? false,
            descripcion:        devolution.descripcion        ?? "",
            observaciones:      devolution.observaciones      ?? "",
            fecha:              devolution.fecha              ?? "",
            estadoResolucion:   devolution.estadoResolucion   ?? "",
            creadoEn:           new Date().toISOString(),
        };
        localStorage.setItem(KEY, JSON.stringify([...all, nueva]));
        return nueva;
    },

    update(devolucionActualizada) {
        const updated = this.get().map((d) =>
            String(d.id) === String(devolucionActualizada.id)
                ? { ...d, ...devolucionActualizada }
                : d
        );
        localStorage.setItem(KEY, JSON.stringify(updated));
        return devolucionActualizada;
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
};