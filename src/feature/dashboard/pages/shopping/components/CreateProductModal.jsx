import { useState, useEffect } from "react";
import {
    X, Package, Layers, DollarSign, Box,
    AlertCircle, CheckCircle2, Hash, ShieldCheck,
    Plus, Trash, Tag, ChevronDown
} from "lucide-react";
import { parseCOP } from "../helpers/shoppingHelpers";
import { ServicesCharacteristics } from "../../products/services/ServicesCharacteristics";
import CategorySelect from "../../../components/ui/CategorySelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { ServicesShopping } from "../services/ServicesShopping";

// ─── Indicador de validación ───────────────────────────────────────────────────
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

    // ─── Campos principales ────────────────────────────────────────────────────
    const [categoriasList,    setCategoriasList]    = useState([]);
    const [nombre,            setNombre]            = useState("");
    const [categoriaId,       setCategoriaId]       = useState("");
    const [precio,            setPrecio]            = useState("");
    const [stock,             setStock]             = useState("");
    const [serial,            setSerial]            = useState("");
    const [garantia,          setGarantia]          = useState("");
    const [nombresExistentes, setNombresExistentes] = useState([]);
    const [saving,            setSaving]            = useState(false);
    const [apiError,          setApiError]          = useState("");

    // ─── Características ───────────────────────────────────────────────────────
    const [caracteristicas,       setCaracteristicas]       = useState([]);
    const [charForm,              setCharForm]              = useState({ nombre: "", medida: "", valor: "" });
    const [characteristicOptions, setCharacteristicOptions] = useState([]);
    const [measureOptions,        setMeasureOptions]        = useState([]);
    const [charDropdownOpen,      setCharDropdownOpen]      = useState(false);
    const [measDropdownOpen,      setMeasDropdownOpen]      = useState(false);

    // ─── Tocados ──────────────────────────────────────────────────────────────
    const [tocados, setTocados] = useState({
        nombre: false, categoriaId: false, precio: false,
        stock: false, serial: false, garantia: false,
    });

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        ServicesShopping.fetchCategories()
            .then((categories) => {
                if (mounted) setCategoriasList(categories.filter((category) => category.estado));
            })
            .catch((err) => {
                if (mounted) setApiError(err.message || "No se pudieron cargar las categorias.");
            });
        setCharacteristicOptions(ServicesCharacteristics.getCharacteristics());
        setMeasureOptions(ServicesCharacteristics.getMeasures());
        ServicesShopping.fetchProducts()
            .then((productos) => {
                if (mounted) setNombresExistentes(productos.map((p) => p.nombre.trim().toLowerCase()));
            })
            .catch(() => {
                if (mounted) setNombresExistentes([]);
            });
        return () => {
            mounted = false;
        };
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
    const validarCategoria = (val) => !val ? { valido: false, mensaje: "Selecciona una categoría." } : { valido: true, mensaje: "" };
    const validarPrecio    = (val) => { if (!val) return { valido: false, mensaje: "El precio es obligatorio." }; if (parseCOP(val) <= 0) return { valido: false, mensaje: "Debe ser mayor a 0." }; return { valido: true, mensaje: "" }; };
    const validarStock     = (val) => { if (val === "" || val === null || val === undefined) return { valido: false, mensaje: "El stock es obligatorio." }; if (parseInt(val) < 0) return { valido: false, mensaje: "No puede ser negativo." }; if (!Number.isInteger(Number(val))) return { valido: false, mensaje: "Debe ser un número entero." }; return { valido: true, mensaje: "" }; };
    const validarSerial    = (val) => { if (!val || val.trim() === "") return { valido: false, mensaje: "El serial es obligatorio." }; if (val.trim().length < 2) return { valido: false, mensaje: "Mínimo 2 caracteres." }; if (val.trim().length > 50) return { valido: false, mensaje: "Máximo 50 caracteres." }; if (!/^[a-zA-Z0-9_-]+$/.test(val.trim())) return { valido: false, mensaje: "Solo letras, números, guiones y guiones bajos." }; return { valido: true, mensaje: "" }; };
    const validarGarantia  = (val) => { if (!val) return { valido: false, mensaje: "Selecciona una garantía." }; if (!["3 meses", "6 meses", "12 meses"].includes(val)) return { valido: false, mensaje: "Garantía no válida." }; return { valido: true, mensaje: "" }; };

    const estadoNombre    = tocados.nombre      ? validarNombre(nombre)         : null;
    const estadoCategoria = tocados.categoriaId ? validarCategoria(categoriaId) : null;
    const estadoPrecio    = tocados.precio      ? validarPrecio(precio)         : null;
    const estadoStock     = tocados.stock       ? validarStock(stock)           : null;
    const estadoSerial    = tocados.serial      ? validarSerial(serial)         : null;
    const estadoGarantia  = tocados.garantia    ? validarGarantia(garantia)     : null;

    const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

    // ─── Helpers para dropdowns de características ─────────────────────────────
    const handleSelectCharacteristic = (name) => { setCharForm((p) => ({ ...p, nombre: name })); setCharDropdownOpen(false); };
    const handleSelectMeasure        = (name) => { setCharForm((p) => ({ ...p, medida: name })); setMeasDropdownOpen(false); };

    const addCharacteristicOption = (name) => {
        const added = ServicesCharacteristics.addCharacteristic(name);
        setCharacteristicOptions((prev) => [...prev, added]);
        setCharForm((p) => ({ ...p, nombre: added.nombre }));
        setCharDropdownOpen(false);
    };
    const removeCharacteristicOption = (id) => setCharacteristicOptions(ServicesCharacteristics.removeCharacteristic(id));

    const addMeasureOption = (name) => {
        const added = ServicesCharacteristics.addMeasure(name);
        setMeasureOptions((prev) => [...prev, added]);
        setCharForm((p) => ({ ...p, medida: added.nombre }));
        setMeasDropdownOpen(false);
    };
    const removeMeasureOption = (id) => setMeasureOptions(ServicesCharacteristics.removeMeasure(id));

    // ─── Añadir / eliminar característica ─────────────────────────────────────
    const agregarCaracteristica = () => {
        if (!charForm.nombre.trim() || !charForm.valor.trim()) return;
        setCaracteristicas((prev) => [
            ...prev,
            { id: Date.now(), nombre: charForm.nombre.trim(), medida: charForm.medida.trim() || "-", valor: charForm.valor.trim(), visible: true },
        ]);
        setCharForm({ nombre: "", medida: "", valor: "" });
    };
    const eliminarCaracteristica = (id) => setCaracteristicas((prev) => prev.filter((c) => c.id !== id));
    const toggleVisibilidad = (id) => setCaracteristicas((prev) => prev.map((c) => c.id === id ? { ...c, visible: !c.visible } : c));

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setTocados({ nombre: true, categoriaId: true, precio: true, stock: true, serial: true, garantia: true });
        const ok = validarNombre(nombre).valido && validarCategoria(categoriaId).valido && validarPrecio(precio).valido && validarStock(stock).valido && validarSerial(serial).valido && validarGarantia(garantia).valido;
        if (!ok) return;
        setSaving(true);
        setApiError("");
        try {
            const nuevoProducto = await ServicesShopping.createProduct({
                nombre: nombre.trim(),
                categoriaId,
                precio: parseCOP(precio),
                stock: parseInt(stock),
                tipoStock: "unidad",
                serial: serial.trim(),
                garantia,
                caracteristicas,
            });
            if (onSuccess) onSuccess(nuevoProducto);
            onClose();
        } catch (err) {
            setApiError(err.message || "No se pudo crear el producto.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl z-10" onClick={onClose} />

            {/* TARJETA scrollable */}
            <div className="absolute inset-0 flex items-start justify-center z-20 pointer-events-none overflow-y-auto py-6">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl pointer-events-auto border border-gray-300" onClick={(e) => e.stopPropagation()}>

                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-base font-semibold">Crear nuevo <span className="text-yellow-400">producto</span></p>
                            <p className="text-xs text-gray-500 mt-0.5">Complete todos los campos obligatorios del formulario</p>
                        </div>
                        <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"><X size={18} /></button>
                    </div>

                    {/* CAMPOS PRINCIPALES — grid 2 columnas */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                        {/* NOMBRE */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Package size={18} /><span>Nombre del producto *</span></div>
                            <input type="text" placeholder="Ej: Bombillo LED 60W" value={nombre}
                                onChange={(e) => { setNombre(e.target.value); tocar("nombre"); }}
                                onBlur={() => tocar("nombre")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${estadoNombre === null ? "focus:ring-gray-400" : estadoNombre.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`} />
                            <FieldStatus estado={estadoNombre} />
                        </div>

                        {/* CATEGORÍA */}
                        <div className="flex flex-col text-sm">
                            <CategorySelect
                                label="Categoría" icon={Layers}
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
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><DollarSign size={18} /><span>Precio *</span></div>
                            <input type="number" min="1" placeholder="Ej: 100000" value={precio}
                                onChange={(e) => { setPrecio(e.target.value); tocar("precio"); }}
                                onBlur={() => tocar("precio")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${estadoPrecio === null ? "focus:ring-gray-400" : estadoPrecio.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`} />
                            <FieldStatus estado={estadoPrecio} />
                        </div>

                        {/* STOCK */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Box size={18} /><span>Stock *</span></div>
                            <input type="number" min="0" placeholder="Ej: 10" value={stock}
                                onChange={(e) => { setStock(e.target.value); tocar("stock"); }}
                                onBlur={() => tocar("stock")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${estadoStock === null ? "focus:ring-gray-400" : estadoStock.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`} />
                            <FieldStatus estado={estadoStock} />
                        </div>

                        {/* SERIAL */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><Hash size={18} /><span>Serial *</span></div>
                            <input type="text" placeholder="Ej: SN12345ABC" value={serial}
                                onChange={(e) => { setSerial(e.target.value); tocar("serial"); }}
                                onBlur={() => tocar("serial")}
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${estadoSerial === null ? "focus:ring-gray-400" : estadoSerial.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300"}`} />
                            <FieldStatus estado={estadoSerial} />
                        </div>

                        {/* GARANTÍA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium"><ShieldCheck size={18} /><span>Garantía *</span></div>
                            <div className="relative">
                                <select value={garantia}
                                    onChange={(e) => { setGarantia(e.target.value); tocar("garantia"); }}
                                    onBlur={() => tocar("garantia")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all cursor-pointer w-full appearance-none ${estadoGarantia === null ? "focus:ring-gray-400 text-gray-500" : estadoGarantia.valido ? "ring-1 ring-green-300 text-gray-700" : "ring-1 ring-red-300 text-gray-500"}`}>
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

                    {apiError && <p className="text-xs text-red-500 mt-3">{apiError}</p>}

                    {/* SECCIÓN CARACTERÍSTICAS */}
                    <div className="mt-6 border-2 border-yellow-300 rounded-xl p-5 bg-gradient-to-b from-yellow-50 to-transparent">
                        <p className="text-sm font-semibold text-yellow-600 mb-4">
                            Características <span className="text-xs font-normal text-gray-400">(opcional)</span>
                        </p>

                        {/* Formulario inline — 3 columnas */}
                        <div className="grid grid-cols-3 gap-4 mb-4">

                            {/* Característica con dropdown */}
                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs"><Package size={13} /> Característica *</label>
                                <div className="relative">
                                    <input type="text" value={charForm.nombre}
                                        onChange={(e) => setCharForm((p) => ({ ...p, nombre: e.target.value }))}
                                        onClick={() => setCharDropdownOpen(true)}
                                        onFocus={() => setCharDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setCharDropdownOpen(false), 200)}
                                        placeholder="Seleccionar o crear"
                                        className="bg-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                                    {charDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto z-10 mt-1">
                                            {characteristicOptions
                                                .filter((o) => !charForm.nombre.trim() || o.nombre.toLowerCase().includes(charForm.nombre.toLowerCase()))
                                                .slice(0, 6)
                                                .map((opt) => (
                                                    <div key={opt.id} onClick={() => handleSelectCharacteristic(opt.nombre)}
                                                        className="flex justify-between items-center px-3 py-2 border-b border-gray-100 cursor-pointer text-sm text-gray-700 hover:bg-yellow-50 transition">
                                                        <span>{opt.nombre}</span>
                                                        <Trash size={11} className="text-red-400 hover:text-red-600"
                                                            onClick={(e) => { e.stopPropagation(); removeCharacteristicOption(opt.id); }} />
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
                            </div>

                            {/* Medida con dropdown */}
                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs"><Tag size={13} /> Medida</label>
                                <div className="relative">
                                    <input type="text" value={charForm.medida}
                                        onChange={(e) => setCharForm((p) => ({ ...p, medida: e.target.value }))}
                                        onClick={() => setMeasDropdownOpen(true)}
                                        onFocus={() => setMeasDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setMeasDropdownOpen(false), 200)}
                                        placeholder="Ej: kg"
                                        className="bg-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                                    {measDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto z-10 mt-1">
                                            {measureOptions
                                                .filter((o) => !charForm.medida.trim() || o.nombre.toLowerCase().includes(charForm.medida.toLowerCase()))
                                                .slice(0, 6)
                                                .map((opt) => (
                                                    <div key={opt.id} onClick={() => handleSelectMeasure(opt.nombre)}
                                                        className="flex justify-between items-center px-3 py-2 border-b border-gray-100 cursor-pointer text-sm text-gray-700 hover:bg-yellow-50 transition">
                                                        <span>{opt.nombre}</span>
                                                        <Trash size={11} className="text-red-400 hover:text-red-600"
                                                            onClick={(e) => { e.stopPropagation(); removeMeasureOption(opt.id); }} />
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
                            </div>

                            {/* Valor */}
                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-1.5 text-yellow-500 font-medium text-xs"><Hash size={13} /> Valor *</label>
                                <input type="text" value={charForm.valor}
                                    onChange={(e) => setCharForm((p) => ({ ...p, valor: e.target.value }))}
                                    placeholder="Ej: Rojo"
                                    className="bg-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                            </div>

                        </div>

                        {/* Botón añadir */}
                        <div className="flex justify-end">
                            <button type="button" onClick={agregarCaracteristica}
                                disabled={!charForm.nombre.trim() || !charForm.valor.trim()}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-white to-yellow-300 px-4 py-2 rounded-lg text-sm font-medium shadow hover:shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <Plus size={14} /> Añadir característica
                            </button>
                        </div>

                        {/* Tabla */}
                        <div className="mt-4 bg-white rounded-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b-2 border-yellow-300">
                                    <tr className="text-left">
                                        <th className="px-4 py-2 font-semibold text-gray-700">Característica</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700">Medida</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700">Valor</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700 text-center">Visible</th>
                                        <th className="px-4 py-2 font-semibold text-gray-700 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caracteristicas.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400 text-xs">No hay características agregadas.</td></tr>
                                    ) : (
                                        caracteristicas.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="px-4 py-2 text-gray-700">{item.nombre}</td>
                                                <td className="px-4 py-2 text-gray-700">{item.medida}</td>
                                                <td className="px-4 py-2 text-gray-700">{item.valor}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button type="button" onClick={() => toggleVisibilidad(item.id)}
                                                        className={`p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${item.visible ? "bg-yellow-100 hover:bg-yellow-200" : "bg-gray-100 hover:bg-gray-200"}`}
                                                        title={item.visible ? "Ocultar en detalle" : "Mostrar en detalle"}>
                                                        <svg className={`w-4 h-4 ${item.visible ? "text-yellow-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button type="button" onClick={() => eliminarCaracteristica(item.id)}
                                                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer" title="Eliminar">
                                                        <Trash size={13} className="text-red-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-between mt-6">
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer">Cancelar</button>
                        <PrimaryButton onClick={handleSubmit} disabled={saving}>
                            {saving ? "Creando..." : "Crear Producto"}
                        </PrimaryButton>
                    </div>

                </div>
            </div>
        </>
    );
}
