import { Package, Tag, DollarSign, Boxes, Hash, ShieldCheck, X, Trash, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServicesProducts } from "../services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import Alert from "../../../components/ui/alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import CategorySelect from "../../../components/ui/CategorySelect";
import useProductEditForm from "../hooks/useProductEditForm";

export default function EditProducts() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [ProductData, setProductData] = useState(null);
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const itemsPerPage = 3;

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // USAR EL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit: submitForm,
        setFormData
    } = useProductEditForm({
        id: Number(id),
        initialData: ProductData || {},
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Producto actualizado correctamente"
            });

            setTimeout(() => {
                navigate("/dashboard/products");
            }, 2000);
        },
        caracteristicas
    });

    useEffect(() => {
        const producto = ServicesProducts.getById(Number(id));
        const cats = ServiceProductCategory.get();

        if (producto) {
            setProductData(producto);
            setCaracteristicas(producto.caracteristicas || []);
        }

        setCategorias(cats);

    }, [id]);

    const eliminarCaracteristica = (id) => {
        setDeleteConfirm(id);
    };

    const confirmarEliminar = () => {
        if (!deleteConfirm) return;
        setCaracteristicas(caracteristicas.filter(c => c.id !== deleteConfirm));
        setAlert({
            type: "success",
            message: "Característica eliminada correctamente"
        });
        setDeleteConfirm(null);
    };

    const toggleVisibilidad = (id) => {
        setCaracteristicas(
            caracteristicas.map(c =>
                c.id === id
                    ? { ...c, visible: !c.visible }
                    : c
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("FormData:", formData);
        console.log("Errors:", errors);
        console.log("Características:", caracteristicas);
        submitForm(e);
    };

    // Paginación de características
    const totalPages = Math.ceil(caracteristicas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedCaracteristicas = caracteristicas.slice(startIndex, endIndex);

    return (
        <div className="w-full h-full bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner box-border overflow-y-auto">

            <div className="flex justify-between items-start">
                <p className="text-xl font-semibold">Editar <span className="text-yellow-400">producto</span></p>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard/products")}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-10 mt-6 px-20">

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <Package size={16} /> Nombre del producto *
                    </label>
                    <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        type="text"
                        className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${
                            errors.nombre ? 'border-red-500' : 'border-transparent'
                        }`}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm">{errors.nombre}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <CategorySelect
                        label="Categoría"
                        icon={Tag}
                        options={categorias}
                        value={formData.categoriaId}
                        onChange={(value) => handleChange({ target: { name: 'categoriaId', value } })}
                        placeholder="Seleccione una categoría"
                        width="w-full"
                        hasError={!!errors.categoriaId}
                    />
                    {errors.categoriaId && (
                        <p className="text-red-500 text-sm">{errors.categoriaId}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <DollarSign size={16} /> Precio *
                    </label>
                        <input
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${
                                errors.precio ? 'border-red-500' : 'border-transparent'
                            }`}
                        />
                    {errors.precio && (
                        <p className="text-red-500 text-sm">{errors.precio}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <Boxes size={16} /> Stock *
                    </label>
                        <input
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${
                                errors.stock ? 'border-red-500' : 'border-transparent'
                            }`}
                        />
                    {errors.stock && (
                        <p className="text-red-500 text-sm">{errors.stock}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <Hash size={16} /> Serial *
                    </label>
                    <input
                        name="serial"
                        value={formData.serial}
                        onChange={handleChange}
                        type="text"
                        className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${
                            errors.serial ? 'border-red-500' : 'border-transparent'
                        }`}
                    />
                    {errors.serial && (
                        <p className="text-red-500 text-sm">{errors.serial}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <ShieldCheck size={16} /> Garantía *
                    </label>
                    <div className="relative">
                        <select
                            name="garantia"
                            value={formData.garantia}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 border-2 ${
                                errors.garantia ? 'border-red-500' : 'border-transparent'
                            }`}
                        >
                            <option hidden value="">Seleccione una garantía</option>
                            <option value="3 meses">3 meses</option>
                            <option value="6 meses">6 meses</option>
                            <option value="12 meses">12 meses</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                    {errors.garantia && (
                        <p className="text-red-500 text-sm">{errors.garantia}</p>
                    )}
                </div>
            </div>

            {/* TABLA DE CARACTERÍSTICAS */}
            <div className="px-20 mt-6">
                <h3 className="text-lg font-semibold mb-4">Características del producto</h3>

                {/* TABLA */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b-2 border-yellow-300">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-semibold text-gray-700">Característica</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Medida</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Nombre de medida</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedCaracteristicas.length > 0 ? (
                                displayedCaracteristicas.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-gray-700">{item.nombre}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.medida}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.valor}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVisibilidad(item.id)}
                                                    className={`p-2 rounded-lg flex items-center justify-center transition ${
                                                        item.visible 
                                                            ? "bg-yellow-100 hover:bg-yellow-200" 
                                                            : "bg-gray-100 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    <svg className={`w-4 h-4 ${item.visible ? "text-yellow-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                                                    onClick={() => eliminarCaracteristica(item.id)}
                                                >
                                                    <Trash size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                        No hay características asociadas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINADOR */}
                {caracteristicas.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-3 mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* BOTONES */}
            <div className="px-20 flex justify-end gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/products")}
                    className="px-6 py-2.5 rounded-lg font-medium transition shadow-md border-2 border-gray-300 hover:bg-gray-200"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={Object.values(errors).some(error => error)}
                    className="bg-linear-to-r from-white to-yellow-300 px-6 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Guardar
                </button>
            </div>
            </form>

            {/* CONFIRM MODAL PARA ELIMINAR CARACTERISTICA */}
            {deleteConfirm && (
                <ConfirmModal
                    title="Eliminar característica"
                    message="¿Estás seguro de eliminar esta característica?"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setDeleteConfirm(null)}
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
        </div>
    );
}
