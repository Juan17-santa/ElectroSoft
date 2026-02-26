import { Trash, Pencil, Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "./services/ServicesProductCategory";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/alert";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import PrimaryButton from "../../components/ui/PrimaryButton";

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

    useEffect(() => {
        getProductCategories();
    }, [])

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
        // Guardamos la categoría seleccionada para que el otro componente la lea
        localStorage.setItem("categoryToView", JSON.stringify(category));
        // Navegamos
        navigate("/dashboard/product-category/detail");
    };

    // FUNCIÓN PARA PREPARAR LA EDICIÓN
    const handleEditNavigation = (category) => {
        // Guardamos la categoría seleccionada para que el otro componente la lea
        localStorage.setItem("categoryToEdit", JSON.stringify(category));
        // Navegamos
        navigate("/dashboard/product-category/update");
    };

    const handleDelete = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar categoría",
            message: "¿Seguro que deseas eliminar esta categoría? Esta acción no se puede deshacer.",
            onConfirm: () => {
                // Guardamos lo que devuelve el servicio (la lista sin el eliminado)
                const nuevasCategorias = ServiceProductCategory.delete(id);

                // Actualizamos el estado de React para que la lista cambie en pantalla
                setCategories(nuevasCategorias);

                // Cerramos el modal
                setConfirmData(null);

                // Lanzamos la alerta de éxito
                showAlert("success", "Categoría eliminada con éxito");
            },
            onCancel: () => setConfirmData(null)
        });
    };

    // FUNCION PARA CAMBIO DE ESTADO
    const handleToggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado",
            message: "¿Deseas cambiar el estado de esta categoría?",
            onConfirm: () => {
                // Guardamos lo que devuelve el servicio (la lista con el estado cambiado)
                const nuevasCategorias = ServiceProductCategory.toggleEstado(id);

                // Actualizamos react
                setCategories(nuevasCategorias);

                // Cerramos el modal
                setConfirmData(null);

                // Lanzamos la alerta
                showAlert("success", "Estado actualizado correctamente");
            },
            onCancel: () => setConfirmData(null)
        });
    };

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
                        onClick={() => navigate("/dashboard/product-category/create")}
                        icon={Plus}
                    >
                        Crear categoría
                    </PrimaryButton>
                </div>

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">

                        <table className="w-full text-sm table-fixed">

                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-4 py-2 font-semibold w-12">ID</th>
                                    <th className="px-4 py-2 font-semibold w-44">Nombre</th>
                                    <th className="px-4 py-2 font-semibold">Descripción</th>
                                    <th className="px-4 py-2 font-semibold w-28">Estado</th>
                                    <th className="px-4 py-2 font-semibold text-center w-48">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {presentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            No se encontraron categorias de productos.
                                        </td>
                                    </tr>
                                ) : (
                                    presentRecords.map((category, index) => (
                                        <tr key={category.id} className="border-b border-gray-300">
                                            <td className="px-4 py-1">{index + 1}</td>
                                            <td className="px-4 py-1">{category.nombre}</td>
                                            <td className="px-4 py-1 max-w-md">
                                                {category.descripcion.length === 0 ? (
                                                    <span className="text-gray-400 italic">Sin descripción</span>
                                                ) : (category.descripcion)
                                                }
                                            </td>
                                            <td className="px-4 py-1 w-28">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full 
                                                    ${category.estado ? "bg-green-500" : "bg-red-500"}`}
                                                    ></span>
                                                    <span>
                                                        {category.estado ? "Activo" : "Inactivo"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-1">
                                                <div className="flex justify-center gap-3">

                                                    {/* BOTON DE VER DETALLE */}
                                                    <button
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        onClick={() => handleDetailsNavigation(category)}
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* BOTON EDITAR */}
                                                    <button
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                        onClick={() => handleEditNavigation(category)}
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>

                                                    {/* SWITCHE CAMBIAR ESTADO */}
                                                    <div className="flex justify-center items-center gap-2">
                                                        <div
                                                            onClick={() => handleToggleEstado(category.id)}
                                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                        ${category.estado ? "bg-green-500" : "bg-red-500"}`}
                                                        >
                                                            <div
                                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                            ${category.estado ? "translate-x-4" : "translate-x-0"}`}
                                                            >
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BOTON ELIMINAR */}
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash size={18} className="text-red-600" />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINACION */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>
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
    )
}