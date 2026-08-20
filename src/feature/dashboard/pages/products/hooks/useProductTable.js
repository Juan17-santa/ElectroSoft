import { useEffect, useRef, useState } from "react";
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
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);
    const searchTimerRef = useRef(null);

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Sin categoría";
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const requestId = ++requestIdRef.current;
            const response = await ServicesProducts.getPage({
                page: currentPage,
                limit: recordsPerPage,
                search: searchTerm,
            });
            if (requestId !== requestIdRef.current) return;
            setProducts(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            if (requestIdRef.current) showAlert("error", error.message || "No se pudieron cargar los productos");
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

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(loadProducts, 300);
        return () => {
            clearTimeout(searchTimerRef.current);
            requestIdRef.current += 1;
        };
    }, [searchTerm, currentPage, recordsPerPage]);

    const enrichedProducts = products.map(product => ({
        ...product,
        categoriaName: getCategoryName(product.categoriaId)
    }));

    const deleteProduct = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar producto",
            message: "¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                if (loading) return;
                setLoading(true);
                try {
                    await ServicesProducts.delete(id);
                    await loadProducts();
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
                if (loading) return;
                setLoading(true);
                try {
                    await ServicesProducts.toggleEstado(id);
                    await loadProducts();
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
        data: products.map(product => ({
            ...product,
            categoriaName: getCategoryName(product.categoriaId)
        })),
        totalPages,
        categories,
        loading,
        deleteProduct,
        toggleEstado,
        loadProducts,
    };
}
