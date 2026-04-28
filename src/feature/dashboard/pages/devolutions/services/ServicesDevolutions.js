const KEY = "devolutions";

function normalizeDevolution(devolution) {
    const {
        fecha,
        fechaISO,
        ...rest
    } = devolution;
    const fechaDevolucion =
        rest.fechaDevolucion ??
        fechaISO ??
        "";

    return {
        ...rest,
        fechaDevolucion,
        fechaEstado: rest.fechaEstado ?? fechaDevolucion,
    };
}

export const ServicesDevolutions = {

    get() {
        const data = localStorage.getItem(KEY);
        const parsed = data ? JSON.parse(data) : [];
        const normalized = parsed.map(normalizeDevolution);

        const changed = normalized.some((item, index) => {
            const original = parsed[index] || {};
            return (
                item.fechaDevolucion !== original.fechaDevolucion ||
                item.fechaEstado !== original.fechaEstado ||
                "fecha" in original ||
                "fechaISO" in original
            );
        });

        if (changed) {
            localStorage.setItem(KEY, JSON.stringify(normalized));
        }

        return normalized;
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
            fechaDevolucion:    devolution.fechaDevolucion    ?? devolution.fechaISO ?? hoy,
            fechaEstado:        hoy,
            estadoResolucion:   estadoInicial,
            creadoEn:           ahora,
            actualizadoEn:      ahora,
            historialEstados:   [{ estado: estadoInicial, fecha: ahora }],
        };
        const normalized = normalizeDevolution(nueva);
        localStorage.setItem(KEY, JSON.stringify([...all, normalized]));
        return normalized;
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

            return normalizeDevolution({
                ...d,
                ...devolucionActualizada,
                historialEstados,
                fechaEstado:   hoy,
                actualizadoEn: ahora,
            });
        });
        localStorage.setItem(KEY, JSON.stringify(updated));
        return normalizeDevolution(devolucionActualizada);
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
