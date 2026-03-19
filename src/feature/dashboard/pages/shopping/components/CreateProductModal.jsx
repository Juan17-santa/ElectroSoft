import { useState, useEffect } from "react";
import {
    X, Package, Layers, DollarSign, Box,
    AlertCircle, CheckCircle2, Hash, ShieldCheck,
    Plus, Trash, Tag, ChevronDown
} from "lucide-react";
import { parseCOP } from "../helpers/shoppingHelpers";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import { ServicesCharacteristics } from "../../products/services/ServicesCharacteristics";
import CategorySelect from "../../../components/ui/CategorySelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";

// ─── Mini-componente: Indicador de validación ──────────────────────────────────
function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div
            className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${
                estado.valido ? "text-green-500" : "text-red-500"
            }`}
            style={{ minHeight: "16px" }}
        >
            {estado.valido
                ? <><CheckCircle2 size={12} /><span>Listo</span></>
                : <><AlertCircle size={12} /><span>{estado.mensaje}</span></>
            }
        </div>
    );
}

export default function CreateProductModal({ onClose, onSuccess }) {
    // ─── Estado principal ──────────────────────────────────────────────────────
    const [categoriasList, setCategoriasList] = useState([]);

    const [nombre, setNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [serial, setSerial] = useState("");
    const [garantia, setGarantia] = useState("");

    // ─── Características ───────────────────────────────────────────────────────
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [showCharModal, setShowCharModal] = useState(false);
    const [editingCharId, setEditingCharId] = useState(null);
    const [charForm, setCharForm] = useState({ nombre: "", medida: "", valor: "" });
    const [characteristicOptions, setCharacteristicOptions] = useState([]);
    const [measureOptions, setMeasureOptions] = useState([]);
    const [charDropdownOpen, setCharDropdownOpen] = useState(false);
    const [measDropdownOpen, setMeasDropdownOpen] = useState(false);

    // ─── Tocados — para no mostrar error antes de interactuar ─────────────────
    const [tocados, setTocados] = useState({
        nombre: false,
        categoriaId: false,
        precio: false,
        stock: false,
        serial: false,
        garantia: false,
    });

    // ─── Nombres de productos existentes (para validar duplicados) ────────────
    const [nombresExistentes, setNombresExistentes] = useState([]);

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        setCategoriasList(ServiceProductCategory.get());
        setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
        setMeasureOptions(ServicesCharacteristics.getMeasures());
        // Cargar nombres de productos ya creados para validar duplicados
        const productos = ServicesProducts.get();
        setNombresExistentes(productos.map((p) => p.nombre.trim().toLowerCase()));
    }, []);

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarNombre = (val) => {
        if (!val || val.trim() === "") return { valido: false, mensaje: "El nombre es obligatorio." };
        if (val.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
        if (val.trim().length > 100) return { valido: false, mensaje: "Máximo 100 caracteres." };
        if (nombresExistentes.includes(val.trim().toLowerCase()))
            return { valido: false, mensaje: "Ya existe un producto con ese nombre." };
        return { valido: true, mensaje: "" };
    };

    const validarCategoria = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona una categoría." };
        return { valido: true, mensaje: "" };
    };

    const validarPrecio = (val) => {
        if (!val) return { valido: false, mensaje: "El precio es obligatorio." };
        if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." };
        return { valido: true, mensaje: "" };
    };

    const validarStock = (val) => {
        if (val === "" || val === null || val === undefined)
            return { valido: false, mensaje: "El stock es obligatorio." };
        if (parseInt(val) < 0) return { valido: false, mensaje: "No puede ser negativo." };
        if (!Number.isInteger(Number(val))) return { valido: false, mensaje: "Debe ser un número entero." };
        return { valido: true, mensaje: "" };
    };

    const validarSerial = (val) => {
        if (!val || val.trim() === "") return { valido: false, mensaje: "El serial es obligatorio." };
        if (val.trim().length < 2) return { valido: false, mensaje: "Mínimo 2 caracteres." };
        if (val.trim().length > 50) return { valido: false, mensaje: "Máximo 50 caracteres." };
        if (!/^[a-zA-Z0-9_-]+$/.test(val.trim()))
            return { valido: false, mensaje: "Solo letras, números, guiones y guiones bajos." };
        return { valido: true, mensaje: "" };
    };

    const validarGarantia = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona una garantía." };
        if (!["3 meses", "6 meses", "12 meses"].includes(val))
            return { valido: false, mensaje: "Garantía no válida." };
        return { valido: true, mensaje: "" };
    };

    const estadoNombre    = tocados.nombre      ? validarNombre(nombre)         : null;
    const estadoCategoria = tocados.categoriaId ? validarCategoria(categoriaId) : null;
    const estadoPrecio    = tocados.precio      ? validarPrecio(precio)         : null;
    const estadoStock     = tocados.stock       ? validarStock(stock)           : null;
    const estadoSerial    = tocados.serial      ? validarSerial(serial)         : null;
    const estadoGarantia  = tocados.garantia    ? validarGarantia(garantia)     : null;

    const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

    // ─── Características: helpers ──────────────────────────────────────────────
    const handleSelectCharacteristic = (name) => {
        setCharForm((p) => ({ ...p, nombre: name }));
        setCharDropdownOpen(false);
    };

    const handleSelectMeasure = (name) => {
        setCharForm((p) => ({ ...p, medida: name }));
        setMeasDropdownOpen(false);
    };

    const addCharacteristicOption = (name) => {
        const added = ServicesCharacteristics.addCharacteristic(name);
        setCharacteristicOptions((prev) => [...prev, added]);
        setCharForm((p) => ({ ...p, nombre: added.nombre }));
        setCharDropdownOpen(false);
    };

    const removeCharacteristicOption = (id) => {
        const updated = ServicesCharacteristics.removeCharacteristic(id);
        setCharacteristicOptions(updated);
    };

    const addMeasureOption = (name) => {
        const added = ServicesCharacteristics.addMeasure(name);
        setMeasureOptions((prev) => [...prev, added]);
        setCharForm((p) => ({ ...p, medida: added.nombre }));
        setMeasDropdownOpen(false);
    };

    const removeMeasureOption = (id) => {
        const updated = ServicesCharacteristics.removeMeasure(id);
        setMeasureOptions(updated);
    };

    const abrirSubModal = (char) => {
        setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
        setMeasureOptions(ServicesCharacteristics.getMeasures());
        if (char) {
            setEditingCharId(char.id);
            setCharForm({
                nombre: char.nombre,
                medida: char.medida === "-" ? "" : char.medida,
                valor:  char.valor  === "-" ? "" : char.valor,
            });
        } else {
            setEditingCharId(null);
            setCharForm({ nombre: "", medida: "", valor: "" });
        }
        setCharDropdownOpen(true);
        setMeasDropdownOpen(true);
        setShowCharModal(true);
    };

    const cerrarSubModal = () => {
        setShowCharModal(false);
        setEditingCharId(null);
        setCharForm({ nombre: "", medida: "", valor: "" });
    };

    const guardarCaracteristica = () => {
        if (!charForm.nombre) return;
        if (editingCharId) {
            setCaracteristicas((prev) =>
                prev.map((c) =>
                    c.id === editingCharId
                        ? { ...c, nombre: charForm.nombre, medida: charForm.medida || "-", valor: charForm.valor || "-" }
                        : c
                )
            );
        } else {
            setCaracteristicas((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    nombre: charForm.nombre,
                    medida: charForm.medida || "-",
                    valor:  charForm.valor  || "-",
                    visible: true,
                },
            ]);
        }
        cerrarSubModal();
    };

    const eliminarCaracteristica = (id) => {
        setCaracteristicas((prev) => prev.filter((c) => c.id !== id));
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        setTocados({ nombre: true, categoriaId: true, precio: true, stock: true, serial: true, garantia: true });

        const ok =
            validarNombre(nombre).valido &&
            validarCategoria(categoriaId).valido &&
            validarPrecio(precio).valido &&
            validarStock(stock).valido &&
            validarSerial(serial).valido &&
            validarGarantia(garantia).valido;

        if (!ok) return;

        const nuevoProducto = ServicesProducts.create({
            nombre:      nombre.trim(),
            categoriaId: Number(categoriaId),
            precio:      parseCOP(precio),
            stock:       parseInt(stock),
            serial:      serial.trim(),
            garantia,
            caracteristicas,
        });

        if (onSuccess) onSuccess(nuevoProducto);
        onClose();
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* OVERLAY */}
            <div
                className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl z-10"
                onClick={onClose}
            />

            {/* TARJETA — scrollable */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none overflow-y-auto py-6">
                <div
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl pointer-events-auto border border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <p className="text-base font-semibold">
                                Crear nuevo <span className="text-yellow-400">producto</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Complete todos los campos obligatorios del formulario
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── CAMPOS PRINCIPALES ──────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">

                        {/* NOMBRE */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Package size={20} />
                                <span>Nombre del producto *</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: Bombillo LED 60W"
                                value={nombre}
                                onChange={(e) => { setNombre(e.target.value); tocar("nombre"); }}
                                onBlur={() => tocar("nombre")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoNombre === null
                                        ? "focus:ring-gray-400"
                                        : estadoNombre.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoNombre} />
                        </div>

                        {/* CATEGORÍA */}
                        <div className="flex flex-col gap-2">
                            <CategorySelect
                                label="Categoría"
                                icon={Layers}
                                options={categoriasList.filter((c) => c.estado)}
                                value={categoriaId}
                                onChange={(value) => { setCategoriaId(value); tocar("categoriaId"); }}
                                placeholder="Elige una categoría..."
                                width="w-full"
                                hasError={estadoCategoria !== null && !estadoCategoria.valido}
                            />
                            <FieldStatus estado={estadoCategoria} />
                        </div>

                        {/* PRECIO */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <DollarSign size={20} />
                                <span>Precio *</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                placeholder="Ej: 100000"
                                value={precio}
                                onChange={(e) => { setPrecio(e.target.value); tocar("precio"); }}
                                onBlur={() => tocar("precio")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoPrecio === null
                                        ? "focus:ring-gray-400"
                                        : estadoPrecio.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoPrecio} />
                        </div>

                        {/* STOCK */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Box size={20} />
                                <span>Stock *</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ej: 10"
                                value={stock}
                                onChange={(e) => { setStock(e.target.value); tocar("stock"); }}
                                onBlur={() => tocar("stock")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoStock === null
                                        ? "focus:ring-gray-400"
                                        : estadoStock.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoStock} />
                        </div>

                        {/* SERIAL — obligatorio */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <Hash size={20} />
                                <span>Serial *</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: SN12345ABC"
                                value={serial}
                                onChange={(e) => { setSerial(e.target.value); tocar("serial"); }}
                                onBlur={() => tocar("serial")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                                    ${estadoSerial === null
                                        ? "focus:ring-gray-400"
                                        : estadoSerial.valido
                                            ? "ring-1 ring-green-300"
                                            : "ring-1 ring-red-300"
                                    }`}
                            />
                            <FieldStatus estado={estadoSerial} />
                        </div>

                        {/* GARANTÍA — select obligatorio */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <ShieldCheck size={20} />
                                <span>Garantía *</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={garantia}
                                    onChange={(e) => { setGarantia(e.target.value); tocar("garantia"); }}
                                    onBlur={() => tocar("garantia")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer w-full appearance-none
                                        ${estadoGarantia === null
                                            ? "focus:ring-gray-400 text-gray-500"
                                            : estadoGarantia.valido
                                                ? "ring-1 ring-green-300 text-gray-700"
                                                : "ring-1 ring-red-300 text-gray-500"
                                        }`}
                                >
                                    <option value="">Seleccione una garantía</option>
                                    <option value="3 meses">3 meses</option>
                                    <option value="6 meses">6 meses</option>
                                    <option value="12 meses">12 meses</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                            <FieldStatus estado={estadoGarantia} />
                        </div>

                    </div>

                    {/* ── SECCIÓN CARACTERÍSTICAS ─────────────────────────── */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-700">
                                Características
                                <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
                            </p>
                            <button
                                type="button"
                                onClick={() => abrirSubModal(null)}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-white to-yellow-300 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:shadow-md transition cursor-pointer"
                            >
                                <Plus size={14} /> Añadir
                            </button>
                        </div>

                        <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-200 border-b-2 border-yellow-300">
                                    <tr className="text-left">
                                        <th className="px-4 py-2 font-semibold text-gray-700">Característica</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700">Medida</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700">Valor</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {caracteristicas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs">
                                                No hay características agregadas.
                                            </td>
                                        </tr>
                                    ) : (
                                        caracteristicas.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="px-4 py-2 text-gray-700">{item.nombre}</td>
                                                <td className="px-4 py-2 text-gray-700">{item.medida}</td>
                                                <td className="px-4 py-2 text-gray-700">{item.valor}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirSubModal(item)}
                                                            className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <Tag size={13} className="text-yellow-600" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarCaracteristica(item.id)}
                                                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <Trash size={13} className="text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BOTONES PRINCIPALES */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <PrimaryButton onClick={handleSubmit}>
                            Crear Producto
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* ── SUB-MODAL: AÑADIR / EDITAR CARACTERÍSTICA ─────────────── */}
            {showCharModal && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur-sm z-30"
                        onClick={cerrarSubModal}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
                        <div
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-base font-semibold">
                                    {editingCharId ? "Editar" : "Nueva"}{" "}
                                    <span className="text-yellow-400">característica</span>
                                </h2>
                                <button
                                    onClick={cerrarSubModal}
                                    className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-5">

                                {/* Característica */}
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs">
                                        <Package size={13} /> Característica *
                                    </label>
                                    <input
                                        type="text"
                                        value={charForm.nombre}
                                        onChange={(e) => setCharForm((p) => ({ ...p, nombre: e.target.value }))}
                                        onClick={() => setCharDropdownOpen(true)}
                                        onFocus={() => setCharDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setCharDropdownOpen(false), 200)}
                                        placeholder="Ej: Color"
                                        className="bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                    />
                                    {charDropdownOpen && (
                                        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-auto">
                                            {characteristicOptions
                                                .filter((o) => !charForm.nombre.trim() || o.nombre.toLowerCase().includes(charForm.nombre.toLowerCase()))
                                                .slice(0, 6)
                                                .map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleSelectCharacteristic(opt.nombre)}
                                                        className="flex justify-between items-center px-3 py-2 border-b border-gray-100 cursor-pointer text-sm text-gray-700 hover:bg-yellow-50 transition"
                                                    >
                                                        <span>{opt.nombre}</span>
                                                        <Trash
                                                            size={11}
                                                            className="text-red-400 hover:text-red-600"
                                                            onClick={(e) => { e.stopPropagation(); removeCharacteristicOption(opt.id); }}
                                                        />
                                                    </div>
                                                ))}
                                            {charForm.nombre.trim() && !characteristicOptions.some((o) => o.nombre.toLowerCase() === charForm.nombre.toLowerCase()) && (
                                                <div className="px-3 py-2 bg-yellow-50 flex justify-between items-center border-t">
                                                    <span className="text-xs text-gray-600">Crear: <strong>{charForm.nombre}</strong></span>
                                                    <button type="button" onClick={() => addCharacteristicOption(charForm.nombre)} className="text-xs text-yellow-600 font-medium hover:text-yellow-700">Agregar</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Medida */}
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs">
                                        <Tag size={13} /> Medida
                                    </label>
                                    <input
                                        type="text"
                                        value={charForm.medida}
                                        onChange={(e) => setCharForm((p) => ({ ...p, medida: e.target.value }))}
                                        onClick={() => setMeasDropdownOpen(true)}
                                        onFocus={() => setMeasDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setMeasDropdownOpen(false), 200)}
                                        placeholder="Ej: kg"
                                        className="bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                    />
                                    {measDropdownOpen && (
                                        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-auto">
                                            {measureOptions
                                                .filter((o) => !charForm.medida.trim() || o.nombre.toLowerCase().includes(charForm.medida.toLowerCase()))
                                                .slice(0, 6)
                                                .map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleSelectMeasure(opt.nombre)}
                                                        className="flex justify-between items-center px-3 py-2 border-b border-gray-100 cursor-pointer text-sm text-gray-700 hover:bg-yellow-50 transition"
                                                    >
                                                        <span>{opt.nombre}</span>
                                                        <Trash
                                                            size={11}
                                                            className="text-red-400 hover:text-red-600"
                                                            onClick={(e) => { e.stopPropagation(); removeMeasureOption(opt.id); }}
                                                        />
                                                    </div>
                                                ))}
                                            {charForm.medida.trim() && !measureOptions.some((o) => o.nombre.toLowerCase() === charForm.medida.toLowerCase()) && (
                                                <div className="px-3 py-2 bg-yellow-50 flex justify-between items-center border-t">
                                                    <span className="text-xs text-gray-600">Crear: <strong>{charForm.medida}</strong></span>
                                                    <button type="button" onClick={() => addMeasureOption(charForm.medida)} className="text-xs text-yellow-600 font-medium hover:text-yellow-700">Agregar</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Valor */}
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs">
                                        <Hash size={13} /> Valor
                                    </label>
                                    <input
                                        type="text"
                                        value={charForm.valor}
                                        onChange={(e) => setCharForm((p) => ({ ...p, valor: e.target.value }))}
                                        placeholder="Ej: Rojo"
                                        className="bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                                    />
                                </div>
                            </div> 

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={cerrarSubModal}
                                    className="bg-white border-2 border-gray-300 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={guardarCaracteristica}
                                    disabled={!charForm.nombre}
                                    className="bg-gradient-to-r from-white to-yellow-300 px-5 py-2 rounded-lg text-sm font-medium shadow hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {editingCharId ? "Actualizar" : "Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}