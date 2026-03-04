const KEY_CHAR = "product_characteristics";
const KEY_MEAS = "product_measures";

export const ServicesCharacteristics = {
    // Características
    getCharacteristics() {
        const data = localStorage.getItem(KEY_CHAR);
        return data ? JSON.parse(data) : [];
    },

    addCharacteristic(name) {
        const chars = this.getCharacteristics();
        const exists = chars.find(c => c.nombre.toLowerCase() === name.toLowerCase());
        if (exists) return exists;

        const nuevo = { id: Date.now(), nombre: name };
        const nuevos = [...chars, nuevo];
        localStorage.setItem(KEY_CHAR, JSON.stringify(nuevos));
        return nuevo;
    },

    // Medidas
    getMeasures() {
        const data = localStorage.getItem(KEY_MEAS);
        return data ? JSON.parse(data) : [];
    },

    addMeasure(name) {
        const measures = this.getMeasures();
        const exists = measures.find(m => m.nombre.toLowerCase() === name.toLowerCase());
        if (exists) return exists;

        const nuevo = { id: Date.now(), nombre: name };
        const nuevos = [...measures, nuevo];
        localStorage.setItem(KEY_MEAS, JSON.stringify(nuevos));
        return nuevo;
    },

    // eliminaciones
    removeCharacteristic(id) {
        const chars = this.getCharacteristics();
        const filtered = chars.filter(c => c.id !== id);
        localStorage.setItem(KEY_CHAR, JSON.stringify(filtered));
        return filtered;
    },

    removeMeasure(id) {
        const measures = this.getMeasures();
        const filtered = measures.filter(m => m.id !== id);
        localStorage.setItem(KEY_MEAS, JSON.stringify(filtered));
        return filtered;
    }
};
