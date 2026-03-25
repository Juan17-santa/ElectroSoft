import { Package, Tag, DollarSign, Boxes, Hash, ShieldCheck, X, Plus, Trash, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import Alert from "../../../components/ui/Alert";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import CategorySelect from "../../../components/ui/CategorySelect";
import useProductForm from "../hooks/useProductForm";
import { ServicesCharacteristics } from "../services/ServicesCharacteristics";
import CustomSelect from "../../../components/ui/CustomSelect";
import ValidationMessage from "../../../components/ui/ValidationMessage";

export default function CreateProducts() {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [modalForm, setModalForm] = useState({
        nombre: "",
        medida: "",
        valor: ""
    });
    const [characteristicOptions, setCharacteristicOptions] = useState([]);
    const [measureOptions, setMeasureOptions] = useState([]);
    const [charDropdownOpen, setCharDropdownOpen] = useState(false);
    const [measDropdownOpen, setMeasDropdownOpen] = useState(false);
    const [characteristicErrors, setCharacteristicErrors] = useState({});
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
        const { name, value } = e.target;
        setModalForm({
            ...modalForm,
            [name]: value
        });

        // Validar en tiempo real
        validateCharacteristicField(name, value);
    };

    const validateCharacteristicField = (name, value) => {
        let error = "";

        if (name === "nombre") {
            if (!value || !value.trim()) {
                error = "La característica es obligatoria";
            } else if (/\d/.test(value)) {
                error = "No se permiten números";
            } else if (!/^[a-zA-Z\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
                error = "Caracteres inválidos";
            } else if (value.trim().length < 2) {
                error = "Mínimo 2 caracteres";
            } else if (caracteristicas.some(c => c.nombre.toLowerCase() === value.trim().toLowerCase())) {
                error = "Esta característica ya existe";
            } else {
                error = "";
            }
        } else if (name === "medida") {
            if (value && !/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
                error = "Caracteres inválidos en medida";
            } else {
                error = "";
            }
        } else if (name === "valor") {
            if (!value || !value.trim()) {
                error = "El valor es obligatorio";
            } else if (!/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ.,()%]+$/.test(value)) {
                error = "Caracteres inválidos en valor";
            } else {
                error = "";
            }
        }

        setCharacteristicErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSelectCharacteristic = (name) => {
        setModalForm(prev => ({ ...prev, nombre: name }));
        validateCharacteristicField("nombre", name);
    };

    const handleSelectMeasure = (name) => {
        setModalForm(prev => ({ ...prev, medida: name }));
        validateCharacteristicField("medida", name);
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
        // Validar todos los campos
        let hasErrors = false;
        const newErrors = {};

        // Validar nombre
        if (!modalForm.nombre || !modalForm.nombre.trim()) {
            newErrors.nombre = "La característica es obligatoria";
            hasErrors = true;
        } else if (/\d/.test(modalForm.nombre)) {
            newErrors.nombre = "No se permiten números";
            hasErrors = true;
        } else if (!/^[a-zA-Z\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(modalForm.nombre)) {
            newErrors.nombre = "Caracteres inválidos";
            hasErrors = true;
        } else if (modalForm.nombre.trim().length < 2) {
            newErrors.nombre = "Mínimo 2 caracteres";
            hasErrors = true;
        } else if (caracteristicas.some(c => c.nombre.toLowerCase() === modalForm.nombre.trim().toLowerCase())) {
            newErrors.nombre = "Esta característica ya existe";
            hasErrors = true;
        }

        // Validar medida (opcional pero debe ser válida si está rellenada)
        if (modalForm.medida && !/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(modalForm.medida)) {
            newErrors.medida = "Caracteres inválidos en medida";
            hasErrors = true;
        }

        // Validar valor
        if (!modalForm.valor || !modalForm.valor.trim()) {
            newErrors.valor = "El valor es obligatorio";
            hasErrors = true;
        } else if (!/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ.,()%]+$/.test(modalForm.valor)) {
            newErrors.valor = "Caracteres inválidos en valor";
            hasErrors = true;
        }

        // Si hay errores, mostrarlos y no agregar
        if (hasErrors) {
            setCharacteristicErrors(newErrors);
            setAlert({ type: "error", message: "Corrija los errores antes de continuar" });
            return;
        }

        // Agregar la característica a la lista
        const nuevo = {
            id: Date.now(),
            nombre: modalForm.nombre.trim(),
            medida: modalForm.medida.trim() || "-",
            valor: modalForm.valor.trim(),
            visible: true
        };
        setCaracteristicas([...caracteristicas, nuevo]);

        // Limpiar campos y errores
        setModalForm({ nombre: "", medida: "", valor: "" });
        setCharacteristicErrors({});

        setTimeout(() => {
            setAlert({
                type: "success",
                message: "Característica agregada correctamente"
            });
        }, 100);
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
                <div className="grid grid-cols-3 gap-12 mt-6 px-20">

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
                            placeholder="Digite el precio"
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
                            placeholder="Digite el stock"
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
                            <Hash size={16} /> Serial *
                        </label>
                        <input
                            name="serial"
                            value={formData.serial}
                            onChange={handleChange}
                            type="text"
                            placeholder="Digite el serial"
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

                    {/* CAMPOS DE CARACTERÍSTICAS */}
                    <div className="col-span-3 border-2 border-yellow-300 rounded-xl p-6 bg-linear-to-b from-yellow-50 to-transparent">
                        <p className="text-sm font-semibold text-yellow-600 mb-4">Agregar Características</p>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Package size={16} /> Característica *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={modalForm.nombre}
                                        onChange={(e) => { handleModalChange(e); }}
                                        onClick={() => setCharDropdownOpen(true)}
                                        onFocus={() => setCharDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setCharDropdownOpen(false), 200)}
                                        placeholder="Seleccionar o crear"
                                        className={`bg-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-md w-full border-2 ${characteristicErrors.nombre ? 'border-red-500' : 'border-transparent'
                                            } focus:border-yellow-400 focus:outline-none`}
                                    />
                                    {charDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-10 mt-1">
                                            {characteristicOptions
                                                .filter(o => !modalForm.nombre.trim() || o.nombre.toLowerCase().includes(modalForm.nombre.toLowerCase()))
                                                .slice(0, 6)
                                                .map(opt => (
                                                    <div key={opt.id} onClick={() => handleSelectCharacteristic(opt.nombre)} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200 cursor-pointer text-sm text-gray-700 hover:bg-yellow-100 transition">
                                                        <span>{opt.nombre}</span>
                                                        <Trash size={12} className="text-red-500 hover:text-red-700 cursor-pointer" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeCharacteristicOption(opt.id); }} />
                                                    </div>
                                                ))}
                                            {modalForm.nombre.trim() && !characteristicOptions.some(o => o.nombre.toLowerCase() === modalForm.nombre.toLowerCase()) && (
                                                <div className="px-4 py-2.5 border-t bg-yellow-50 flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">No existe: <strong>{modalForm.nombre}</strong></span>
                                                    <button type="button" disabled={!!characteristicErrors.nombre} onClick={() => addCharacteristicOption(modalForm.nombre)} className={`text-sm font-medium ${characteristicErrors.nombre
                                                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                                                        : 'text-yellow-600 hover:text-yellow-700'
                                                        }`}>Agregar</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {characteristicErrors.nombre && (
                                    <p className="text-red-500 text-xs">{characteristicErrors.nombre}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Tag size={16} /> Medida
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="medida"
                                        value={modalForm.medida}
                                        onChange={(e) => { handleModalChange(e); }}
                                        onClick={() => setMeasDropdownOpen(true)}
                                        onFocus={() => setMeasDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setMeasDropdownOpen(false), 200)}
                                        placeholder="Seleccionar o crear"
                                        className={`bg-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-md w-full border-2 ${characteristicErrors.medida ? 'border-red-500' : 'border-transparent'
                                            } focus:border-yellow-400 focus:outline-none`}
                                    />
                                    {measDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-10 mt-1">
                                            {measureOptions
                                                .filter(o => !modalForm.medida.trim() || o.nombre.toLowerCase().includes(modalForm.medida.toLowerCase()))
                                                .slice(0, 6)
                                                .map(opt => (
                                                    <div key={opt.id} onClick={() => handleSelectMeasure(opt.nombre)} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200 cursor-pointer text-sm text-gray-700 hover:bg-yellow-100 transition">
                                                        <span>{opt.nombre}</span>
                                                        <Trash size={12} className="text-red-500 hover:text-red-700 cursor-pointer" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeMeasureOption(opt.id); }} />
                                                    </div>
                                                ))}
                                            {modalForm.medida.trim() && !measureOptions.some(o => o.nombre.toLowerCase() === modalForm.medida.toLowerCase()) && (
                                                <div className="px-4 py-2.5 border-t bg-yellow-50 flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">No existe: <strong>{modalForm.medida}</strong></span>
                                                    <button type="button" disabled={!!characteristicErrors.medida} onClick={() => addMeasureOption(modalForm.medida)} className={`text-sm font-medium ${characteristicErrors.medida
                                                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                                                        : 'text-yellow-600 hover:text-yellow-700'
                                                        }`}>Agregar</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {characteristicErrors.medida && (
                                    <p className="text-red-500 text-xs">{characteristicErrors.medida}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                    <Hash size={16} /> Valor *
                                </label>
                                <input
                                    type="text"
                                    name="valor"
                                    value={modalForm.valor}
                                    onChange={handleModalChange}
                                    placeholder="Ingresar valor"
                                    className={`bg-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-md w-full border-2 ${characteristicErrors.valor ? 'border-red-500' : 'border-transparent'
                                        } focus:border-yellow-400 focus:outline-none`}
                                />
                                {characteristicErrors.valor && (
                                    <p className="text-red-500 text-xs">{characteristicErrors.valor}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    agregarCaracteristica();
                                    setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
                                    setMeasureOptions(ServicesCharacteristics.getMeasures());
                                }}
                                className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 px-6 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!modalForm.nombre || !modalForm.valor || !!characteristicErrors.nombre || !!characteristicErrors.medida || !!characteristicErrors.valor}
                            >
                                <Plus size={16} /> Añadir Característica
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLA DE CARACTERÍSTICAS */}
                <div className="px-20 mt-6">
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
