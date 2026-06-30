import { Trash2, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import Calendar from "./Calendar";

export default function ConfirmModal({
    type = "delete",
    title,
    message,
    onConfirm,
    onCancel,
    labelConfirmar = "Confirmar",
    labelCancelar = "Cancelar",
    showDateFilter = false,
}) {

    const [isLoading, setIsLoading] = useState(false);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const fmt = (d) => d.toISOString().split("T")[0];

    const [fechaInicio, setFechaInicio] = useState(fmt(firstDayOfMonth));
    const handleFechaInicio = (value) => {
        if (value > fmt(today)) return;
        if (value > fechaFin) return;
        setFechaInicio(value);
    };

    const [fechaFin, setFechaFin] = useState(fmt(today));
    const handleFechaFin = (value) => {
        if (value > fmt(today)) return;
        if (value < fechaInicio) return;
        setFechaFin(value);
    };

    const handleConfirm = async () => {
        try {
            setIsLoading(true);

            if (type === "info" && showDateFilter) {
                await onConfirm?.({
                    fechaInicio,
                    fechaFin
                });
            } else {
                await onConfirm?.();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        delete: {
            icon: <Trash2 size={25} />,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            border: "border-red-200 border-2",
            button: "bg-red-500 hover:bg-red-600"
        },
        warning: {
            icon: <AlertTriangle size={25} />,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            border: "border-yellow-200 border-2",
            button: "bg-yellow-500 hover:bg-yellow-600"
        },
        info: {
            icon: <Info size={25} />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            border: "border-blue-200 border-2",
            button: "bg-blue-500 hover:bg-blue-600"
        }
    };

    const current = variants[type];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">

            <div className={`bg-white rounded-2xl p-6 w-96 shadow-2xl border ${current.border} animate-scale-in`}>

                {/* HEADER CON ICONO */}
                <div className="flex items-center gap-4 mb-4">

                    <div className={`p-3 rounded-xl ${current.iconBg} ${current.iconColor}`}>
                        {current.icon}
                    </div>

                    <h3 className="font-semibold text-gray-800 text-lg">
                        {title}
                    </h3>
                </div>

                {/* MENSAJE */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* FECHAS */}
                {type === "info" && showDateFilter && (
                    <div className="flex flex-col gap-4 mb-4">

                        <Calendar
                            label="Fecha inicio"
                            fechaISO={fechaInicio}
                            onFechaChange={handleFechaInicio}
                            maxDate={fechaFin}
                        />

                        <Calendar
                            label="Fecha fin"
                            fechaISO={fechaFin}
                            onFechaChange={handleFechaFin}
                            minDate={fechaInicio}
                            maxDate={fmt(today)}
                        />

                    </div>
                )}

                {/* BOTONES */}
                <div className="flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition cursor-pointer font-medium"
                    >
                        {labelCancelar}
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex items-center gap-2
                            px-4 py-2 rounded-lg text-white font-medium shadow-sm transition
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${current.button}
                        `}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}

                        {isLoading ? "Procesando..." : labelConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}