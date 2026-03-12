import { useState, useEffect } from "react";
import {
    X, IdCard, FileText, User, Phone,
    AlertCircle, CheckCircle2, Truck, Tag,
} from "lucide-react";
import { ServicesProviders } from "../../providers/services/ServicesProviders";
import PrimaryButton from "../../../components/ui/PrimaryButton";

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
                : <><AlertCircle  size={12} /><span>{estado.mensaje}</span></>
            }
        </div>
    );
}

// ─── Clase dinámica del ring ───────────────────────────────────────────────────
function ring(estado) {
    if (estado === null) return "focus:ring-gray-400";
    return estado.valido
        ? "ring-1 ring-green-300 focus:ring-green-400"
        : "ring-1 ring-red-300 focus:ring-red-400";
}

export default function CreateProviderModal({ onClose, onSuccess }) {
    // ─── Campos ────────────────────────────────────────────────────────────────
    const [tipoDoc,            setTipoDoc]            = useState("");
    const [documento,          setDocumento]          = useState("");
    const [nombreProveedor,    setNombreProveedor]    = useState("");
    const [nombreContacto,     setNombreContacto]     = useState("");
    const [telefonoContacto,   setTelefonoContacto]   = useState("");
    const [categoriaId,        setCategoriaId]        = useState("");

    // ─── Datos auxiliares ──────────────────────────────────────────────────────
    const [categoriasList,       setCategoriasList]       = useState([]);
    const [documentosExistentes, setDocumentosExistentes] = useState([]);
    const [nombresExistentes,    setNombresExistentes]    = useState([]);

    // ─── Tocados ───────────────────────────────────────────────────────────────
    const [tocados, setTocados] = useState({
        tipoDoc: false, documento: false, nombreProveedor: false,
        nombreContacto: false, telefonoContacto: false,
    });

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        const cats = JSON.parse(localStorage.getItem("productCategory") || "[]");
        setCategoriasList(cats);
        const proveedores = ServicesProviders.get();
        setDocumentosExistentes(proveedores.map((p) => p.documento.trim().toLowerCase()));
        setNombresExistentes(proveedores.map((p) => p.nombreProveedor.trim().toLowerCase()));
    }, []);

    const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarTipoDoc = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona un tipo de documento." };
        return { valido: true, mensaje: "" };
    };

    const validarDocumento = (val) => {
        if (!val || !val.trim())
            return { valido: false, mensaje: "El documento es obligatorio." };
        if (!/^\d+$/.test(val))
            return { valido: false, mensaje: "Solo se permiten números." };
        if (val.length < 8 || val.length > 12)
            return { valido: false, mensaje: "Debe tener entre 8 y 12 dígitos." };
        if (documentosExistentes.includes(val.trim().toLowerCase()))
            return { valido: false, mensaje: "Ya existe un proveedor con ese documento." };
        return { valido: true, mensaje: "" };
    };

    const validarNombreProveedor = (val) => {
        if (!val || !val.trim())
            return { valido: false, mensaje: "El nombre del proveedor es obligatorio." };
        if (val.trim().length < 3)
            return { valido: false, mensaje: "Mínimo 3 caracteres." };
        if (!/^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&-]+$/.test(val.trim()))
            return { valido: false, mensaje: "Solo letras, números y símbolos (., &, -)." };
        if (nombresExistentes.includes(val.trim().toLowerCase()))
            return { valido: false, mensaje: "Ya existe un proveedor con ese nombre." };
        return { valido: true, mensaje: "" };
    };

    const validarNombreContacto = (val) => {
        if (!val || !val.trim())
            return { valido: false, mensaje: "El nombre de contacto es obligatorio." };
        if (val.trim().length < 3)
            return { valido: false, mensaje: "Mínimo 3 caracteres." };
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val.trim()))
            return { valido: false, mensaje: "Solo se permiten letras." };
        return { valido: true, mensaje: "" };
    };

    const validarTelefono = (val) => {
        if (!val || !val.trim())
            return { valido: false, mensaje: "El teléfono es obligatorio." };
        if (!/^\d+$/.test(val))
            return { valido: false, mensaje: "Solo se permiten números." };
        if (val.length < 8 || val.length > 14)
            return { valido: false, mensaje: "Debe tener entre 8 y 14 dígitos." };
        return { valido: true, mensaje: "" };
    };

    const estadoTipoDoc   = tocados.tipoDoc          ? validarTipoDoc(tipoDoc)                : null;
    const estadoDocumento = tocados.documento        ? validarDocumento(documento)             : null;
    const estadoNombre    = tocados.nombreProveedor  ? validarNombreProveedor(nombreProveedor) : null;
    const estadoContacto  = tocados.nombreContacto   ? validarNombreContacto(nombreContacto)   : null;
    const estadoTelefono  = tocados.telefonoContacto ? validarTelefono(telefonoContacto)       : null;

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        setTocados({
            tipoDoc: true, documento: true, nombreProveedor: true,
            nombreContacto: true, telefonoContacto: true,
        });

        const ok =
            validarTipoDoc(tipoDoc).valido               &&
            validarDocumento(documento).valido            &&
            validarNombreProveedor(nombreProveedor).valido &&
            validarNombreContacto(nombreContacto).valido   &&
            validarTelefono(telefonoContacto).valido;

        if (!ok) return;

        // categoriasAsociadas espera un array; guardamos la categoría seleccionada
        // dentro de un array para mantener compatibilidad con el modelo de datos
        const categoriasAsociadas = categoriaId ? [Number(categoriaId)] : [];

        const nuevoProveedor = ServicesProviders.create({
            tipoDoc,
            documento:        documento.trim(),
            nombreProveedor:  nombreProveedor.trim(),
            nombreContacto:   nombreContacto.trim(),
            telefonoContacto: telefonoContacto.trim(),
            categoriasAsociadas,
        });

        if (onSuccess) onSuccess(nuevoProveedor);
        onClose();
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-gray-200 max-h-screen overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-1">
                    <div>
                        <p className="text-base font-semibold flex items-center gap-2">
                            <Truck size={18} className="text-yellow-400" />
                            Crear nuevo <span className="text-yellow-400">proveedor</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Complete todos los campos obligatorios del formulario
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CAMPOS */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">

                    {/* TIPO DOCUMENTO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <IdCard size={18} />
                            <span>Tipo de documento *</span>
                        </div>
                        <select
                            value={tipoDoc}
                            onChange={(e) => { setTipoDoc(e.target.value); tocar("tipoDoc"); }}
                            onBlur={() => tocar("tipoDoc")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer ${ring(estadoTipoDoc)}`}
                        >
                            <option value="">— Seleccionar —</option>
                            <option value="NIT">NIT</option>
                            <option value="CC">C.C</option>
                            <option value="CE">C.E</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                        <FieldStatus estado={estadoTipoDoc} />
                    </div>

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <FileText size={18} />
                            <span>Documento *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: 900123456"
                            value={documento}
                            onChange={(e) => { setDocumento(e.target.value.replace(/\D/g, "")); tocar("documento"); }}
                            onBlur={() => tocar("documento")}
                            maxLength={12}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoDocumento)}`}
                        />
                        <FieldStatus estado={estadoDocumento} />
                    </div>

                    {/* NOMBRE PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <User size={18} />
                            <span>Nombre proveedor *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: Distribuidora ABC S.A."
                            value={nombreProveedor}
                            onChange={(e) => { setNombreProveedor(e.target.value); tocar("nombreProveedor"); }}
                            onBlur={() => tocar("nombreProveedor")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoNombre)}`}
                        />
                        <FieldStatus estado={estadoNombre} />
                    </div>

                    {/* CATEGORÍA ASOCIADA */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Tag size={18} />
                            <span>Categoría asociada</span>
                            <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                        </div>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 cursor-pointer"
                        >
                            <option value="">— Sin categoría —</option>
                            {categoriasList.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                        {/* Espacio reservado para alinear con los otros campos que tienen FieldStatus */}
                        <div style={{ minHeight: "16px" }} />
                    </div>

                    {/* NOMBRE CONTACTO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <User size={18} />
                            <span>Nombre contacto *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: Carlos Rodríguez"
                            value={nombreContacto}
                            onChange={(e) => { setNombreContacto(e.target.value); tocar("nombreContacto"); }}
                            onBlur={() => tocar("nombreContacto")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoContacto)}`}
                        />
                        <FieldStatus estado={estadoContacto} />
                    </div>

                    {/* TELÉFONO CONTACTO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Phone size={18} />
                            <span>Teléfono contacto *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: 3001234567"
                            value={telefonoContacto}
                            onChange={(e) => { setTelefonoContacto(e.target.value.replace(/\D/g, "")); tocar("telefonoContacto"); }}
                            onBlur={() => tocar("telefonoContacto")}
                            maxLength={14}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoTelefono)}`}
                        />
                        <FieldStatus estado={estadoTelefono} />
                    </div>

                </div>

                {/* BOTONES */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white border-2 border-gray-300 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <PrimaryButton type="button" onClick={handleSubmit}>
                        Crear proveedor
                    </PrimaryButton>
                </div>

            </div>
        </div>
    );
}