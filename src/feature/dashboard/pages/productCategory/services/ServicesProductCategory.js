const KEY = "productCategory";

export const ServiceProductCategory = {

    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    create({ nombre, descripcion }) {

        const categorias = this.get();

        const nuevaCategoria = {
            id: Date.now(),
            nombre,
            descripcion,
            estado: true
        };

        const nuevasCategorias = [...categorias, nuevaCategoria];

        localStorage.setItem(KEY, JSON.stringify(nuevasCategorias));

        return nuevaCategoria;
    },

    update(categoriaActualizada) {

        const categorias = this.get();

        const nuevasCategorias = categorias.map(cat => cat.id === categoriaActualizada.id ? categoriaActualizada : cat);

        localStorage.setItem(KEY, JSON.stringify(nuevasCategorias));

        return nuevasCategorias;
    },

    delete(id) {

        const data = JSON.parse(localStorage.getItem(KEY)) || [];

        const newData = data.filter(cat => cat.id !== id);

        localStorage.setItem(KEY, JSON.stringify(newData));

        return newData;
    },

    toggleEstado(id) {

        const categorias = this.get();

        const nuevasCategorias = categorias.map(cat =>
            cat.id === id
                ? { ...cat, estado: !cat.estado }
                : cat
        );

        localStorage.setItem(KEY, JSON.stringify(nuevasCategorias));

        return nuevasCategorias;
    },
}