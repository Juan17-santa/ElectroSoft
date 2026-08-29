import {
    AlertTriangle, Boxes, Wrench, User,
    ShieldCheck, FileText, CalendarDays, ClipboardList, Tag,
    GitBranch, AlertCircle, CheckCircle2, DollarSign,
    Plus
} from "lucide-react";
import CustomSelect from "../../../components/ui/CustomSelect";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import GarantiaCheckbox from "./GarantiaCheckbox";
import {
    MOTIVOS, SUBMOTIVOS, CONDICIONES_PRODUCTO, GESTIONES,
    RESPONSABLES, ESTADOS_RESOLUCION,
    getGestionesPermitidas, getCondicionesPermitidas,
} from "../helpers/devolutionsHelpers";
import { ArrowLeft, X } from "lucide-react";

function Field({ icon, label, children, className = "" }) {
    const Icon = icon;
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

function ring(estado) {
    if (!estado) return "focus:ring-gray-400";
    return estado.valido ? "ring-1 ring-green-300" : "ring-1 ring-red-300";
}

function blockInvalidKeys(e) {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

function formatFechaDisplay(fechaISO) {
    if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return "—";
    const [y, m, d] = fechaISO.split("-");
    return `${d}/${m}/${y}`;
}

export default function DevolutionForm({
    form,
    onChange,
    onSubmit,
    onCancel,
    readOnly         = false,
    title            = "Devolución",
    submitText       = "Guardar",
    productosList    = [],
    estadoCampo      = () => null,
    onFieldBlur      = () => {},
    readOnlyFields   = [],
    garantiaVencidaMap = {},
    stockDisponible  = null,
    saldoPendiente   = false,
}) {
    const esReadOnly = (campo) => readOnly || readOnlyFields.includes(campo);

    const gestionesDisponibles   = getGestionesPermitidas(form.motivo, form.submotivo);
    const condicionesDisponibles = getCondicionesPermitidas(form.motivo);
    const submotivosDisponibles  = SUBMOTIVOS[form.motivo] || [];

    const garantiaAplica   = form.motivo === "GARANTIA";
    const garantiaNoAplica = !readOnly && form.motivo && !garantiaAplica;

    const mostrarMontoParcial = form.gestion === "REEMBOLSO_PARCIAL";
    const mostrarReembolsoTotal = form.gestion === "REEMBOLSO_TOTAL";

    const productoSeleccionado = productosList.find(p => p.nombre === form.producto);
    const valorTotalReferencia = productoSeleccionado?.precio
        ? (parseFloat(productoSeleccionado.precio) * (parseInt(form.cantidad) || 0))
        : 0;

    const valorReembolsoMostrado =
        Number(form.montoReembolso) > 0
            ? Number(form.montoReembolso)
            : valorTotalReferencia;

    const stockSinExistencias =
        form.gestion === "MISMO_PRODUCTO" &&
        stockDisponible !== null &&
        Number(form.cantidad || 0) > 0 &&
        Number(stockDisponible) < Number(form.cantidad || 0);

    const fieldBase = (campo) => `
        bg-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm w-full shadow-sm
        focus:outline-none focus:ring-2
        transition-all duration-200
        ${esReadOnly(campo) ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        ${ring(estadoCampo(campo))}
    `;

    const montoExcedeTotal = form.montoReembolso && valorTotalReferencia > 0
        && parseFloat(form.montoReembolso) > valorTotalReferencia;

    return (
        <div className="p-6 flex flex-col h-full gap-6 overflow-auto">

            <div>
                <p className="text-xl font-semibold flex items-center gap-2 flex-wrap">
                    {title}
                    {form.producto && (
                        <>
                            <span className="text-gray-300 select-none" aria-hidden="true">|</span>
                            <span className="font-medium text-gray-700">{form.producto}</span>
                        </>
                    )}
                </p>
                <div className="h-0.5 bg-linear-to-r from-yellow-400 to-transparent mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 px-10 gap-y-6">

                <Field icon={AlertTriangle} label="Motivo *">
                    <CustomSelect
                        value={form.motivo}
                        onChange={(val) => { onChange("motivo", val); onFieldBlur("motivo"); }}
                        options={MOTIVOS.map((m) => ({
                            value: m,
                            label: m === "GARANTIA" && garantiaVencidaMap[form.producto]
                                ? "Garantía (no aplica)"
                                : m,
                            disabled: m === "GARANTIA" && garantiaVencidaMap[form.producto],
                        }))}
                        placeholder="Seleccionar..."
                        width="w-full"
                        disabled={esReadOnly("motivo")}
                    />
                    <FieldStatus estado={estadoCampo("motivo")} />
                </Field>

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

                <Field icon={Wrench} label="Condición producto *">
                    <CustomSelect
                        value={form.condicionProducto}
                        onChange={(val) => { onChange("condicionProducto", val); onFieldBlur("condicionProducto"); }}
                        options={condicionesDisponibles.map((c) => ({ value: c, label: c.replace(/_/g, " ") }))}
                        placeholder="Seleccionar..."
                        width="w-full"
                        disabled={esReadOnly("condicionProducto")}
                    />
                    {form.submotivo === "PRODUCTO_INCOMPLETO" &&
                        form.condicionProducto === "BUEN_ESTADO" && (
                        <label
                            className={`flex items-center gap-2 mt-2 text-xs text-gray-500 cursor-pointer select-none ${
                                esReadOnly("regresarAlInventario") ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={form.regresarAlInventario !== false}
                                onChange={(e) => {
                                    onChange("regresarAlInventario", e.target.checked);
                                    onFieldBlur("condicionProducto");
                                }}
                                readOnly={esReadOnly("regresarAlInventario")}
                                disabled={esReadOnly("regresarAlInventario")}
                                className="h-4 w-4 accent-yellow-500"
                            />
                            <span >¿Regresar estos productos al inventario/stock?</span>
                        </label>
                    )}
                    <FieldStatus estado={estadoCampo("condicionProducto")} />
                </Field>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 px-10 gap-y-6">

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

            <div className={`grid grid-cols-1 ${mostrarMontoParcial ? 'md:grid-cols-[1fr_1fr]' : 'md:grid-cols-3'} gap-x-8 px-10 gap-y-6 transition-all duration-300`}>

                <div className={`${mostrarMontoParcial ? 'flex gap-2 items-start' : ''}`}>

                    <div className={mostrarMontoParcial ? 'flex-[0_0_45%] min-w-0' : 'w-full'}>
                        <Field icon={ClipboardList} label="Gestión *">
                            {(!form.motivo || gestionesDisponibles.length === 0) ? (
                                <div className={`${fieldBase("gestion")} opacity-40`}>{!form.motivo ? "Primero elige motivo" : (form.motivo === "CLIENTE" && !form.submotivo ? "Primero elige submotivo" : "Seleccionar...")}</div>
                            ) : (
                                <CustomSelect
                                    value={form.gestion}
                                    onChange={(val) => { onChange("gestion", val); onFieldBlur("gestion"); }}
                                    options={gestionesDisponibles.map((g) => ({
                                        value: g,
                                        label: g.replace(/_/g, " "),
                                        disabled: false,
                                    }))}
                                    placeholder={!form.motivo ? "Primero elige motivo" : (form.motivo === "CLIENTE" && !form.submotivo ? "Primero elige submotivo" : "Seleccionar...")}
                                    width="w-full"
                                    disabled={esReadOnly("gestion") || gestionesDisponibles.length === 0}
                                />
                            )}
                            {(estadoCampo("gestion") !== null || (mostrarReembolsoTotal && valorReembolsoMostrado > 0)) && (
                                <div className="flex items-end gap-2 mt-1">
                                    <FieldStatus estado={estadoCampo("gestion")} />
                                    {mostrarReembolsoTotal && valorReembolsoMostrado > 0 && (
                                        <span className="text-xs  text-green-500 whitespace-nowrap">
                                            Total a reembolsar: ${Number(valorReembolsoMostrado).toLocaleString("es-CO")}
                                        </span>
                                    )}
                                </div>
                            )}
                            {(form.gestion === "REEMBOLSO_TOTAL" ||
                                form.gestion === "REEMBOLSO_PARCIAL") &&
                                saldoPendiente && (
                                <div className="flex items-center gap-1 text-xs mt-1 text-sky-600">
                                    <span>
                                        El reembolso se descontará del saldo pendiente de la venta.
                                    </span>
                                </div>
                            )}
                            {stockSinExistencias && (
                                <div className="flex items-center gap-1 text-xs mt-1 text-amber-600">
                                    <AlertCircle size={18} />
                                    <span>
                                        No hay existencias suficientes para el cambio por el mismo producto
                                        {stockDisponible !== null ? ` (stock actual: ${stockDisponible})` : ""}.
                                    </span>
                                </div>
                            )}
                        </Field>
                    </div>

                    {mostrarMontoParcial && (
                        <div className="flex-1 min-w-0">
                            <Field icon={DollarSign} label="Monto reembolso *">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="100"
                                        step="100"
                                        max="999999999"
                                        value={form.montoReembolso || ""}
                                        onChange={(e) => {
                                            if (String(e.target.value).replace(/\D/g, "").length > 9) return;
                                            onChange("montoReembolso", e.target.value);
                                        }}
                                        onKeyDown={blockInvalidKeys}
                                        onBlur={() => onFieldBlur("montoReembolso")}
                                        readOnly={esReadOnly("montoReembolso")}
                                        placeholder="Monto"
                                        className={`${fieldBase("montoReembolso")} pr-20 ${
                                            montoExcedeTotal ? 'ring-1 ring-red-300 bg-red-50' : ''
                                        }`}
                                    />
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

                {mostrarMontoParcial ? (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 px-10 gap-y-6">

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
                        placeholder="Ej: El proveedor dijó que en 1 semana mandaba el producto, 02/03/2027."
                        className={`${fieldBase("observaciones")} resize-none`}
                    />
                    <FieldStatus estado={estadoCampo("observaciones")} />
                </Field>

            </div>

            <div className="flex justify-end gap-3 mt-auto">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                >
                    {readOnly ? <ArrowLeft size={16} /> : <X size={16} />}
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