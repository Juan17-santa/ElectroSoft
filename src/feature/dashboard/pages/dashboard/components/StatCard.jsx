import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";
import { formatFull } from "../utils/constants";

export const StatCard = ({ icon: Icon, label, value, delta = 0, color, isMoney = true, delay = 0, showDelta = true }) => {
    const animated = useCountUp(value);
    const positive = delta >= 0;
    const displayed = isMoney ? formatFull(animated) : animated.toLocaleString("es-CO");
    return (
        <div
            className="bg-white rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-sm border border-gray-200"
            style={{ animation: "kpiFadeUp .5s ease both", animationDelay: `${delay}ms` }}
        >
            <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
                style={{ background: `linear-gradient(to bottom, ${color} 0%, ${color}99 40%, ${color}33 75%, transparent 100%)` }} />
            <div className="flex items-start justify-between pl-2">
                <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-widest uppercase">{label}</p>
                    <p className="text-[1.55rem] font-bold text-gray-900 mt-1 tabular-nums leading-none">{displayed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: color + "1a" }}>
                    <Icon size={20} style={{ color }} strokeWidth={2} />
                </div>
            </div>
            {showDelta && (
                delta === null ? (
                    <div className="flex items-center gap-2 pl-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">—</span>
                        <span className="text-[11px] text-gray-400">vs mes anterior</span>
                    </div>
                ) : (
                <div className="flex items-center gap-2 pl-2">
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full
            ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(delta).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-gray-400">vs mes anterior</span>
                </div>
                )
            )}
        </div>
    );
}