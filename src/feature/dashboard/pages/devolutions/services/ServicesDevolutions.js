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

    /** Nombres de productos ya devueltos para una venta (incluyendo anuladas) */
    getProductosDevueltosByVenta(idVenta) {
        return this.getByIdVenta(idVenta).map((d) => d.producto);
    },

    /**
     * Cantidad total YA devuelta para un producto en una venta (sin contar anuladas).
     * Usado para saber cuánto queda disponible para seguir devolviendo.
     */
    getCantidadDevuelta(idVenta, productoNombre) {
        return this.getByIdVenta(idVenta)
            .filter((d) => d.estadoResolucion !== "Anulada" && d.producto === productoNombre)
            .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
    },

    /**
     * Igual que getCantidadDevuelta pero excluye una devolución concreta.
     * Útil en edición para no contar la propia devolución que se está editando.
     */
    getCantidadDevueltaExcluyendo(idVenta, productoNombre, excludeId) {
        return this.getByIdVenta(idVenta)
            .filter(
                (d) =>
                    String(d.id) !== String(excludeId) &&
                    d.estadoResolucion !== "Anulada" &&
                    d.producto === productoNombre,
            )
            .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
    },

    create(devolution) {
        const all   = this.get();
        const hoy   = new Date().toISOString().split("T")[0];
        const ahora = new Date().toISOString();
        const estadoInicial = devolution.estadoResolucion ?? "CREADA";
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
            estadoResolucion:   estadoInicial,
            creadoEn:           ahora,
            actualizadoEn:      ahora,
            historialEstados:   [{ estado: estadoInicial, fecha: ahora }],
        };
        localStorage.setItem(KEY, JSON.stringify([...all, nueva]));
        return nueva;
    },

    update(devolucionActualizada) {
        const hoy   = new Date().toISOString().split("T")[0];
        const ahora = new Date().toISOString();
        const updated = this.get().map((d) => {
            if (String(d.id) !== String(devolucionActualizada.id)) return d;

            // Agregar entrada al historial solo si el estado cambió
            let historialEstados = d.historialEstados ||
                [{ estado: d.estadoResolucion, fecha: d.creadoEn ?? ahora }];
            if (
                devolucionActualizada.estadoResolucion &&
                devolucionActualizada.estadoResolucion !== d.estadoResolucion
            ) {
                historialEstados = [
                    ...historialEstados,
                    { estado: devolucionActualizada.estadoResolucion, fecha: ahora },
                ];
            }

            return {
                ...d,
                ...devolucionActualizada,
                historialEstados,
                fechaEstado:   hoy,
                actualizadoEn: ahora,
            };
        });
        localStorage.setItem(KEY, JSON.stringify(updated));
        return devolucionActualizada;
    },

    delete(id) {
        const updated = this.get().filter((d) => String(d.id) !== String(id));
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },

    anular(id) {
        const ahora = new Date().toISOString();
        const updated = this.get().map((d) => {
            if (String(d.id) !== String(id)) return d;
            const historialEstados = [
                ...(d.historialEstados || [{ estado: d.estadoResolucion, fecha: d.creadoEn ?? ahora }]),
                { estado: "Anulada", fecha: ahora },
            ];
            return { ...d, estadoResolucion: "Anulada", historialEstados };
        });
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },

    /** Anula TODAS las devoluciones de una venta */
    anularByIdVenta(idVenta) {
        const ahora = new Date().toISOString();
        const updated = this.get().map((d) => {
            if (String(d.idVenta) !== String(idVenta)) return d;
            const historialEstados = [
                ...(d.historialEstados || [{ estado: d.estadoResolucion, fecha: d.creadoEn ?? ahora }]),
                { estado: "Anulada", fecha: ahora },
            ];
            return { ...d, estadoResolucion: "Anulada", historialEstados };
        });
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
    },
};