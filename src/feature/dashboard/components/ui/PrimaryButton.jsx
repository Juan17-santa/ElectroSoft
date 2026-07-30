import { useState } from "react";

export default function PrimaryButton({
    children,
    onClick,
    icon: Icon,
    type = "button",
    disabled = false,
    loading = false,
    loadingText = "Procesando..."
}) {

    // ESTADO DE CARGA INTERNO
    const [internalLoading, setInternalLoading] = useState(false);

    // FUNCION PARA EL ESTADO DE CARGA
    const handleClick = async (e) => {
        if (internalLoading) return;

        try {
            setInternalLoading(true);
            await onClick?.(e);
        } finally {
            setInternalLoading(false);
        }
    };

    const isLoading = onClick ? internalLoading : loading;

    return (
        <button
            type={type}
            onClick={type === "button" ? handleClick : onClick}
            disabled={disabled || isLoading}
            className={`flex items-center justify-center gap-2
                px-6 py-2.5 text-sm rounded-lg shadow-md font-medium transition
                ${disabled || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-white to-yellow-300 hover:shadow-lg cursor-pointer"
                }
                `}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                    {loadingText}
                </>
            ) : (
                <>
                    {Icon && <Icon size={18} />}
                    {children}
                </>
            )}
        </button>
    );
}