import {
    AlertTriangle, Box, Boxes, Wrench, User,
    ShieldCheck, FileText, CalendarDays, ClipboardList, Tag,
    GitBranch, AlertCircle, CheckCircle2,
    Plus
} from "lucide-react";
import Calendar, { formatearFecha } from "../../../components/ui/Calendar";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import GarantiaCheckbox from "./GarantiaCheckbox";
import {
    MOTIVOS, SUBMOTIVOS, CONDICIONES_PRODUCTO, GESTIONES,
    RESPONSABLES, ESTADOS_RESOLUCION,
    getGestionesPermitidas, getCondicionesPermitidas,
} from "../helpers/devolutionsHelpers";

// ─── Definidos FUERA del componente para evitar remontaje y scroll reset ──────

/**
 * Wrapper de campo con ícono + label amarillo.
 * ⚠️ NUNCA mover esto dentro de DevolutionForm.
 */
function Field({ icon: Icon, label, children }) {
    return (
        <div className="flex flex-col">
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

    const fieldBase = (campo) => `
        bg-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm w-full shadow-sm
        focus:outline-none focus:ring-2
        transition-all duration-200
        ${esReadOnly(campo) ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        ${ring(estadoCampo(campo))}
    `;

    return (
        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col h-full gap-6 shadow-inner">

            {/* TÍTULO */}
            <div>
                <p className="text-xl font-semibold flex items-center gap-2">
                    <Plus size={20} className="text-yellow-400" />
                    {title}
                </p>
                <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-transparent mt-3" />
            </div>

            {/* ── FILA 1: Motivo · Submotivo · Producto ────────────────────────── */}
            <div className="grid grid-cols-3 gap-x-8 px-10">

                {/* MOTIVO */}
                <Field icon={AlertTriangle} label="Motivo *">
                    <select
                        value={form.motivo}
                        onChange={(e) => onChange("motivo", e.target.value)}
                        onBlur={() => onFieldBlur("motivo")}
                        disabled={esReadOnly("motivo")}
                        className={fieldBase("motivo")}
                    >
                        <option value="">Seleccionar...</option>
                        {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <FieldStatus estado={estadoCampo("motivo")} />
                </Field>

                {/* SUBMOTIVO — depende del motivo */}
                <Field icon={GitBranch} label="Submotivo *">
                    {esReadOnly("submotivo") ? (
                        <input type="text" value={form.submotivo || "—"} readOnly className={fieldBase("submotivo")} />
                    ) : (
                        <select
                            value={form.submotivo}
                            onChange={(e) => onChange("submotivo", e.target.value)}
                            onBlur={() => onFieldBlur("submotivo")}
                            disabled={!form.motivo}
                            className={`${fieldBase("submotivo")} ${!form.motivo ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <option value="">{form.motivo ? "Seleccionar..." : "Primero elige motivo"}</option>
                            {submotivosDisponibles.map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                            ))}
                        </select>
                    )}
                    <FieldStatus estado={estadoCampo("submotivo")} />
                </Field>

                {/* PRODUCTO */}
                <Field icon={Box} label="Producto *">
                    {esReadOnly("producto") ? (
                        <input type="text" value={form.producto} readOnly className={fieldBase("producto")} />
                    ) : (
                        <select
                            value={form.producto}
                            onChange={(e) => onChange("producto", e.target.value)}
                            onBlur={() => onFieldBlur("producto")}
                            disabled={!form.idVenta || productosList.length === 0}
                            className={`${fieldBase("producto")} ${(!form.idVenta || productosList.length === 0) ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <option value="">{form.idVenta ? "Seleccionar..." : "Primero elige venta"}</option>
                            {productosList.map((p) => (
                                <option key={p.id ?? p.nombre} value={p.nombre}>{p.nombre}</option>
                            ))}
                        </select>
                    )}

                    {/* Mensaje cuando no hay productos disponibles para devolver */}
                    {sinProductos && !esReadOnly("producto") ? (
                        <div className="flex items-center gap-1 text-xs mt-1 text-amber-600">
                            <AlertCircle size={12} />
                            <span>Todos los productos de esta venta ya tienen devolución registrada.</span>
                        </div>
                    ) : (
                        <FieldStatus estado={estadoCampo("producto")} />
                    )}
                </Field>

            </div>

            {/* ── FILA 2: Cantidad · Condición · Gestión · Responsable ────────── */}
            <div className="grid grid-cols-4 gap-x-8 px-10">

                {/* CANTIDAD */}
                <Field icon={Boxes} label="Cantidad *">
                    <input
                        type="number"
                        min="1"
                        max="9999"
                        value={form.cantidad}
                        onChange={(e) => onChange("cantidad", e.target.value)}
                        onBlur={() => onFieldBlur("cantidad")}
                        readOnly={esReadOnly("cantidad")}
                        placeholder="Ingresa cantidad..."
                        className={`${fieldBase("cantidad")} ${esReadOnly("cantidad") ? "cursor-not-allowed" : ""}`}
                    />
                    <FieldStatus estado={estadoCampo("cantidad")} />
                </Field>

                {/* CONDICIÓN PRODUCTO — filtrada por motivo */}
                <Field icon={Wrench} label="Condición producto *">
                    <select
                        value={form.condicionProducto}
                        onChange={(e) => onChange("condicionProducto", e.target.value)}
                        onBlur={() => onFieldBlur("condicionProducto")}
                        disabled={esReadOnly("condicionProducto")}
                        className={fieldBase("condicionProducto")}
                    >
                        <option value="">Seleccionar...</option>
                        {condicionesDisponibles.map((c) => (
                            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <FieldStatus estado={estadoCampo("condicionProducto")} />
                </Field>

                {/* GESTIÓN — filtrada por motivo/submotivo */}
                <Field icon={ClipboardList} label="Gestión *">
                    <select
                        value={form.gestion}
                        onChange={(e) => onChange("gestion", e.target.value)}
                        onBlur={() => onFieldBlur("gestion")}
                        disabled={esReadOnly("gestion") || gestionesDisponibles.length === 0}
                        className={`${fieldBase("gestion")} ${(!form.motivo || gestionesDisponibles.length === 0) ? "opacity-40" : ""}`}
                    >
                        <option value="">
                            {!form.motivo
                                ? "Primero elige motivo"
                                : form.motivo === "CLIENTE" && !form.submotivo
                                    ? "Primero elige submotivo"
                                    : "Seleccionar..."}
                        </option>
                        {gestionesDisponibles.map((g) => (
                            <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <FieldStatus estado={estadoCampo("gestion")} />
                </Field>

                {/* RESPONSABLE — auto-set por reglas de negocio */}
                <Field icon={User} label="Responsable *">
                    <select
                        value={form.responsable}
                        onChange={(e) => onChange("responsable", e.target.value)}
                        onBlur={() => onFieldBlur("responsable")}
                        disabled={esReadOnly("responsable") || form.motivo === "LOGISTICA" || form.motivo === "CLIENTE"}
                        className={`${fieldBase("responsable")} ${(form.motivo === "LOGISTICA" || form.motivo === "CLIENTE") ? "opacity-60" : ""}`}
                    >
                        <option value="">Seleccionar...</option>
                        {RESPONSABLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <FieldStatus estado={estadoCampo("responsable")} />
                </Field>

            </div>

            {/* ── FILA 3: Estado resolución | [Fecha · Garantía] ─────────────── */}
            <div className="grid grid-cols-2 gap-x-10 px-10">

                <Field icon={Tag} label="Estado resolución">
                    <select
                        value={form.estadoResolucion}
                        onChange={(e) => onChange("estadoResolucion", e.target.value)}
                        onBlur={() => onFieldBlur("estadoResolucion")}
                        disabled={esReadOnly("estadoResolucion")}
                        className={fieldBase("estadoResolucion")}
                    >
                        <option value="">Seleccionar...</option>
                        {ESTADOS_RESOLUCION.map((e) => (
                            <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <FieldStatus estado={estadoCampo("estadoResolucion")} />
                </Field>

                <div className="grid grid-cols-2 gap-x-8">

                    {/* FECHA */}
                    {esReadOnly("fecha") ? (
                        <Field icon={CalendarDays} label="Fecha">
                            <input type="text" value={form.fecha} readOnly className={fieldBase("fecha")} />
                        </Field>
                    ) : (
                        <div className="flex flex-col">
                            <Calendar
                                fechaISO={form.fechaISO || ""}
                                onFechaChange={(iso) => {
                                    onChange("fechaISO", iso);
                                    onChange("fecha", formatearFecha(iso));
                                    onFieldBlur("fecha");
                                }}
                                label="Fecha"
                                required={false}
                            />
                            <FieldStatus estado={estadoCampo("fecha")} />
                        </div>
                    )}

                    {/* GARANTÍA PROVEEDOR — solo activa cuando motivo = GARANTIA */}
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

                </div>
            </div>

            {/* ── FILA 4: Descripción · Observaciones ────────────────────────── */}
            <div className="grid grid-cols-2 gap-x-10 px-10">

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

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 mt-auto">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <span>✕</span>
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