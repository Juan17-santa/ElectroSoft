import { useState } from "react";
import { TrendingUp, Tag, ArrowRight, CheckCircle2, Info } from "lucide-react";

/**
 * PriceReviewModal — Componente exclusivo del módulo de compras.
 *
 * Muestra, producto por producto, el precio promedio calculado (WAC)
 * vs el precio de venta sugerido, permitiendo elegir cuál aplicar
 * a cada uno de forma independiente.
 *
 * Props:
 *   - productos : [{ id, nombre, wacCalculado, precioVenta }]
 *   - onConfirmar: (selecciones: { [id]: "wac" | "sugerido" }) => void
 *   - onCancelar: () => void
 */
export default function PriceReviewModal({ productos, onConfirmar, onCancelar }) {
    // Estado inicial: todos en "wac" (precio promedio ponderado)
    const [selecciones, setSelecciones] = useState(
        Object.fromEntries(productos.map((p) => [p.id, "wac"]))
    );

    const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

    const toggle = (id, opcion) =>
        setSelecciones((prev) => ({ ...prev, [id]: opcion }));

    const countSugeridos = Object.values(selecciones).filter((v) => v === "sugerido").length;
    const countWac = productos.length - countSugeridos;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">

                {/* ── HEADER ───────────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-yellow-50 rounded-xl">
                            <TrendingUp size={18} className="text-yellow-500" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">
                            Revisión de precios
                        </h2>
                    </div>
                    <p className="text-xs text-gray-400 ml-11 leading-relaxed">
                        El precio de venta sugerido difiere del promedio calculado (WAC).
                        Decide para cada producto cuál aplicar al inventario.
                    </p>
                </div>

                {/* ── LEYENDA ──────────────────────────────────────── */}
                <div className="flex gap-5 px-6 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                        Precio promedio (WAC)
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                        Precio sugerido
                    </span>
                </div>

                {/* ── LISTA DE PRODUCTOS ───────────────────────────── */}
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                    {productos.map((p) => {
                        const sel = selecciones[p.id];
                        const diferencia = p.precioVenta - p.wacCalculado;
                        const esMayor = diferencia > 0;

                        return (
                            <div key={p.id} className="px-6 py-4">

                                {/* Fila: nombre + diferencia */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-gray-800 text-sm truncate mr-2">
                                        {p.nombre}
                                    </span>

                                </div>

                                {/* Opciones de precio */}
                                <div className="grid grid-cols-2 gap-2.5">

                                    {/* Opción: WAC */}
                                    <button
                                        onClick={() => toggle(p.id, "wac")}
                                        className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                                            sel === "wac"
                                                ? "border-blue-400 bg-blue-50"
                                                : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                                        }`}
                                    >
                                        {sel === "wac" && (
                                            <CheckCircle2
                                                size={13}
                                                className="absolute top-2 right-2 text-blue-500"
                                            />
                                        )}
                                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                            <Info size={10} />
                                            Precio promedio
                                        </span>
                                        <span className="text-base font-bold text-blue-600">
                                            {fmt(p.wacCalculado)}
                                        </span>
                                        <span className="text-xs text-gray-400 leading-tight">
                                            Calculado con el inventario actual
                                        </span>
                                    </button>

                                    {/* Opción: Sugerido */}
                                    <button
                                        onClick={() => toggle(p.id, "sugerido")}
                                        className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                                            sel === "sugerido"
                                                ? "border-yellow-400 bg-yellow-50"
                                                : "border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/30"
                                        }`}
                                    >
                                        {sel === "sugerido" && (
                                            <CheckCircle2
                                                size={13}
                                                className="absolute top-2 right-2 text-yellow-500"
                                            />
                                        )}
                                        
                                        <div className="flex">
                                            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                <Tag size={10} />
                                                Precio sugerido
                                            </span>
                                            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${esMayor
                                                ? "bg-green-50 text-green-600"
                                                : "bg-red-50 text-red-500"
                                                }`}>
                                                {esMayor ? "▲" : "▼"} {fmt(Math.abs(diferencia))}
                                            </span>

                                        </div>

                                        <span className="text-base font-bold text-yellow-600">
                                            {fmt(p.precioVenta)}
                                        </span>
                                        <span className="text-xs text-gray-400 leading-tight">
                                            Ingresado en esta compra
                                        </span>
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── FOOTER ───────────────────────────────────────── */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        {countSugeridos === 0 && "Todos usarán el precio promedio."}
                        {countSugeridos === productos.length && "Todos usarán el precio sugerido."}
                        {countSugeridos > 0 && countSugeridos < productos.length && (
                            <>
                                <span className="text-yellow-500 font-semibold">{countSugeridos}</span> con precio sugerido
                                {" · "}
                                <span className="text-blue-500 font-semibold">{countWac}</span> con precio promedio
                            </>
                        )}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancelar}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 transition-all duration-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer text-sm whitespace-nowrap"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onConfirmar(selecciones)}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-all duration-200 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer text-sm whitespace-nowrap"
                        >
                            Confirmar
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}