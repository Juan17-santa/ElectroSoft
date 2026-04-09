const KEY = "products";

export const ServicesProducts = {

    // Obtener todos los productos
    get() {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    },

    // Obtener producto por ID
    getById(id) {
        const productos = this.get();
        return productos.find(prod => prod.id === id);
    },

    // Crear producto
    create(producto) {

        const productos = this.get();

        const nuevoProducto = {
            id: Date.now(),
            nombre: producto.nombre || "",
            categoriaId: producto.categoriaId || "",
            precio: Number(producto.precio) || 0,
            stock: Number(producto.stock) || 0,
            tipoStock: producto.tipoStock || "unidad",
            serial: producto.serial || "",
            garantia: producto.garantia || "",
            caracteristicas: producto.caracteristicas || [],
            estado: true,
            createdAt: new Date().toISOString()
        };

        const nuevosProductos = [...productos, nuevoProducto];

        localStorage.setItem(KEY, JSON.stringify(nuevosProductos));

        return nuevoProducto;
    },

    // Actualizar producto
    update(productoActualizado) {

        const productos = this.get();

        const nuevosProductos = productos.map(prod =>
            prod.id === productoActualizado.id
                ? {
                    ...prod,
                    ...productoActualizado,
                    precio: Number(productoActualizado.precio),
                    stock: Number(productoActualizado.stock)
                }
                : prod
        );

        localStorage.setItem(KEY, JSON.stringify(nuevosProductos));

        return productoActualizado;
    },

    // Eliminar producto
    delete(id) {

        const productos = this.get();

        const nuevosProductos = productos.filter(prod => prod.id !== id);

        localStorage.setItem(KEY, JSON.stringify(nuevosProductos));

        return nuevosProductos;
    },

    // Activar / Desactivar producto
    toggleEstado(id) {

        const productos = this.get();

        const nuevosProductos = productos.map(prod =>
            prod.id === id
                ? { ...prod, estado: !prod.estado }
                : prod
        );

        localStorage.setItem(KEY, JSON.stringify(nuevosProductos));

        return nuevosProductos;
    }
};