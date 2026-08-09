import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Zap } from "lucide-react";

export default function Alert({ type = "success", message, onClose, isLeaving = false }) {
    const [time, setTime] = useState("");

    useEffect(() => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        setTime(formattedTime);
    }, []);

    const isSuccess = type === "success";
    const animation = isLeaving ? "animate-slide-out-right" : "animate-slide-in";

    return (
        <div className={`w-[90vw] sm:w-auto sm:max-w-sm ${animation}`}>
            <div
                className={`flex items-start gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 rounded-2xl shadow-2xl 
                w-[90vw] sm:w-112.5 max-w-sm backdrop-blur-md border transition-all duration-300
                ${isSuccess
                        ? "bg-green-50 border-green-300"
                        : "bg-red-50 border-red-300"
                    }`}
            >
                {/* ICONO */}
                <div
                    className={`p-2 sm:p-3 rounded-xl text-white shadow-md flex items-center justify-center
                    ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
                >
                    {isSuccess ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                </div>

                {/* CONTENIDO */}
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                        {isSuccess
                            ? "¡Todo ha salido bien!"
                            : "Algo salió mal"}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {message}
                    </p>

                    {/* HORA */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-gray-500">
                        <Zap size={12} />
                        <span>{time}</span>
                    </div>
                </div>

                {/* BOTÓN CERRAR */}
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-sm ml-2"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}