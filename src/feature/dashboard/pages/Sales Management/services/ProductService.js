const KEY = "productCategory";

export const ProductService = {
    getAll() {
        const data = localStorage.getItem(KEY);
        const categories = data ? JSON.parse(data) : [];
        // Solo retornar productos activos
        return categories.filter(cat => cat.estado === true);
    }
};
