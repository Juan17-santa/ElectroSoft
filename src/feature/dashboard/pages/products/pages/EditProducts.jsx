import { Package, Tag, DollarSign, Boxes, Hash, ShieldCheck, X, Trash, ChevronLeft, ChevronRight, ChevronDown, Ruler } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServicesProducts } from "../services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import CategorySelect from "../../../components/ui/CategorySelect";
import useProductEditForm from "../hooks/useProductEditForm";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";

export default function EditProducts() {

    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const itemsPerPage = 3;

    const [alert, setAlert] = useState(null);

    const initialProduct = location.state?.productToEdit || ServicesProducts.getById(Number(id));

    const {
        formData,
        errors,
        handleChange,
        handleSubmit: submitForm,
    } = useProductEditForm({
        id: Number(id),
        initialData: initialProduct || {},
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
        const cats = ServiceProductCategory.get();

        if (initialProduct) {
            setCaracteristicas(initialProduct.caracteristicas || []);

            const catsFiltradas = cats.filter(cat =>
                cat.estado === true || cat.id === initialProduct.categoriaId
            );
            setCategorias(catsFiltradas);
        }
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
        submitForm(e);
    };

    const totalPages = Math.ceil(caracteristicas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedCaracteristicas = caracteristicas.slice(startIndex, endIndex);

    return (
        <div className="w-full h-full bg-gray-100 p-4 md:p-6 rounded-2xl flex flex-col gap-6 shadow-inner box-border overflow-y-auto">

            <div className="flex justify-between items-start">
                <p className="text-xl font-semibold">Editar producto</p>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard/products")}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mt-6 px-4 md:px-20">

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-yellow-500 font-medium">
                            <Package size={16} /> Nombre del producto *
                        </label>
                        <input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            type="text"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${errors.nombre ? 'border-red-500' : 'border-transparent'
                                }`}
                        />
                        <ValidationMessage
                            error={errors.nombre}
                            success={formData.nombre}
                            successMessage="Nombre valido"
                        />
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
                        <ValidationMessage
                            error={errors.categoriaId}
                            success={formData.categoriaId}
                            successMessage="Categoria valida"
                        />
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${errors.precio ? 'border-red-500' : 'border-transparent'
                                }`}
                        />
                        <ValidationMessage
                            error={errors.precio}
                            success={formData.precio}
                            successMessage="Precio valido"
                        />
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${errors.stock ? 'border-red-500' : 'border-transparent'
                                }`}
                        />
                        <ValidationMessage
                            error={errors.stock}
                            success={formData.stock}
                            successMessage="Stock valido"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-yellow-500 font-medium">
                            <Ruler size={16} /> Tipo de Stock *
                        </label>
                        <CustomSelect
                            value={formData.tipoStock}
                            onChange={(value) =>
                                handleChange({
                                    target: { name: "tipoStock", value }
                                })
                            }
                            options={[
                                { value: "unidad", label: "Unidad" },
                                { value: "metros", label: "Metros" },
                            ]}
                            placeholder="Seleccione tipo de stock"
                        />
                        <ValidationMessage
                            error={errors.tipoStock}
                            success={formData.tipoStock}
                            successMessage="Tipo de stock valido"
                        />
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
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${errors.serial ? 'border-red-500' : 'border-transparent'
                                }`}
                        />
                        <ValidationMessage
                            error={errors.serial}
                            success={formData.serial}
                            successMessage="Serial valido"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-yellow-500 font-medium">
                            <ShieldCheck size={16} /> Garantía *
                        </label>
                        <CustomSelect
                            value={formData.garantia}
                            onChange={(value) =>
                                handleChange({
                                    target: { name: "garantia", value }
                                })
                            }
                            options={[
                                { value: "3 meses", label: "3 meses" },
                                { value: "6 meses", label: "6 meses" },
                                { value: "9 meses", label: "9 meses" },
                                { value: "12 meses", label: "12 meses" },
                            ]}
                            placeholder="Seleccione una garantía"
                        />
                        <ValidationMessage
                            error={errors.garantia}
                            success={formData.garantia}
                            successMessage="Garantia valida"
                        />
                    </div>
                </div>

                {/* TABLA DE CARACTERÍSTICAS */}
                <div className="px-4 md:px-20 mt-6 overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-4">Características del producto</h3>

                    {/* TABLA */}
                    <div className="bg-white rounded-xl shadow min-w-150 md:min-w-full">
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
                                        <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-gray-700">{item.nombre}</td>
                                            <td className="px-4 py-3 text-gray-700">{item.medida}</td>
                                            <td className="px-4 py-3 text-gray-700">{item.valor}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleVisibilidad(item.id)}
                                                        className={`p-2 rounded-lg flex items-center justify-center transition ${item.visible
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
                <div className="flex justify-end gap-4 px-4 md:px-20">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/products")}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        <span>✕</span>
                        Cancelar
                    </button>
                    <PrimaryButton
                        type="submit"
                        disabled={Object.values(errors).some(error => error)}
                    >
                        Guardar cambios
                    </PrimaryButton>
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
