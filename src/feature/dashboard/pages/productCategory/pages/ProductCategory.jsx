import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Pagination from "../../../components/ui/Pagination";
import SearchBar from "../../../components/ui/Searchbar";
import ProductCategoryTable from "../components/ProductCategoryTable";
import useProductCategoryTable from "../hooks/UseProductCategoryTable";
import ProductCategoryModal from "../components/ProductCategoryModal";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { useToast } from "../../../../../context/ToastContext";

// COMPONENTE PRINCIPAL PARA LA GESTION DE CATEGORIAS DE PRODUCTOS
export default function ProductCategory() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA EL TEXTO DEL BUSCADOR
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADOS PARA CONTROLAR LA MODAL DE CREAR / EDITAR
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // PAGINACIÓN 
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // FUNCION PARA ABRIR EL MODAL EN MODO CREAR
    const handleOpenCreate = () => {
        setSelectedCategory(null); // LIMPIAMOS
        setIsModalOpen(true);      // ABRIMOS LA MODAL
    };

    // FUNCION PARA ABRIR EL MODAL EN MODO EDITAR
    const handleOpenEdit = (category) => {
        setSelectedCategory(category); // CARGAMOS LA CATEGORIA SELECCIONADA
        setIsModalOpen(true);          // ABIRMOS LA MODAL
    };

    // USAMOS EL HOOK QUE CONTIENE LA LOGICA DE LA TABLA
    const {
        data,
        totalPages,
        deleteCategory,
        toggleEstado,
        loadCategories,
        loading
    } = useProductCategoryTable({
        setConfirmData,
        showAlert: showToast,
        searchTerm,
        currentPage: presentPage,
        recordsPerPage
    })

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de categorias de productos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar categorias de productos..."
                    onCreateClick={handleOpenCreate}
                    createButtonText="Nueva categoria"
                    showCreateButton={hasPermission("Categoria de productos", "Crear")}
                />

                {/* TABLA */}
                <ProductCategoryTable
                    data={data}
                    loading={loading}
                    onEdit={handleOpenEdit}
                    onToggleEstado={toggleEstado}
                    onDelete={deleteCategory}
                    currentPage={presentPage}
                    recordsPerPage={recordsPerPage}
                />

                {/* PAGINACION */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>
            </div>

            {/* MODAL PARA CREAR O EDITAR UNA CATEGORIA */}
            {isModalOpen && (
                <ProductCategoryModal
                    categoryData={selectedCategory}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        loadCategories();
                        showToast(
                            "success",
                            `Categoría ${selectedCategory ? "actualizada" : "registrada"} con éxito`
                        );
                    }}
                />
            )}

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
        </>
    )
}