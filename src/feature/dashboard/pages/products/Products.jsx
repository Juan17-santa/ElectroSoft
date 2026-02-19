import { Trash, Pencil, Plus, Search, FileText, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProducts } from "./services/ServicesProducts";
import { ServiceProductCategory } from "../productCategory/services/ServicesProductCategory";



export default function Products() {

    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

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

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("¿Esta seguro de eliminar producto?");
        if (!confirmDelete) return;

        alert("Producto eliminado correctamente");

        const newData = ServicesProducts.delete(id);
        setProducts(newData);
    };

    const handleEditNavigation = (product) => {
        localStorage.setItem("productToEdit", JSON.stringify(product));
        navigate(`/dashboard/products/update/${product.id}`);
    };

    const handleToggleEstado = (id) => {
        const nuevosProductos = ServicesProducts.toggleEstado(id);
        setProducts(nuevosProductos);
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full min-h-142 shadow-inner">

            <p className="text-xl font-semibold">Control de productos</p>

            {/* BUSCADOR, REPORTE Y BOTÓN */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-4 w-4/5">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos.."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none text-md placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <button
                            className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition w-fit"
                            aria-label="Generar reporte"
                        >
                            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100">
                                <FileText size={15} className="text-gray-600" />
                            </span>
                            <span className="text-sm font-medium text-gray-600">Generar reporte</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md hover:shadow-lg transition">
                    <Plus />
                    <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => navigate("/dashboard/products/create")}
                    >
                        Crear producto
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                <div className="bg-gray-100 rounded-2xl overflow-hidden">

                    <table className="w-full text-sm table-fixed">

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
                    {product.stock}
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
                    <div className="flex justify-center gap-3">

                        {/* VER DETALLE */}
                        <button
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
                            
                        >
                            <Eye size={18} className="text-blue-600" />
                        </button>

                        {/* EDITAR */}
                        <button
                            className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition"
                            onClick={() => handleEditNavigation(product)}
                        >
                            <Pencil size={18} className="text-yellow-600" />
                        </button>

                        {/* TOGGLE */}
                        <div
                            onClick={() => handleToggleEstado(product.id)}
                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                            product.estado ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                ${product.estado ? "translate-x-4" : "translate-x-0"}`}
                            />
                        </div>

                        {/* ELIMINAR */}
                        <button
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                            onClick={() => handleDelete(product.id)}
                        >
                            <Trash size={18} className="text-red-600" />
                        </button>

                    </div>
                </td>

            </tr>
            ))
        ) : (
            <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                    No se encontraron productos
                </td>
            </tr>
        )}
    </tbody>

</table>

                </div>
            </div>

            {/* PAGINADOR */}
            <div className="flex justify-end mt-auto">
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
                            className={`px-3 py-1 rounded-md transition ${presentPage === page ? "bg-yellow-400 text-black font-medium shadow-sm" : "bg-gray-300"}`}
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
    );
}
