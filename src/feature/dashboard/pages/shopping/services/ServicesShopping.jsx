const KEY = "compras";

/**
 * Capa de servicio para el módulo de Compras.
 * Centraliza todo acceso a localStorage bajo la clave "compras",
 * siguiendo el mismo patrón que ServicesProducts, ServicesProviders, etc.
 */
export const ServicesShopping = {

    /** Obtiene todas las compras */
    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    /** Obtiene una compra por su ID */
    getById(id) {
        return this.get().find((c) => String(c.id) === String(id)) || null;
    },

    /** Persiste el array completo de compras (sobreescribe) */
    saveAll(compras) {
        localStorage.setItem(KEY, JSON.stringify(compras));
        return compras;
    },

    /** Agrega una nueva compra al array */
    create(nuevaCompra) {
        const compras = this.get();
        const updated = [...compras, nuevaCompra];
        this.saveAll(updated);
        return nuevaCompra;
    },

    /** Actualiza una compra existente buscándola por ID */
    update(compraActualizada) {
        const compras = this.get();
        const updated = compras.map((c) =>
            c.id === compraActualizada.id ? { ...c, ...compraActualizada } : c
        );
        this.saveAll(updated);
        return compraActualizada;
    },
};