const KEY = "productCategory";
import { ServicesProducts } from "../../products/services/ServicesProducts";

export const ServiceProductCategory = {
    get() {
        const data = localStorage.getItem(KEY);
        const categories = data ? JSON.parse(data) : [];
        return categories.sort((a, b) => b.id - a.id);
    },

    // VALIDACION PARA NO ELIMINAR CATEGORIA CON PRODUCTOS ASOCIADOS
    hasAssociatedProducts(categoriaId) {
        const products = ServicesProducts.get() || [];
        return products.some(prod => Number(prod.categoriaId) === Number(categoriaId));
    },

    // VALIDACION PARA NO ELIMINAR CATEGORIA CON PROVEEDORES ASOCIADOS
    hasAssociatedProviders(categoriaId) {
        const providers = ServicesProviders.get() || [];
        return providers.some(prov =>
            prov.categoriasAsociadas?.some(catId => Number(catId) === Number(categoriaId))
        );
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

        return this.get();
    },

    update(categoriaActualizada) {
        const categorias = this.get();
        const nuevasCategorias = categorias.map(cat =>
            Number(cat.id) === Number(categoriaActualizada.id) ? categoriaActualizada : cat
        );
        localStorage.setItem(KEY, JSON.stringify(nuevasCategorias));
        return this.get();
    },

    delete(id) {
        if (this.hasAssociatedProducts(id)) {
            throw new Error("RESTRICCION_PRODUCTOS");
        }

        if (this.hasAssociatedProviders(id)) {
            throw new Error("RESTRICCION_PROVEEDORES");
        }

        const data = this.get();
        const newData = data.filter(cat => Number(cat.id) !== Number(id));
        localStorage.setItem(KEY, JSON.stringify(newData));
        return this.get();
    },

    toggleEstado(id) {
        const categorias = this.get();
        const nuevasCategorias = categorias.map(cat =>
            Number(cat.id) === Number(id)
                ? { ...cat, estado: !cat.estado }
                : cat
        );
        localStorage.setItem(KEY, JSON.stringify(nuevasCategorias));
        return this.get();
    },
}