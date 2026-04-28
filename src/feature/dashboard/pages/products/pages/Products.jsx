import { Trash, Pencil, Plus, Search, FileText, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProducts } from "../services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { generateExcelReport } from "../../../../../utils/ExcelReportGenerator";
import Searchbar from "../../../components/ui/Searchbar";
import useProductTable from "../hooks/useProductTable";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { Restricted } from "../../../components/ui/Restricted";
import Pagination from "../../../components/ui/Pagination";

export default function Products() {
    const { hasPermission } = usePermissions();

    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // FUNCION PARA MOSTRAR ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const getCategoryName = (id) => {
        const categoria = categories.find(cat => cat.id === Number(id) || cat.id === id);
        return categoria ? categoria.nombre : "Sin categoría";
    };

    const filteredProducts = products.filter(prod => {
        const q = search.toLowerCase();
        const categoryName = getCategoryName(prod.categoriaId).toLowerCase();
        const estado = prod.estado ? "activo" : "inactivo";

        return (
            prod.nombre.toLowerCase().includes(q) ||
            categoryName.includes(q) ||
            prod.stock.toString().includes(q) ||
            prod.precio.toString().includes(q) ||
            estado.includes(q)
        );
    });

    // PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const PresentRecords = filteredProducts.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

    const nextPage = () => {
        if (presentPage < totalPages) setPresentPage(presentPage + 1);
    };

    const prevPage = () => {
        if (presentPage > 1) setPresentPage(presentPage - 1);
    };

    useEffect(() => {
        getProducts();
        setCategories(ServiceProductCategory.get());
    }, []);

    const getProducts = () => {
        const response = ServicesProducts.get();
        setProducts(response);
    };

    // USAMOS EL HOOK PARA OBTENER LAS FUNCIONES DE ELIMINAR Y CAMBIAR ESTADO
    const { deleteProduct, toggleEstado } =
        useProductTable({
            setProducts,
            setConfirmData,
            showAlert,
        })

    const handleDelete = (id) => {
        deleteProduct(id);
    };

    const handleEditNavigation = (product) => {
        navigate(`/dashboard/products/update/${product.id}`, { state: { productToEdit: product } });
    };

    const handleViewNavigation = (product) => {
        navigate(`/dashboard/products/details/${product.id}`, { state: { product } });
    };

    const handleToggleEstado = (id) => {
        toggleEstado(id);
    };

    /** Genera reporte Excel de productos filtrados */
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
                        getCategoryName(prod.categoriaId),
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

    console.log(totalPages)

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                <p className="text-xl font-semibold flex items-center gap-2">
                    Control de productos
                </p>

                {/* BUSCADOR, REPORTE Y BOTÓN */}
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

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl overflow-x-auto">

                        <table className="min-w-250 w-full text-sm table-fixed">

                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-4 py-2 w-12">ID</th>
                                    <th className="px-4 py-2 w-28">Nombre</th>
                                    <th className="px-4 py-2 w-28">Categoría</th>
                                    <th className="px-4 py-2 w-28">Precio</th>
                                    <th className="px-4 py-2 w-24">Stock</th>
                                    <th className="px-4 py-2 w-32">Estado</th>
                                    <th className="px-4 py-2 text-center w-40">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {PresentRecords.length > 0 ? (
                                    PresentRecords.map((product, index) => (
                                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition">

                                            {/* ID REAL PAGINADO */}
                                            <td className="px-4 py-2">
                                                {firstIndex + index + 1}
                                            </td>

                                            <td className="px-4 py-2 font-medium">
                                                {product.nombre}
                                            </td>

                                            <td className="px-4 py-2">
                                                {getCategoryName(product.categoriaId)}
                                            </td>

                                            <td className="px-4 py-2">
                                                ${product.precio?.toLocaleString()}
                                            </td>

                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <span>{product.stock}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {product.tipoStock === "metros" ? "MTRS" : "UND"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full 
                            ${product.estado ? "bg-green-500" : "bg-red-500"}`}
                                                    />
                                                    <span className="text-sm">
                                                        {product.estado ? "Activo" : "Inactivo"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2">
                                                <div className="flex justify-center gap-3 items-center">

                                                    {/* VER DETALLE */}
                                                    <button
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 cursor-pointer transition"
                                                        onClick={() => handleViewNavigation(product)}
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* EDITAR */}
                                                    <Restricted scope="Productos" action="Editar">
                                                        <button
                                                            className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 cursor-pointer transition"
                                                            onClick={() => handleEditNavigation(product)}
                                                        >
                                                            <Pencil size={18} className="text-yellow-600" />
                                                        </button>

                                                        {/* TOGGLE */}
                                                        <div
                                                            onClick={() => handleToggleEstado(product.id)}
                                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${product.estado ? "bg-green-500" : "bg-red-500"
                                                                }`}
                                                        >
                                                            <div
                                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                    ${product.estado ? "translate-x-4" : "translate-x-0"}`}
                                                            />
                                                        </div>
                                                    </Restricted>

                                                    {/* ELIMINAR */}
                                                    <Restricted scope="Productos" action="Eliminar">
                                                        <button
                                                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 cursor-pointer transition"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash size={18} className="text-red-600" />
                                                        </button>
                                                    </Restricted>

                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-400">
                                            No se encontraron productos
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>

                    </div>
                </div>

                {/* PAGINADOR */}
                {filteredProducts.length > 0 && (
                    <div className="flex justify-end mt-auto pt-4">
                        <Pagination
                            currentPage={presentPage}
                            totalPages={totalPages || 1}
                            onPageChange={(page) => setPresentPage(page)}
                        />
                    </div>
                )}
            </div>

            {/* MODAL DE CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {/* ALERTA DE EXITO O ERROR */}
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
