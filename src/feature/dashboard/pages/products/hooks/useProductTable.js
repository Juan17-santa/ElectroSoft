import { useEffect, useState } from "react";
import { ServicesProducts } from "../services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";

export default function useProductTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Sin categoría";
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await ServicesProducts.get();
            setProducts(response);
        } catch (error) {
            console.error(error);
            showAlert("error", "No se pudieron cargar los productos");
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await ServiceProductCategory.get();
            setCategories(response);
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        await loadProducts();
        await loadCategories();
    };

    useEffect(() => {
        loadData();
    }, []);

    const enrichedProducts = products.map(product => ({
        ...product,
        categoriaName: getCategoryName(product.categoriaId)
    }));

    const filteredProducts = enrichedProducts.filter(prod => {
        const q = searchTerm.toLowerCase();
        const estado = prod.estado ? "activo" : "inactivo";

        return (
            prod.nombre?.toLowerCase().includes(q) ||
            prod.categoriaName?.toLowerCase().includes(q) ||
            prod.stock?.toString().includes(q) ||
            prod.precio?.toString().includes(q) ||
            estado.includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / recordsPerPage));
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredProducts.slice(firstIndex, lastIndex);

    const deleteProduct = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar producto",
            message: "¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                setLoading(true);
                try {
                    await ServicesProducts.delete(id);
                    const updated = await ServicesProducts.get();
                    setProducts(updated);
                    showAlert("success", "Producto eliminado con éxito");
                } catch (error) {
                    console.error(error);
                    showAlert("error", error.message || "Error al eliminar el producto");
                } finally {
                    setLoading(false);
                    setConfirmData(null);
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del producto",
            message: "¿Seguro que deseas cambiar el estado de este producto?",
            onConfirm: async () => {
                setLoading(true);
                try {
                    await ServicesProducts.toggleEstado(id);
                    const updated = await ServicesProducts.get();
                    setProducts(updated);
                    showAlert("success", "Estado del producto actualizado con éxito");
                } catch (error) {
                    console.error(error);
                    showAlert("error", error.message || "Error al cambiar el estado");
                } finally {
                    setLoading(false);
                    setConfirmData(null);
                }
            },
            onCancel: () => setConfirmData(null),
        });
    };

    return {
        data: currentRecords,
        filteredProducts,
        totalPages,
        loading,
        deleteProduct,
        toggleEstado,
        loadProducts,
    };
}
