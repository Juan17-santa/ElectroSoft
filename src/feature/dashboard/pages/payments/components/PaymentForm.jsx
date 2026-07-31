import { FileText, CircleUser, CreditCard, ChevronDown, X, DollarSign, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ValidationMessage from "../../../components/ui/ValidationMessage";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import paymentsService from "../services/paymentsService";

const METODOS_PAGO = ["Efectivo", "Transferencia"];
const fmt = (val) => new Intl.NumberFormat("es-CO").format(val ?? 0);

export default function PaymentForm({
    formData,
    errors,
    handleChange,
    handleSelectVenta,
    handleSubmit,
    ventasDelDocumento,
    isSubmitting,
    onCancel,
    isSubmitting
}) {

    const [showMetodo, setShowMetodo] = useState(false);
    const metodoRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (metodoRef.current && !metodoRef.current.contains(e.target)) {
                setShowMetodo(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleMontoChange = (e) => {
        let rawStr = e.target.value.replace(/\D/g, "");
        if (!rawStr) {
            handleChange({ target: { name: "monto", value: "" } });
            return;
        }

        let raw = parseFloat(rawStr);
        const exactTotal = Math.round(formData.montoPorPagar);
        const maxTotal = formData.metodoPago?.toUpperCase() === "EFECTIVO" ? Math.ceil(exactTotal / 50) * 50 : exactTotal;
        
        if (raw > maxTotal) {
            raw = maxTotal;
        }

        handleChange({ target: { name: "monto", value: fmt(raw) } });
    };

    // corregido: montoPorPagar y a.monto
    const abonosTable = formData.ventaId
        ? paymentsService.buildAbonosTable({
            ...formData,
            id: formData.ventaId,
            abonos: formData.abonos,
            total: formData.montoPorPagar + (formData.abonos || []).filter(a => !a.anulado).reduce((acc, a) => acc + Number(a.monto), 0),
            fecha: formData.abonos?.[0]?.fecha || "-",
        })
        : [];

    const isVencida = formData.estadoVenta === "Anulada"; //  

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 mt-6 h-full">

                {/* ===== NÚMERO DE VENTA (Encabezado) ===== */}
                <div className="px-4 md:px-16 flex flex-col gap-2 border-b border-gray-100 pb-4">
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        <FileText size={18} />
                        <span>Número de venta seleccionada</span>
                    </div>

                    {ventasDelDocumento.length > 1 && !formData.ventaId ? (
                        <select
                            defaultValue=""
                            onChange={(e) => handleSelectVenta(e.target.value)}
                            className="bg-gray-100 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 max-w-sm"
                        >
                            <option value="" disabled>Seleccionar venta pendiente</option>
                            {ventasDelDocumento.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.numeroVenta || `V-${v.id}`} — ${fmt(v.montoPorPagar)}
                                    {v.estado === "Anulada" ? " (Vencida)" : ""}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-800">
                            {formData.numeroVenta ? `#${formData.numeroVenta}` : "—"}
                        </h2>
                    )}
                </div>

                {/* ===== PRIMERA FILA: Documento + Cliente ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 md:px-16">

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} />
                            <span>Documento *</span>
                        </div>
                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            placeholder="Ingrese documento"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 w-full
                                ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <div className="h-4">
                            <ValidationMessage
                                error={errors.documento}
                                success={formData.clienteNombre}
                                successMessage="Cliente encontrado"
                            />
                        </div>
                    </div>

                    {/* CLIENTE (auto) */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <CircleUser size={16} />
                            <span>Cliente</span>
                        </div>
                        <input
                            type="text"
                            value={formData.clienteNombre || ""}
                            disabled
                            placeholder="Se autocompletará al buscar"
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-full text-gray-500"
                        />
                    </div>
                </div>

                {/* ===== AVISO VENTA VENCIDA ===== */}
                {isVencida && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mx-4 md:mx-16">
                        <AlertTriangle size={20} className="text-red-500 shrink-0" />
                        <div>
                            <p className="text-red-600 font-semibold text-sm">
                                Esta venta está vencida
                            </p>
                            <p className="text-red-500 text-xs mt-0.5">
                                Para saldar la deuda debes pagar el total exacto de{" "}
                                <span className="font-bold">${fmt(formData.montoPorPagar)}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* ===== SEGUNDA FILA: Método + Monto ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 md:px-16">

                    {/* MÉTODO DE PAGO */}
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <CreditCard size={20} />
                            <span>Método de pago *</span>
                        </div>

                        <div className="relative" ref={metodoRef}>
                            <button
                                type="button"
                                onClick={() => setShowMetodo((v) => !v)}
                                className={`bg-gray-200 mb-4 rounded-xl px-4 py-3 text-sm shadow-md w-full text-left transition-all duration-300
                                    focus:outline-none focus:ring-2 cursor-pointer flex items-center justify-between gap-2
                                    ${errors.metodoPago ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            >
                                <span>{formData.metodoPago || "Seleccionar método"}</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition duration-300 ${showMetodo ? "rotate-180 text-yellow-500" : "text-gray-400"}`}
                                />
                            </button>

                            {showMetodo && (
                                <div className="absolute z-50 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 w-full">
                                    {METODOS_PAGO.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => {
                                                handleChange({ target: { name: "metodoPago", value: m } });
                                                setShowMetodo(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm transition"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="h-4">
                                <ValidationMessage
                                    error={errors.metodoPago}
                                    success={formData.metodoPago}
                                    successMessage="Método de pago válido"
                                />
                            </div>
                        </div>
                    </div>

                    {/* MONTO */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <DollarSign size={16} />
                            <span>
                                Monto *
                                {formData.ventaId && (
                                    <span className="text-xs text-gray-400 font-normal ml-1">
                                        {/*   si vencida muestra "exacto", si no muestra "máx" */}
                                        {isVencida
                                            ? `exacto: $${fmt(formData.montoPorPagar)}`
                                            : `máx: $${fmt(formData.montoPorPagar)}`
                                        }
                                    </span>
                                )}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.monto}
                            onChange={handleMontoChange}
                            disabled={!formData.ventaId}
                            placeholder="Ingrese el monto"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 disabled:opacity-50
                                ${errors.monto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />
                        <div className="min-h-4 flex flex-col items-start gap-1">
                            <ValidationMessage
                                error={errors.monto}
                                success={formData.monto && !errors.monto}
                                successMessage="Monto válido"
                            />
                            {errors.monto?.includes("múltiplo de $50") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const raw = parseFloat(String(formData.monto).replace(/\./g, "").replace(",", ".")) || 0;
                                        const rounded = Math.round(raw / 50) * 50;
                                        handleChange({ target: { name: "monto", value: fmt(rounded) } });
                                    }}
                                    className="mt-0.5 text-[11px] font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded-md transition cursor-pointer flex items-center border border-yellow-200"
                                >
                                    Corregir a ${fmt(Math.round((parseFloat(String(formData.monto).replace(/\./g, "").replace(",", ".")) || 0) / 50) * 50)}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== TABLA HISTORIAL DE ABONOS ===== */}
                <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold text-base mb-1">
                        <FileText size={18} />
                        <span>Historial de abonos</span>
                        {formData.ventaId && (
                            <span className="text-gray-400 text-sm font-normal ml-2">
                                Saldo pendiente:{" "}
                                {/*   montoPorPagar */}
                                <span className={`font-bold ${isVencida ? "text-red-600" : "text-gray-700"}`}>
                                    ${fmt(formData.montoPorPagar)}
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="border border-gray-200 rounded-sm overflow-x-auto">
                        <table className="min-w-150 w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-200">
                                    <th className="px-4 py-2.5 font-semibold text-gray-800">Fecha</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-800">Método</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-800 text-center">Abono</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-800 text-center">Saldo pendiente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!formData.ventaId ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-400 italic text-sm">
                                            Ingresa un documento para ver el historial
                                        </td>
                                    </tr>
                                ) : abonosTable.length === 0 || (formData.abonos || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-400 italic text-sm">
                                            Sin abonos registrados
                                        </td>
                                    </tr>
                                ) : (
                                    abonosTable.filter(row => !row.anulado).map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`border-b border-gray-100 ${row.tipo === "inicio" ? "text-gray-600 font-medium" :
                                                    row.tipo === "ultimo" ? "text-blue-500 font-medium" :
                                                        "text-gray-600"
                                                }`}
                                        >
                                            <td className="px-4 py-2.5">{row.fecha}</td>
                                            <td className="px-4 py-2.5 text-gray-400 text-xs">{row.metodoPago || "—"}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                {row.abono === 0 ? "0"
                                                    : row.abono < 0 ? `-${fmt(Math.abs(row.abono))}`
                                                        : `+${fmt(row.abono)}`}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">{fmt(row.saldoPendiente)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== BOTONES ===== */}
                <div className="flex justify-end w-full gap-4 mt-auto px-4 md:px-16">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
                    >
                        <X size={16} />
                        Cancelar
                    </button>

                    <PrimaryButton
                        type="submit"
                        disabled={Object.values(errors).some(Boolean) || isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Procesando...
                            </span>
                        ) : (
                            "Crear abono"
                        )}
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
}