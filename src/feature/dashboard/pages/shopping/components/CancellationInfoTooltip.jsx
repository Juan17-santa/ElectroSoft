import { useState, useRef } from "react";
import { Info } from "lucide-react";

export default function CancellationInfoTooltip({ cancelInfo }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    if (!cancelInfo) {
        return null;
    }

    const handleMouseEnter = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top - 20, // Un poco arriba del botón
                left: rect.left - 280, // A la izquierda con espacio
            });
        }
        setShowTooltip(true);
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition duration-300 cursor-help"
            >
                <Info size={18} className="text-red-600" />
            </button>

            {showTooltip && (
                <div
                    className="fixed z-50 bg-gray-50 text-gray-400 rounded-xl shadow-2xl p-4 w-64 border border-gray-400"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                >
                    {/* Contenido */}
                    <div className="space-y-3">
                            <div>
                                <p className="text-xs tracking-wide text-gray-500 font-semibold">
                                    Anulado por
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {cancelInfo.usuario}
                                </p>
                            </div>

                            <div className="border-t-2 border-yellow-300 pt-3">
                                <p className="text-xs tracking-wide text-gray-500 font-semibold">
                                    Fecha y Hora
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatDateTime(cancelInfo.fechaAnulacion)}
                                </p>
                            </div>

                            <div className="border-t-2 border-yellow-300 pt-3">
                                <p className="text-xs tracking-wide text-gray-500 font-semibold">
                                    Motivo
                                </p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    {cancelInfo.motivo}
                                </p>
                            </div>
                        </div>
                    </div>
                
            )}
        </div>
    );
}