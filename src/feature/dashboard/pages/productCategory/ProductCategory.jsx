import { Trash, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "./services/ServicesProductCategory";

export default function ProductCategory() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // OBTENER LAS CATEGORIAS DE PRODUCTOS
    const [categories, setCategories] = useState([]);

    // ESTADO PARA EL BUSCADOR
    const [search, setSearch] = useState("");

    // FILTRAR LAS CATEGORIAS POR NOMBRE
    const filteredCategories = categories.filter(cat =>
        cat.nombre.toLowerCase().includes(search.toLowerCase())
    );

    // FUNCION PAGINADOR, PAGINA ACTUAL DEL PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const PresentRecords = filteredCategories.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);

    const nextPage = () => {
        if (presentPage < totalPages) setPresentPage(presentPage + 1);
    };

    const prevPage = () => {
        if (presentPage > 1) setPresentPage(presentPage - 1);
    };


    useEffect(() => {
        getproductCategories();
    }, [])

    const getproductCategories = async () => {
        try {
            const response = ServiceProductCategory.get();
            setCategories(response)
        } catch (error) {
            console.error(error)
        }
    }

    // FUNCION PARA ELIMINAR UNA CATEGORIA DE PRODUCTOS
    const handleDelete = (id) => {

        const confirmDelete = window.confirm("¿Esta seguro de eliminar categoría?");
        if (!confirmDelete) return;
        alert("Categoria eliminada correctamente")

        const newData = ServiceProductCategory.delete(id);

        setCategories(newData);
    };

    // FUNCIÓN PARA PREPARAR LA EDICIÓN
    const handleEditNavigation = (category) => {
        // Guardamos la categoría seleccionada para que el otro componente la lea
        localStorage.setItem("categoryToEdit", JSON.stringify(category));
        // Navegamos
        navigate("/dashboard/product-category/update");
    };

    // FUNCION PARA CAMBIO DE ESTADO
    const handleToggleEstado = (id) => {
        const nuevasCategorias = ServiceProductCategory.toggleEstado(id);
        setCategories(nuevasCategorias);
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de categorias de productos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-4/5">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar categorias de productos.."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none text-md placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md transition">
                        <Plus />
                        <button
                            type="button"
                            className="cursor-pointer"
                            onClick={() => navigate("/dashboard/product-category/create")}
                        >
                            Crear categoria
                        </button>
                    </div>
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
                                    <th className="px-4 py-2 font-semibold w-32">Estado</th>
                                    <th className="px-4 py-2 font-semibold text-center w-40">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {PresentRecords.map((category, index) => (
                                    <tr key={category.id} className="border-b border-gray-300">
                                        <td className="px-4 py-1">{index + 1}</td>
                                        <td className="px-4 py-1">{category.nombre}</td>
                                        <td className="px-4 py-1 max-w-md">{category.descripcion}</td>
                                        <td className="px-4 py-1 w-28">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full 
                                                    ${category.estado === true ? "bg-green-500" : "bg-red-500"}`}
                                                ></span>
                                                <span>
                                                    {category.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1">
                                            <div className="flex justify-center gap-4">

                                                {/* BOTON EDITAR */}
                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => handleEditNavigation(category)}
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>

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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                <div className="flex justify-end mt-4">
                    <div className="flex items-center gap-3 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">

                        {/* Flecha izquierda */}
                        <button
                            onClick={prevPage}
                            className="p-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            ←
                        </button>

                        {/* Números de página */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setPresentPage(page)}
                                className={`px-3 py-1 rounded-md transition
                    ${presentPage === page
                                        ? "bg-yellow-400 text-black font-medium shadow-sm"
                                        : "bg-gray-300"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Flecha derecha */}
                        <button
                            onClick={nextPage}
                            className="p-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            →
                        </button>

                    </div>
                </div>
            </div>
        </>
    )
}