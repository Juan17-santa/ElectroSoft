import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/Alert";
import Pagination from "../../../components/ui/Pagination";
import SearchBar from "../../../components/ui/Searchbar";
import ProductCategoryTable from "../components/ProductCategoryTable";
import useProductCategoryTable from "../hooks/UseProductCategoryTable";
import ProductCategoryModal from "../components/ProductCategoryModal";
import { usePermissions } from "../../../../../hooks/usePermissions";

// COMPONENTE PRINCIPAL PARA LA GESTION DE CATEGORIAS DE PRODUCTOS
export default function ProductCategory() {
    const { hasPermission } = usePermissions();

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA EL TEXTO DEL BUSCADOR
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // FUNCION PARA MOSTRAR ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

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
        loadCategories
    } = useProductCategoryTable({
        setConfirmData,
        showAlert,
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
                    onEdit={handleOpenEdit}
                    onToggleEstado={toggleEstado}
                    onDelete={deleteCategory}
                    currentPage={presentPage}       // <- Asegúrate de pasarle tu estado actual de la página
                    recordsPerPage={recordsPerPage} // <- Asegúrate de pasarle cuántos registros renderizas
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
                        showAlert(
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
            {/* ALERTA DE EXITO O ERROR */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    )
}