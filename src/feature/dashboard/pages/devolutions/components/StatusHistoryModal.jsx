import { X, Clock, CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";
import { getEstadoColor } from "../helpers/devolutionsHelpers";

/** Formatea ISO timestamp a "DD/MM/YYYY hh:mm:ss am/pm" */
function formatFecha12h(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;

    const pad = (n) => String(n).padStart(2, "0");
    const day   = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year  = d.getFullYear();

    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
}

/** Ícono según el estado */
function EstadoIcon({ estado }) {
    const base = "shrink-0";
    if (estado === "RESUELTO")
        return <CheckCircle2 size={15} className={`${base} text-green-500`} />;
    if (estado === "RECHAZADA" || estado === "Anulada")
        return <XCircle size={15} className={`${base} text-red-500`} />;
    if (estado === "CREADA")
        return <Circle size={15} className={`${base} text-gray-400`} />;
    return <AlertCircle size={15} className={`${base} text-yellow-500`} />;
}

/**
 * Modal que muestra el historial de cambios de estado de una devolución.
 *
 * Props:
 *  devolucion  — objeto devolución con campo historialEstados
 *  onClose     — () => void
 */
export default function StatusHistoryModal({ devolucion, onClose }) {
    const historial = devolucion?.historialEstados ?? [];
    const producto  = devolucion?.producto ?? "—";

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            {/* Panel */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock size={17} className="text-yellow-500" />
                        <p className="font-semibold text-gray-800 text-sm">Historial de estados</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* Sub-header: nombre del producto */}
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Producto</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{producto}</p>
                </div>

                {/* Timeline */}
                <div className="px-5 py-4 max-h-72 overflow-y-auto">
                    {historial.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">Sin historial registrado.</p>
                    ) : (
                        <ol className="relative">
                            {historial.map((entry, idx) => {
                                const isLast  = idx === historial.length - 1;
                                const colorClasses = getEstadoColor(entry.estado);
                                const bgColor = colorClasses.split(" ").find((c) => c.startsWith("bg-")) ?? "bg-gray-100";

                                return (
                                    <li key={idx} className="flex gap-3 pb-4 last:pb-0">
                                        {/* Línea vertical + dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                                                <EstadoIcon estado={entry.estado} />
                                            </div>
                                            {!isLast && (
                                                <div className="w-px flex-1 bg-gray-200 mt-1" />
                                            )}
                                        </div>

                                        {/* Contenido */}
                                        <div className="pt-0.5 min-w-0">
                                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colorClasses}`}>
                                                {entry.estado.replace(/_/g, " ")}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock size={11} />
                                                {formatFecha12h(entry.fecha)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer font-medium text-gray-600"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}