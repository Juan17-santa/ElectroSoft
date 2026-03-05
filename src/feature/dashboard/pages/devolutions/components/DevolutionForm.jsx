import {
    AlertTriangle, Box, Boxes, Wrench, User,
    ShieldCheck, FileText, CalendarDays, ClipboardList, Tag, Receipt
} from "lucide-react";
import Calendar, { formatearFecha } from "../../../components/ui/Calendar";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import GarantiaCheckbox from "./GarantiaCheckbox";
import VentaSearchSelect from "./VentaSearchSelect";
import {
    MOTIVOS, CONDICIONES_PRODUCTO, GESTIONES,
    RESPONSABLES, ESTADOS_RESOLUCION
} from "../helpers/devolutionsHelpers";

/**
 * ⚠️  Definido FUERA del componente principal para evitar que React
 *     lo desmonte/remonte en cada render (scroll reset).
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

export default function DevolutionForm({
    form,
    onChange,
    onSubmit,
    onCancel,
    readOnly      = false,
    title         = "Devolución",
    submitText    = "Guardar",
    productosList = [],
    ventasList    = [],
}) {
    const fieldBase = `
        bg-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm w-full shadow-sm
        focus:outline-none focus:ring-2 focus:ring-gray-400
        transition-all duration-200
        ${readOnly ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
    `;

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

            {/* ── FILA 1: ID Venta · Motivo · Producto · Cantidad ────────────── */}
            <div className="grid grid-cols-4 gap-x-8 px-10">

                {/* ID VENTA — combobox con búsqueda */}
                <Field icon={Receipt} label="ID Venta *">
                    {readOnly ? (
                        <input type="text" value={form.idVenta} readOnly className={fieldBase} />
                    ) : (
                        <VentaSearchSelect
                            value={form.idVenta}
                            onChange={(id) => onChange("idVenta", id)}
                            ventasList={ventasList}
                        />
                    )}
                </Field>

                {/* MOTIVO */}
                <Field icon={AlertTriangle} label="Motivo *">
                    <select value={form.motivo} onChange={(e) => onChange("motivo", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </Field>

                {/* PRODUCTO */}
                <Field icon={Box} label="Producto *">
                    {readOnly ? (
                        <input type="text" value={form.producto} readOnly className={fieldBase} />
                    ) : (
                        <select value={form.producto} onChange={(e) => onChange("producto", e.target.value)} className={fieldBase}>
                            <option value="">Seleccionar...</option>
                            {productosList.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                    )}
                </Field>

                {/* CANTIDAD */}
                <Field icon={Boxes} label="Cantidad *">
                    <select value={form.cantidad} onChange={(e) => onChange("cantidad", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {GESTIONES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </Field>

            </div>

            {/* ── FILA 2: Condición · Gestión · Responsable ─────────────────── */}
            <div className="grid grid-cols-3 gap-x-8 px-10">

                <Field icon={Wrench} label="Condición producto *">
                    <select value={form.condicionProducto} onChange={(e) => onChange("condicionProducto", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {CONDICIONES_PRODUCTO.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>

                <Field icon={ClipboardList} label="Gestión *">
                    <select value={form.gestion} onChange={(e) => onChange("gestion", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {GESTIONES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </Field>

                <Field icon={User} label="Responsable *">
                    <select value={form.responsable} onChange={(e) => onChange("responsable", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </Field>

            </div>

            {/* ── FILA 3: Estado resolución | [Fecha · Garantía] ────────────── */}
            <div className="grid grid-cols-2 gap-x-10 px-10">

                <Field icon={Tag} label="Estado resolución">
                    <select value={form.estadoResolucion} onChange={(e) => onChange("estadoResolucion", e.target.value)} disabled={readOnly} className={fieldBase}>
                        <option value="">Seleccionar...</option>
                        {ESTADOS_RESOLUCION.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                </Field>

                <div className="grid grid-cols-2 gap-x-8">

                    {readOnly ? (
                        <Field icon={CalendarDays} label="Fecha">
                            <input type="text" value={form.fecha} readOnly className={fieldBase} />
                        </Field>
                    ) : (
                        <Calendar
                            fechaISO={form.fechaISO || ""}
                            onFechaChange={(iso) => {
                                onChange("fechaISO", iso);
                                onChange("fecha", formatearFecha(iso));
                            }}
                            label="Fecha"
                            required={false}
                        />
                    )}

                    <Field icon={ShieldCheck} label="Garantía proveedor *">
                        <GarantiaCheckbox
                            value={form.garantiaProveedor}
                            onChange={(val) => onChange("garantiaProveedor", val)}
                            readOnly={readOnly}
                        />
                    </Field>

                </div>
            </div>

            {/* ── FILA 4: Descripción · Observaciones ───────────────────────── */}
            <div className="grid grid-cols-2 gap-x-10 px-10">

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

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 mt-2">
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