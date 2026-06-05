import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import Searchbar from "../../../components/ui/Searchbar";
import ProductsTable from "../components/ProductsTable";
import useProductTable from "../hooks/useProductTable";
import { usePermissions } from "../../../../../hooks/usePermissions";
import Pagination from "../../../components/ui/Pagination";

export default function Products() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const {
        data,
        filteredProducts,
        totalPages,
        loading,
        deleteProduct,
        toggleEstado
    } = useProductTable({
        setConfirmData,
        showAlert,
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
        navigate(`/dashboard/products/details/${product.id}`, { state: { product } });
    };

    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de productos en Excel?",
            onConfirm: () => {
                generateExcelReport({
                    title: "Gestión de Productos - Reporte",
                    fileName: "reporte_productos.xlsx",
                    columns: [
                        "Nombre",
                        "Categoría",
                        "Precio",
                        "Stock",
                        "Serial",
                        "Garantía",
                        "Estado"
                    ],
                    data: filteredProducts.map(prod => [
                        prod.nombre,
                        prod.categoriaName || "Sin categoría",
                        `$${prod.precio?.toLocaleString()}`,
                        prod.stock,
                        prod.serial,
                        prod.garantia,
                        prod.estado ? "Activo" : "Inactivo"
                    ])
                });

                showAlert("success", "Reporte generado correctamente.");
                setConfirmData(null);
            }
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

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
                    showReportButton={true}
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

                {filteredProducts.length > 0 && (
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

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}
