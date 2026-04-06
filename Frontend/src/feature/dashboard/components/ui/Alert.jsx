import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Zap } from "lucide-react";

/**
* Componente de Alerta (Toast) que aparece en la esquina de la pantalla.
 * Se cierra automáticamente después de 4 segundos.
 */
export default function Alert({ type, message, onClose }) {
    // Estado para guardar la hora exacta en la que se generó la alerta
    const [time, setTime] = useState("");

    useEffect(() => {
        // Al montar el componente, calculamos la hora actual (formato 12h: AM/PM)
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        setTime(formattedTime);

        // Timer para cerrar la alerta automáticamente tras 4 segundos (4000ms)
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        // Limpieza del timer si el componente se desmonta antes de los 4 segundos
        return () => clearTimeout(timer);
    }, [onClose]);

    // Variable booleana para saber si la alerta es de éxito o error
    const isSuccess = type === "success";

    return (
        /* Contenedor principal: Se posiciona arriba a la derecha con una animación */
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
            <div
                className={`flex items-start gap-4 px-6 py-5 rounded-2xl shadow-2xl w-100 backdrop-blur-md border
                ${isSuccess
                        ? "bg-green-50 border-green-300" // Estilo verde para éxito
                        : "bg-red-50 border-red-300"    // Estilo rojo para error
                    }`}
            >
                {/* SECCIÓN DEL ICONO: Cambia color e imagen según el tipo */}
                <div
                    className={`p-3 rounded-xl text-white shadow-md flex items-center justify-center
                    ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
                >
                    {isSuccess ? (
                        <CheckCircle size={22} /> // Icono de check para éxito
                    ) : (
                        <XCircle size={22} />     // Icono de X para error
                    )}
                </div>

                {/* SECCIÓN DE TEXTO */}
                <div className="flex-1">
                    {/* Título automático según el tipo */}
                    <p className="font-semibold text-gray-800 text-sm">
                        {isSuccess
                            ? "¡Todo ha salido bien!"
                            : "Algo salió mal"}
                    </p>

                    {/* Mensaje personalizado que viene por props */}
                    <p className="text-sm text-gray-600 mt-1">
                        {message}
                    </p>

                    {/* SECCIÓN DE HORA: Muestra cuándo ocurrió el evento */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Zap size={14} />
                        <span>{time}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}