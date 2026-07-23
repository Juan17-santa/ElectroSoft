import {
    AlertTriangle, Box, Boxes, Wrench, User,
    ShieldCheck, FileText, CalendarDays, ClipboardList, Tag,
    GitBranch, AlertCircle, CheckCircle2, DollarSign,
    Plus
} from "lucide-react";
import Calendar, { formatearFecha } from "../../../components/ui/Calendar";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import GarantiaCheckbox from "./GarantiaCheckbox";
import {
    MOTIVOS, SUBMOTIVOS, CONDICIONES_PRODUCTO, GESTIONES,
    RESPONSABLES, ESTADOS_RESOLUCION,
    getGestionesPermitidas, getCondicionesPermitidas,
} from "../helpers/devolutionsHelpers";
import { ArrowLeft } from "lucide-react";

// ─── Definidos FUERA del componente para evitar remontaje y scroll reset ──────

/**
 * Wrapper de campo con ícono + label amarillo.
 * ⚠️ NUNCA mover esto dentro de DevolutionForm.
 */
function Field({ icon: Icon, label, children, className = "" }) {
    return (
        <div className={`flex flex-col ${className}`}>
            <p className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
                <Icon size={20} />
                {label}
            </p>
            {children}
        </div>
    );
}

/**
 * Indicador visual de validación, idéntico al patrón de CreateShopping.
 * estado = null                → no renderiza nada (campo sin tocar)
 * estado = { valido: true }    → ícono verde + "Listo"
 * estado = { valido: false }   → ícono rojo + mensaje de error
 */
function FieldStatus({ estado }) {
    if (estado === null || estado === undefined) return null;
    return (
        <div className={`flex items-center gap-1 text-xs mt-1 ${
            estado.valido ? "text-green-500" : "text-red-500"
        }`}>
            {estado.valido
                ? <CheckCircle2 size={12} />
                : <AlertCircle  size={12} />
            }
            <span>{estado.valido ? "Listo" : estado.mensaje}</span>
        </div>
    );
}

/** Clase dinámica del ring según estado de validación */
function ring(estado) {
    if (!estado) return "focus:ring-gray-400";
    return estado.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300";
}

