import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "../services/ServicesProductCategory";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/alert";
import Pagination from "../../../components/ui/Pagination";
import SearchInput from "../../../components/ui/SearchInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ProductCategoryTable from "../components/ProductCategoryTable";
import useProductCategoryTable from "../hooks/UseProductCategoryTable";

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
            state: {category},
        })
    };

    // FUNCIÓN PARA PREPARAR LA EDICIÓN
    const handleEditNavigation = (category) => {
        navigate("/dashboard/productCategory/update", {
            state: {category},
        })
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
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full min-h-142 shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de categorias de productos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between gap-4">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar categorías de productos..."
                        className="w-4/5"
                    />

                    <PrimaryButton
                        onClick={() => navigate("/dashboard/productCategory/create")}
                        icon={Plus}
                    >
                        Crear categoría
                    </PrimaryButton>
                </div>

                {/* TABLA */}
                <ProductCategoryTable 
                    data={presentRecords}
                    onDetails={handleDetailsNavigation}
                    onEdit={handleEditNavigation}
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