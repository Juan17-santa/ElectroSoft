import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "../services/ServicesProductCategory";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/alert";
import Pagination from "../../../components/ui/Pagination";
import SearchBar from "../../../components/ui/Searchbar";
import ProductCategoryTable from "../components/ProductCategoryTable";
import useProductCategoryTable from "../hooks/UseProductCategoryTable";
import ProductCategoryModal from "../components/ProductCategoryModal";

export default function ProductCategory() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // OBTENER LAS CATEGORIAS DE PRODUCTOS
    const [categories, setCategories] = useState([]);

    // ESTADO PARA EL BUSCADOR
    const [search, setSearch] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // FUNCION PARA MOSTRAR ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // NUEVOS ESTADOS PARA LA MODAL ÚNICA
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // PAGINACIÓN 
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // FILTRAR LAS CATEGORIAS
    const filteredCategories = categories.filter(cat =>
        cat.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (cat.estado ? "activo" : "inactivo").includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const presentRecords = filteredCategories.slice(firstIndex, lastIndex);

    // OBETENER LAS CATEGORIAS AL CARGAR EL COMPONENTE
    useEffect(() => {
        getProductCategories();
    }, [])

    // FUNCION PARA OBTENER LAS CATEGORIAS
    const getProductCategories = async () => {
        try {
            const response = ServiceProductCategory.get();
            setCategories(response)
        } catch (error) {
            console.error(error)
        }
    }

    // FUNCION PARA PREPARAR LA VISTA DE DETALLES
    const handleDetailsNavigation = (category) => {
        navigate("/dashboard/productCategory/detail", {
            state: { category },
        })
    };

    // FUNCIONES PARA ABRIR MODAL (CREAR / EDITAR) 
    const handleOpenCreate = () => {
        setSelectedCategory(null); // Limpiamos selección para que sea "Crear"
        setIsModalOpen(true);
    };

    const handleOpenEdit = (category) => {
        setSelectedCategory(category); // Cargamos la categoría para que sea "Editar"
        setIsModalOpen(true);
    };

    // USAMOS EL HOOK PARA OBTENER LAS FUNCIONES DE ELIMINAR Y CAMBIAR ESTADO
    const { deleteCategory, toggleEstado } =
        useProductCategoryTable({
            setCategories,
            setConfirmData,
            showAlert,
        })

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de categorias de productos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar categorias de productos..."
                    onCreateClick={() => handleOpenCreate(true)}
                    createButtonText="Crear categoria"
                />

                {/* TABLA */}
                <ProductCategoryTable
                    data={presentRecords}
                    onDetails={handleDetailsNavigation}
                    onEdit={handleOpenEdit}
                    onDelete={deleteCategory}
                    onToggleEstado={toggleEstado}
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

            {/* LA MODAL ÚNICA */}
            {isModalOpen && (
                <ProductCategoryModal
                    categoryData={selectedCategory} // Si es null crea, si tiene datos edita
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        getProductCategories(); // Refresca la tabla tras guardar/editar
                        showAlert("success", `Categoría ${selectedCategory ? 'actualizada' : 'creada'} con éxito`);
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