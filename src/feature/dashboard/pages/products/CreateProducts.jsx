import { Package, Tag, DollarSign, Boxes, Hash, ShieldCheck, X, Plus, Trash, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServicesProducts } from "./services/ServicesProducts";
import { ServiceProductCategory } from "../productCategory/services/ServicesProductCategory";
import Alert from "../../components/ui/alert";
import ConfirmModal from "../../components/ui/ConfirmModal";
import useProductForm from "./hooks/useProductForm";
import { ServicesCharacteristics } from "./services/ServicesCharacteristics";

export default function CreateProducts() {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [modalForm, setModalForm] = useState({
        nombre: "",
        medida: "",
        valor: ""
    });
    const [characteristicOptions, setCharacteristicOptions] = useState([]);
    const [measureOptions, setMeasureOptions] = useState([]);
    const [charDropdownOpen, setCharDropdownOpen] = useState(false);
    const [measDropdownOpen, setMeasDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // USAR EL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit: submitForm
    } = useProductForm({
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Producto creado correctamente"
            });

            setTimeout(() => {
                navigate("/dashboard/products");
            }, 2000);
        },
        caracteristicas
    });

    useEffect(() => {
        const data = ServiceProductCategory.get();
        setCategorias(data);
        // cargar opciones de caracteristicas y medidas
        setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
        setMeasureOptions(ServicesCharacteristics.getMeasures());
    }, []);

    const handleModalChange = (e) => {
        setModalForm({
            ...modalForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectCharacteristic = (name) => {
        setModalForm(prev => ({ ...prev, nombre: name }));
        setCharDropdownOpen(false);
    };

    const handleSelectMeasure = (name) => {
        setModalForm(prev => ({ ...prev, medida: name }));
        setMeasDropdownOpen(false);
    };

    const addCharacteristicOption = (name) => {
        const added = ServicesCharacteristics.addCharacteristic(name);
        setCharacteristicOptions(prev => [...prev, added]);
        setModalForm(prev => ({ ...prev, nombre: added.nombre }));
        setCharDropdownOpen(false);
    };

    const removeCharacteristicOption = (id) => {
        const updated = ServicesCharacteristics.removeCharacteristic(id);
        setCharacteristicOptions(updated);
    };

    const addMeasureOption = (name) => {
        const added = ServicesCharacteristics.addMeasure(name);
        setMeasureOptions(prev => [...prev, added]);
        setModalForm(prev => ({ ...prev, medida: added.nombre }));
        setMeasDropdownOpen(false);
    };

    const removeMeasureOption = (id) => {
        const updated = ServicesCharacteristics.removeMeasure(id);
        setMeasureOptions(updated);
    };

    const agregarCaracteristica = () => {
        if (!modalForm.nombre) {
            setAlert({ type: "error", message: "Complete el nombre de la característica" });
            return;
        }

        if (editingId) {
            setCaracteristicas(
                caracteristicas.map(c =>
                    c.id === editingId
                        ? { ...c, nombre: modalForm.nombre, medida: modalForm.medida || "-", valor: modalForm.valor || "-" }
                        : c
                )
            );
            setEditingId(null);
        } else {
            const nuevo = { id: Date.now(), nombre: modalForm.nombre, medida: modalForm.medida || "-", valor: modalForm.valor || "-", visible: true };
            setCaracteristicas([...caracteristicas, nuevo]);
        }

        setModalForm({ nombre: "", medida: "", valor: "" });
        setShowModal(false);
    };

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

    const editarCaracteristica = (caracteristica) => {
        setEditingId(caracteristica.id);
        setModalForm({
            nombre: caracteristica.nombre,
            medida: caracteristica.medida === "-" ? "" : caracteristica.medida,
            valor: caracteristica.valor === "-" ? "" : caracteristica.valor
        });
        setShowModal(true);
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

    // Paginación de características
    const totalPages = Math.ceil(caracteristicas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedCaracteristicas = caracteristicas.slice(startIndex, endIndex);

    return (
        <div className="w-full h-full bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner box-border overflow-y-auto">

            <div className="flex justify-between items-start">
                <p className="text-xl font-semibold">
                    Crear nuevo <span className="text-yellow-400">producto</span>
                </p>

                <button
                    onClick={() => navigate("/dashboard/products")}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
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
                        placeholder="Ingresar nombre del producto"
                        className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 ${
                            errors.nombre ? 'border-red-500' : 'border-transparent'
                        }`}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm">{errors.nombre}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        <Tag size={16} /> Categoría *
                    </label>
                    <div className="relative">
                        <select
                            name="categoriaId"
                            value={formData.categoriaId}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 border-2 ${
                                errors.categoriaId ? 'border-red-500' : 'border-transparent'
                            }`}
                        >
                            <option hidden value="">Seleccione una categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
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
                        type="number"
                        placeholder="Digite el precio"
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
                        type="number"
                        placeholder="Digite el stock"
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
                        placeholder="Digite el serial"
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

                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            setShowModal(true);
                            setModalForm({ nombre: "", medida: "", valor: "" });
                            // recargar opciones desde el servicio en cada apertura
                            setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
                            setMeasureOptions(ServicesCharacteristics.getMeasures());
                            setCharDropdownOpen(true);
                            setMeasDropdownOpen(true);
                        }}
                        className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 px-6 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                    >
                        <Plus size={16} /> Añadir Característica
                    </button>
                </div>

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
                            {displayedCaracteristicas.map(item => (
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINADOR */}
                {caracteristicas.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-3 mt-4">
                        <button
                            type="button"
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
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                <div className="flex justify-end mt-8 gap-4">
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
                        className="bg-linear-to-r from-white to-yellow-300 px-8 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Registrar
                    </button>
                </div>
            </div>
            </form>

            {/* MODAL BACKDROP */}
            {showModal && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm z-40"
                    onClick={() => {
                        setShowModal(false);
                        setEditingId(null);
                        setModalForm({ nombre: "", medida: "", valor: "" });
                    }}
                ></div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl pointer-events-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">
                                {editingId ? "Editar" : "Crear nueva"} <span className="text-yellow-400">característica</span>
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                    setModalForm({ nombre: "", medida: "", valor: "" });
                                }}
                                className="cursor-pointer hover:bg-gray-200 p-1 rounded transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Package size={14} /> Característica *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={modalForm.nombre}
                                    onChange={(e) => { handleModalChange(e); }}
                                    onClick={() => setCharDropdownOpen(true)}
                                    onFocus={() => setCharDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setCharDropdownOpen(false), 200)}
                                    className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                />
                                {charDropdownOpen && (
                                    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-auto">
                                        {characteristicOptions
                                            .filter(o => !modalForm.nombre.trim() || o.nombre.toLowerCase().includes(modalForm.nombre.toLowerCase()))
                                            .slice(0, 6)
                                            .map(opt => (
                                            <div key={opt.id} onClick={() => handleSelectCharacteristic(opt.nombre)} className="flex justify-between items-center px-3 py-2 border-b border-gray-200 cursor-pointer text-sm text-gray-700 hover:bg-yellow-100 transition">
                                                <span>{opt.nombre}</span>
                                                <Trash size={12} className="text-red-500 hover:text-red-700 ml-2" onClick={(e) => { e.stopPropagation(); removeCharacteristicOption(opt.id); }} />
                                            </div>
                                        ))}
                                        {modalForm.nombre.trim() && !characteristicOptions.some(o => o.nombre.toLowerCase() === modalForm.nombre.toLowerCase()) && (
                                            <div className="px-3 py-2.5 border-t bg-yellow-50 flex justify-between items-center">
                                                <span className="text-sm text-gray-600">No existe: <strong>{modalForm.nombre}</strong></span>
                                                <button type="button" onClick={() => addCharacteristicOption(modalForm.nombre)} className="text-sm text-yellow-600 font-medium hover:text-yellow-700">Agregar</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Tag size={14} /> Medida
                                </label>
                                <input
                                    type="text"
                                    name="medida"
                                    value={modalForm.medida}
                                    onChange={(e) => { handleModalChange(e); }}
                                    onClick={() => setMeasDropdownOpen(true)}
                                    onFocus={() => setMeasDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setMeasDropdownOpen(false), 200)}
                                    className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                />
                                {measDropdownOpen && (
                                    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-auto">
                                        {measureOptions
                                            .filter(o => !modalForm.medida.trim() || o.nombre.toLowerCase().includes(modalForm.medida.toLowerCase()))
                                            .slice(0, 6)
                                            .map(opt => (
                                            <div key={opt.id} onClick={() => handleSelectMeasure(opt.nombre)} className="flex justify-between items-center px-3 py-2 border-b border-gray-200 cursor-pointer text-sm text-gray-700 hover:bg-yellow-100 transition">
                                                <span>{opt.nombre}</span>
                                                <Trash size={12} className="text-red-500 hover:text-red-700 ml-2" onClick={(e) => { e.stopPropagation(); removeMeasureOption(opt.id); }} />
                                            </div>
                                        ))}
                                        {modalForm.medida.trim() && !measureOptions.some(o => o.nombre.toLowerCase() === modalForm.medida.toLowerCase()) && (
                                            <div className="px-3 py-2.5 border-t bg-yellow-50 flex justify-between items-center">
                                                <span className="text-sm text-gray-600">No existe: <strong>{modalForm.medida}</strong></span>
                                                <button type="button" onClick={() => addMeasureOption(modalForm.medida)} className="text-sm text-yellow-600 font-medium hover:text-yellow-700">Agregar</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Hash size={14} /> Valor
                                </label>
                                <input
                                    type="text"
                                    name="valor"
                                    value={modalForm.valor}
                                    onChange={handleModalChange}
                                    className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                    setModalForm({ nombre: "", medida: "", valor: "" });
                                }}
                                className="bg-white border-2 border-gray-300 hover:bg-gray-50 px-8 py-2.5 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={agregarCaracteristica}
                                disabled={!modalForm.nombre}
                                className="bg-linear-to-r from-white to-yellow-300 px-8 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
