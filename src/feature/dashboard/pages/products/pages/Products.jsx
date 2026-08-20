import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import Searchbar from "../../../components/ui/Searchbar";
import ProductsTable from "../components/ProductsTable";
import useProductTable from "../hooks/useProductTable";
import { usePermissions } from "../../../../../hooks/usePermissions";
import Pagination from "../../../components/ui/Pagination";
import { useToast } from "../../../../../context/ToastContext";
import { ServicesProducts } from "../services/ServicesProducts";
import ProductDetails from "./ProductDetails";

export default function Products() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [productToView, setProductToView] = useState(null);
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    const {
        data,
        categories,
        totalPages,
        loading,
        deleteProduct,
        toggleEstado
    } = useProductTable({
        setConfirmData,
        showAlert: showToast,
        searchTerm: search,
        currentPage: presentPage,
        recordsPerPage
    });

    const handleDelete = (id) => {
        deleteProduct(id);
    };

    const handleEditNavigation = (product) => {
        navigate(`/dashboard/products/update/${product.id}`, { state: { productToEdit: product } });
    };

    const handleViewNavigation = (product) => {
        setProductToView(product);
    };

    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de productos en Excel?",
            onConfirm: async () => {
                try {
                    const reportProducts = await ServicesProducts.get({ search });
                    const categoryById = new Map(categories.map(category => [category.id, category.name]));
                    generateExcelReport({
                        title: "Gestión de Productos - Reporte",
                        fileName: "reporte_productos.xlsx",
                        columns: ["Nombre", "Categoría", "Precio", "Stock", "Serial", "Garantía", "Estado"],
                        data: reportProducts.map(prod => [
                            prod.nombre,
                            categoryById.get(prod.categoriaId) || "Sin categoría",
                            `$${prod.precio?.toLocaleString()}`,
                            prod.stock,
                            prod.serial,
                            prod.garantia,
                            prod.estado ? "Activo" : "Inactivo"
                        ])
                    });
                    showToast("success", "Reporte generado correctamente.");
                } catch (error) {
                    showToast("error", error.message || "No se pudo generar el reporte");
                } finally {
                    setConfirmData(null);
                }
            }
        });
    };

    return (
        <>
            <div className="bg-white p-6 flex flex-col gap-6 w-full h-full">

                <p className="text-xl font-semibold">Control de productos</p>

                <Searchbar
                    searchTerm={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        setPresentPage(1);
                    }}
                    placeholder="Buscar productos..."
                    onCreateClick={() => navigate("/dashboard/products/create")}
                    createButtonText="Nuevo producto"
                    showCreateButton={hasPermission("Productos", "Crear")}
                    showReportButton={hasPermission("Productos", "Reporte")}
                    onReportClick={handleGenerateReport}
                />

                <ProductsTable
                    data={data}
                    loading={loading}
                    currentPage={presentPage}
                    recordsPerPage={recordsPerPage}
                    onDetails={handleViewNavigation}
                    onEdit={handleEditNavigation}
                    onToggleEstado={toggleEstado}
                    onDelete={handleDelete}
                />

                {data.length > 0 && (
                    <div className="flex justify-end mt-auto pt-4">
                        <Pagination
                            currentPage={presentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setPresentPage(page)}
                        />
                    </div>
                )}
            </div>

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            <ProductDetails
                isOpen={!!productToView}
                onClose={() => setProductToView(null)}
                product={productToView}
            />
        </>
    );
}