/** Bloquea caracteres no numéricos (e, -, +, .) en campos tipo number */
function blockInvalidKeys(e) {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

function formatFechaDisplay(fechaISO) {
    if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return "—";
    const [y, m, d] = fechaISO.split("-");
    return `${d}/${m}/${y}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Formulario reutilizable de devolución.
 *
 * Props:
 *  form             — objeto con todos los valores
 *  onChange         — (field, value) => void
 *  onSubmit         — () => void
 *  onCancel         — () => void
 *  readOnly         — boolean: deshabilita campos y oculta botón guardar
 *  title            — string
 *  submitText       — string
 *  productosList    — array de productos disponibles para el select
 *  ventasList       — array de ventas para VentaSearchSelect
 *  estadoCampo      — (campo) => { valido, mensaje } | null  (validación)
 *  onFieldBlur      — (campo) => void  (marcar campo como tocado al salir)
 *  sinProductos     — boolean: muestra aviso "sin productos disponibles"
 *  readOnlyFields   — array: campos que no pueden editarse (ej: ["idVenta", "producto"])
 */
export default function DevolutionForm({
    form,
    onChange,
    onSubmit,
    onCancel,
    readOnly         = false,
    title            = "Devolución",
    submitText       = "Guardar",
    productosList    = [],
    ventasList       = [],
    estadoCampo      = () => null,
    onFieldBlur      = () => {},
    sinProductos     = false,
    readOnlyFields   = [],
}) {
    // Helper para verificar si un campo debe estar readonly
    const esReadOnly = (campo) => readOnly || readOnlyFields.includes(campo);
    
    // Opciones filtradas según reglas de negocio
    const gestionesDisponibles   = getGestionesPermitidas(form.motivo, form.submotivo);
    const condicionesDisponibles = getCondicionesPermitidas(form.motivo);
    const submotivosDisponibles  = SUBMOTIVOS[form.motivo] || [];

    // La garantía solo aplica cuando motivo = GARANTIA
    const garantiaAplica   = form.motivo === "GARANTIA";
    const garantiaNoAplica = !readOnly && form.motivo && !garantiaAplica;

    // Determina si el campo de monto parcial debe mostrarse
    const mostrarMontoParcial = form.gestion === "REEMBOLSO_PARCIAL";

    // Calcula el valor total de referencia para el badge
    // (cantidad × precio del producto seleccionado)
    const productoSeleccionado = productosList.find(p => p.nombre === form.producto);
    const valorTotalReferencia = productoSeleccionado?.precio
        ? (parseFloat(productoSeleccionado.precio) * (parseInt(form.cantidad) || 0))
        : 0;

    const fieldBase = (campo) => `
        bg-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm w-full shadow-sm
        focus:outline-none focus:ring-2
        transition-all duration-200
        ${esReadOnly(campo) ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        ${ring(estadoCampo(campo))}
    `;

    // Clase para el input de monto parcial cuando excede el total
    const montoExcedeTotal = form.montoReembolso && valorTotalReferencia > 0
        && parseFloat(form.montoReembolso) > valorTotalReferencia;

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col h-full gap-6 shadow-inner overflow-auto">

            {/* TÍTULO */}
            <div>
                <p className="text-xl font-semibold flex items-center gap-2">
                    {title}
                </p>
                <div className="h-0.5 bg-linear-to-r from-yellow-400 to-transparent mt-3" />
            </div>

            {/* ── FILA 1: Producto · Motivo · Submotivo ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 px-10 gap-y-6">

                {/* PRODUCTO — primero */}
                <Field icon={Box} label="Producto *">
                    {esReadOnly("producto") ? (
                            <input type="text" value={form.producto} readOnly className={fieldBase("producto")} />
                        ) : (!form.idVenta || productosList.length === 0) ? (
                            <div className={`${fieldBase("producto")} opacity-40 cursor-not-allowed`}>{form.idVenta ? "Seleccionar..." : "Primero elige venta"}</div>
                        ) : (
                            <CustomSelect
                                value={form.producto}
                                onChange={(val) => { onChange("producto", val); onFieldBlur("producto"); }}
                                options={productosList.map((p) => ({ value: p.nombre, label: p.nombre }))}
                                placeholder={form.idVenta ? "Seleccionar..." : "Primero elige venta"}
                                width="w-full"
                            />
                        )}
                    {sinProductos && !esReadOnly("producto") ? (
                        <div className="flex items-center gap-1 text-xs mt-1 text-amber-600">
                            <AlertCircle size={12} />
                            <span>Todos los productos de esta venta ya tienen devolución completa.</span>
                        </div>
                    ) : (
                        <FieldStatus estado={estadoCampo("producto")} />
                    )}
                </Field>

                {/* MOTIVO */}
                <Field icon={AlertTriangle} label="Motivo *">
                    <CustomSelect
                        value={form.motivo}
                        onChange={(val) => { onChange("motivo", val); onFieldBlur("motivo"); }}
                        options={MOTIVOS.map((m) => ({ value: m, label: m }))}
                        placeholder="Seleccionar..."
                        width="w-full"
                        disabled={esReadOnly("motivo")}
                    />
                    <FieldStatus estado={estadoCampo("motivo")} />
                </Field>

                {/* SUBMOTIVO — depende del motivo */}
                <Field icon={GitBranch} label="Submotivo *">
                    {esReadOnly("submotivo") ? (
                        <input type="text" value={form.submotivo || "—"} readOnly className={fieldBase("submotivo")} />
                        ) : (!form.motivo ? (
                            <div className={`${fieldBase("submotivo")} opacity-40 cursor-not-allowed`}>{form.motivo ? "Seleccionar..." : "Primero elige motivo"}</div>
                        ) : (
                            <CustomSelect
                                value={form.submotivo}
                                onChange={(val) => { onChange("submotivo", val); onFieldBlur("submotivo"); }}
                                options={submotivosDisponibles.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                                placeholder={form.motivo ? "Seleccionar..." : "Primero elige motivo"}
                                width="w-full"
                                disabled={!form.motivo}
                            />
                        ))}
                    <FieldStatus estado={estadoCampo("submotivo")} />
                </Field>

            </div>

            {/* ── FILA 2: Cantidad · Condición producto · Responsable · Fecha devolución ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 px-10 gap-y-6">

                {/* CANTIDAD */}
                <Field icon={Boxes} label="Cantidad *">
                    <input
                        type="number"
                        min="1"
                        max="9999"
                        value={form.cantidad}
                        onChange={(e) => onChange("cantidad", e.target.value)}
                        onKeyDown={blockInvalidKeys}
                        onBlur={() => onFieldBlur("cantidad")}
                        readOnly={esReadOnly("cantidad")}
                        placeholder="Ingresa cantidad..."
                        className={`${fieldBase("cantidad")} ${esReadOnly("cantidad") ? "cursor-not-allowed" : ""}`}
                    />
                    <FieldStatus estado={estadoCampo("cantidad")} />
                </Field>

                {/* CONDICIÓN PRODUCTO — filtrada por motivo */}
                <Field icon={Wrench} label="Condición producto *">
                    <CustomSelect
                        value={form.condicionProducto}
                        onChange={(val) => { onChange("condicionProducto", val); onFieldBlur("condicionProducto"); }}
                        options={condicionesDisponibles.map((c) => ({ value: c, label: c.replace(/_/g, " ") }))}
                        placeholder="Seleccionar..."
                        width="w-full"
                        disabled={esReadOnly("condicionProducto")}
                    />
                    <FieldStatus estado={estadoCampo("condicionProducto")} />
                </Field>

                {/* RESPONSABLE — auto-set por reglas de negocio */}
                <Field icon={User} label="Responsable *">
                    <CustomSelect
                        value={form.responsable}
                        onChange={(val) => { onChange("responsable", val); onFieldBlur("responsable"); }}
                        options={RESPONSABLES.map((r) => ({ value: r, label: r }))}
                        placeholder="Seleccionar..."
                        width="w-full"
                        disabled={esReadOnly("responsable") || form.motivo === "LOGISTICA" || form.motivo === "CLIENTE"}
                    />
                    <FieldStatus estado={estadoCampo("responsable")} />
                </Field>

                {/* FECHA — siempre automática, no editable */}
                <Field icon={CalendarDays} label="Fecha de devolución">
                    <input
                        type="text"
                        value={formatFechaDisplay(form.fechaDevolucion)}
                        readOnly
                        className={`${fieldBase("fecha")} cursor-not-allowed opacity-75`}
                    />
                    <p className="text-xs text-gray-400 mt-0.5">Se asigna automáticamente.</p>
                </Field>

            </div>

            {/* ── FILA 3: Gestión (con REEMBOLSO PARCIAL inline) · Estado resolución · Garantía proveedor ── */}
            <div className={`grid grid-cols-1 ${mostrarMontoParcial ? 'md:grid-cols-[1fr_1fr]' : 'md:grid-cols-3'} gap-x-8 px-10 gap-y-6 transition-all duration-300`}>

                {/* GESTIÓN — con monto parcial inline (Field propio con label) cuando aplica */}
                <div className={`${mostrarMontoParcial ? 'flex gap-2 items-start' : ''}`}>

                    {/* Campo de gestión */}
                    <div className={mostrarMontoParcial ? 'flex-[0_0_45%] min-w-0' : 'w-full'}>
                        <Field icon={ClipboardList} label="Gestión *">
                            {(!form.motivo || gestionesDisponibles.length === 0) ? (
                                <div className={`${fieldBase("gestion")} opacity-40`}>{!form.motivo ? "Primero elige motivo" : (form.motivo === "CLIENTE" && !form.submotivo ? "Primero elige submotivo" : "Seleccionar...")}</div>
                            ) : (
                                <CustomSelect
                                    value={form.gestion}
                                    onChange={(val) => { onChange("gestion", val); onFieldBlur("gestion"); }}
                                    options={gestionesDisponibles.map((g) => ({ value: g, label: g.replace(/_/g, " ") }))}
                                    placeholder={!form.motivo ? "Primero elige motivo" : (form.motivo === "CLIENTE" && !form.submotivo ? "Primero elige submotivo" : "Seleccionar...")}
                                    width="w-full"
                                    disabled={esReadOnly("gestion") || gestionesDisponibles.length === 0}
                                />
                            )}
                            <FieldStatus estado={estadoCampo("gestion")} />
                        </Field>
                    </div>

                    {/* Campo de monto parcial — visible solo con REEMBOLSO_PARCIAL */}
                    {mostrarMontoParcial && (
                        <div className="flex-1 min-w-0">
                            <Field icon={DollarSign} label="Monto reembolso *">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={form.montoReembolso || ""}
                                        onChange={(e) => onChange("montoReembolso", e.target.value)}
                                        onKeyDown={blockInvalidKeys}
                                        onBlur={() => onFieldBlur("montoReembolso")}
                                        readOnly={esReadOnly("montoReembolso")}
                                        placeholder="Monto"
                                        className={`${fieldBase("montoReembolso")} pr-20 ${
                                            montoExcedeTotal ? 'ring-1 ring-red-300 bg-red-50' : ''
                                        }`}
                                    />
                                    {/* Badge del valor total de referencia */}
                                    {valorTotalReferencia > 0 && (
                                        <div className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap pointer-events-none ${
                                            montoExcedeTotal 
                                                ? 'bg-red-100 text-red-800 border-red-200' 
                                                : 'bg-amber-100 text-amber-800 border-amber-300'
                                        }`}>
                                            <span className="font-bold">${valorTotalReferencia.toLocaleString('es-CO')}</span> total
                                        </div>
                                    )}
                                </div>

                                {/* Hint de monto máximo o error de validación */}
                                {valorTotalReferencia > 0 && (
                                    <div className={`flex items-center gap-1 text-xs mt-1 ${
                                        montoExcedeTotal ? 'text-red-500' : 'text-amber-600'
                                    }`}>
                                        {montoExcedeTotal ? (
                                            <>
                                                <AlertCircle size={12} />
                                                <span>El monto no puede superar ${valorTotalReferencia.toLocaleString('es-CO')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>ⓘ</span>
                                                <span>Máximo ${valorTotalReferencia.toLocaleString('es-CO')} ({form.cantidad || 0} ud × ${productoSeleccionado?.precio?.toLocaleString('es-CO') || 0})</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </Field>
                        </div>
                    )}
                </div>

                {/* ESTADO RESOLUCIÓN y GARANTÍA — se reagrupan en la segunda columna cuando hay split */}
                {mostrarMontoParcial ? (
                    /* Lado a lado dentro de la segunda mitad */
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 min-w-0">
                        <Field icon={Tag} label="Estado resolución" className="min-w-0">
                            <CustomSelect
                                value={form.estadoResolucion}
                                onChange={(val) => { onChange("estadoResolucion", val); onFieldBlur("estadoResolucion"); }}
                                options={ESTADOS_RESOLUCION.map((e) => ({ value: e, label: e.replace(/_/g, " ") }))}
                                placeholder="Seleccionar..."
                                width="w-full"
                                disabled={esReadOnly("estadoResolucion")}
                            />
                            <FieldStatus estado={estadoCampo("estadoResolucion")} />
                        </Field>

                        <Field icon={ShieldCheck} label="Garantía proveedor *" className="min-w-0">
                            {garantiaNoAplica ? (
                                <div className="flex items-center gap-2 bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-3">
                                    <span className="text-xs text-gray-400 italic">Solo aplica para GARANTÍA</span>
                                </div>
                            ) : (
                                <>
                                    <GarantiaCheckbox
                                        value={form.garantiaProveedor}
                                        onChange={(val) => {
                                            onChange("garantiaProveedor", val);
                                            onFieldBlur("garantiaProveedor");
                                        }}
                                        readOnly={esReadOnly("garantiaProveedor")}
                                    />
                                    <FieldStatus estado={estadoCampo("garantiaProveedor")} />
                                </>
                            )}
                        </Field>
                    </div>
                ) : (
                    /* Layout normal de 3 columnas cuando NO es REEMBOLSO PARCIAL */
                    <>
                        <Field icon={Tag} label="Estado resolución">
                            <CustomSelect
                                value={form.estadoResolucion}
                                onChange={(val) => { onChange("estadoResolucion", val); onFieldBlur("estadoResolucion"); }}
                                options={ESTADOS_RESOLUCION.map((e) => ({ value: e, label: e.replace(/_/g, " ") }))}
                                placeholder="Seleccionar..."
                                width="w-full"
                                disabled={esReadOnly("estadoResolucion")}
                            />
                            <FieldStatus estado={estadoCampo("estadoResolucion")} />
                        </Field>

                        <Field icon={ShieldCheck} label="Garantía proveedor *">
                            {garantiaNoAplica ? (
                                <div className="flex items-center gap-2 bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-3">
                                    <span className="text-xs text-gray-400 italic">Solo aplica para GARANTÍA</span>
                                </div>
                            ) : (
                                <>
                                    <GarantiaCheckbox
                                        value={form.garantiaProveedor}
                                        onChange={(val) => {
                                            onChange("garantiaProveedor", val);
                                            onFieldBlur("garantiaProveedor");
                                        }}
                                        readOnly={esReadOnly("garantiaProveedor")}
                                    />
                                    <FieldStatus estado={estadoCampo("garantiaProveedor")} />
                                </>
                            )}
                        </Field>
                    </>
                )}
            </div>

            {/* ── FILA 4: Observaciones · Descripción ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 px-10 gap-y-6">

                <Field icon={ClipboardList} label="Observaciones *">
                    <textarea
                        value={form.observaciones}
                        onChange={(e) => onChange("observaciones", e.target.value)}
                        onBlur={() => onFieldBlur("observaciones")}
                        readOnly={esReadOnly("observaciones")}
                        rows={4}
                        placeholder="Observaciones adicionales sobre la devolución..."
                        className={`${fieldBase("observaciones")} resize-none`}
                    />
                    <FieldStatus estado={estadoCampo("observaciones")} />
                </Field>

                <Field icon={FileText} label="Descripción *">
                    <textarea
                        value={form.descripcion}
                        onChange={(e) => onChange("descripcion", e.target.value)}
                        onBlur={() => onFieldBlur("descripcion")}
                        readOnly={esReadOnly("descripcion")}
                        rows={4}
                        placeholder="Describe el motivo detallado de la devolución..."
                        className={`${fieldBase("descripcion")} resize-none`}
                    />
                    <FieldStatus estado={estadoCampo("descripcion")} />
                </Field>

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 mt-auto">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                >
                    <ArrowLeft size={16}/>
                    {readOnly ? "Volver" : "Cancelar"}
                </button>

                {!readOnly && (
                    <PrimaryButton onClick={onSubmit}>
                        {submitText}
                    </PrimaryButton>
                )}
            </div>

        </div>
    );
}