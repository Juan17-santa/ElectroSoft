import {
    AlertTriangle, Box, Boxes, Wrench, User,
    ShieldCheck, FileText, CalendarDays, ClipboardList, Tag
} from "lucide-react";
import Calendar, { formatearFecha } from "../../../components/ui/Calendar";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import {
    MOTIVOS, CONDICIONES_PRODUCTO, GESTIONES,
    RESPONSABLES, ESTADOS_RESOLUCION
} from "../helpers/devolutionsHelpers";

/**
 * Formulario reutilizable de devolución.
 * Se usa en: CreateDevolution, EditDevolution y DevolutionDetails.
 *
 * Props:
 *  form            — objeto con todos los valores del formulario
 *  onChange        — (field, value) => void
 *  onSubmit        — () => void  (no se muestra en readOnly)
 *  onCancel        — () => void
 *  readOnly        — boolean, desactiva todos los campos
 *  title           — string, título de la vista
 *  submitText      — string, texto del botón principal
 *  productosList   — array de productos para el select de Producto
 */
export default function DevolutionForm({
    form,
    onChange,
    onSubmit,
    onCancel,
    readOnly   = false,
    title      = "Devolución",
    submitText = "Guardar",
    productosList = [],
}) {
    // ─── Clases base reutilizables ─────────────────────────────────────────────
    const fieldBase = `
        bg-gray-200 rounded-xl px-4 py-3 text-sm w-full shadow-sm
        focus:outline-none focus:ring-2 focus:ring-gray-400
        transition-all duration-200
        ${readOnly ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
    `;

    const labelClass = "flex items-center gap-2 text-yellow-500 text-sm font-medium mb-2";

    // ─── Mini campo con label ──────────────────────────────────────────────────
    const Field = ({ icon: Icon, label, children }) => (
        <div className="flex flex-col">
            <p className={labelClass}>
                <Icon size={16} />
                {label}
            </p>
            {children}
        </div>
    );

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">

            {/* TÍTULO */}
            <div>
                <p className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">+</span>
                    {title}
                </p>
                <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-transparent mt-3" />
            </div>

            {/* GRID DE CAMPOS */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                {/* MOTIVO */}
                <Field icon={AlertTriangle} label="Motivo *">
                    <select
                        value={form.motivo}
                        onChange={(e) => onChange("motivo", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {MOTIVOS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </Field>

                {/* PRODUCTO */}
                <Field icon={Box} label="Producto *">
                    {readOnly ? (
                        <input
                            type="text"
                            value={form.producto}
                            readOnly
                            className={fieldBase}
                        />
                    ) : (
                        <select
                            value={form.producto}
                            onChange={(e) => onChange("producto", e.target.value)}
                            className={fieldBase}
                        >
                            <option value="">Seleccionar...</option>
                            {productosList.map((p) => (
                                <option key={p.id} value={p.nombre}>{p.nombre}</option>
                            ))}
                        </select>
                    )}
                </Field>

                {/* CANTIDAD */}
                <Field icon={Boxes} label="Cantidad *">
                    <select
                        value={form.cantidad}
                        onChange={(e) => onChange("cantidad", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {GESTIONES.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </Field>

                {/* CONDICIÓN PRODUCTO */}
                <Field icon={Wrench} label="Condición producto *">
                    <select
                        value={form.condicionProducto}
                        onChange={(e) => onChange("condicionProducto", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {CONDICIONES_PRODUCTO.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </Field>

                {/* GESTIÓN */}
                <Field icon={ClipboardList} label="Gestión *">
                    <select
                        value={form.gestion}
                        onChange={(e) => onChange("gestion", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {GESTIONES.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </Field>

                {/* RESPONSABLE */}
                <Field icon={User} label="Responsable *">
                    <select
                        value={form.responsable}
                        onChange={(e) => onChange("responsable", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {RESPONSABLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </Field>

                {/* GARANTÍA PROVEEDOR — fila completa */}
                <div className="col-span-2">
                    <Field icon={ShieldCheck} label="Garantía proveedor *">
                        <div className="flex items-center gap-5 mt-1">

                            {/* SI */}
                            <button
                                type="button"
                                onClick={() => !readOnly && onChange("garantiaProveedor", true)}
                                disabled={readOnly}
                                className={`flex items-center gap-2 text-sm transition ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <div className={`
                                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                    ${form.garantiaProveedor
                                        ? "bg-yellow-400 border-yellow-400"
                                        : "bg-white border-gray-300"}
                                `} />
                                <span className="text-gray-700">si</span>
                            </button>

                            {/* NO */}
                            <button
                                type="button"
                                onClick={() => !readOnly && onChange("garantiaProveedor", false)}
                                disabled={readOnly}
                                className={`flex items-center gap-2 text-sm transition ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <div className={`
                                    w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                    ${!form.garantiaProveedor
                                        ? "bg-yellow-400 border-yellow-400"
                                        : "bg-white border-gray-300"}
                                `}>
                                    {!form.garantiaProveedor && (
                                        <span className="text-white text-xs font-black leading-none">✕</span>
                                    )}
                                </div>
                                <span className="text-gray-700">no</span>
                            </button>

                        </div>
                    </Field>
                </div>

                {/* DESCRIPCIÓN */}
                <Field icon={FileText} label="Descripción *">
                    <textarea
                        value={form.descripcion}
                        onChange={(e) => onChange("descripcion", e.target.value)}
                        readOnly={readOnly}
                        rows={4}
                        placeholder="Plazo dentro de los 8 días y sin daños"
                        className={`${fieldBase} resize-none`}
                    />
                </Field>

                {/* FECHA */}
                <Field icon={CalendarDays} label="Fecha">
                    {readOnly ? (
                        <input
                            type="text"
                            value={form.fecha}
                            readOnly
                            className={fieldBase}
                        />
                    ) : (
                        <Calendar
                            fechaISO={form.fechaISO || ""}
                            onFechaChange={(iso) => {
                                onChange("fechaISO", iso);
                                onChange("fecha", formatearFecha(iso));
                            }}
                            label=""
                        />
                    )}
                </Field>

                {/* OBSERVACIONES */}
                <Field icon={ClipboardList} label="Observaciones *">
                    <textarea
                        value={form.observaciones}
                        onChange={(e) => onChange("observaciones", e.target.value)}
                        readOnly={readOnly}
                        rows={4}
                        placeholder="Plazo dentro de los 8 días y sin daños"
                        className={`${fieldBase} resize-none`}
                    />
                </Field>

                {/* ESTADO RESOLUCIÓN */}
                <Field icon={Tag} label="Estado resolución">
                    <select
                        value={form.estadoResolucion}
                        onChange={(e) => onChange("estadoResolucion", e.target.value)}
                        disabled={readOnly}
                        className={fieldBase}
                    >
                        <option value="">Seleccionar...</option>
                        {ESTADOS_RESOLUCION.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </Field>

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 mt-2">
                <button
                    onClick={onCancel}
                    className="bg-white border border-gray-300 hover:bg-gray-100 transition px-5 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
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