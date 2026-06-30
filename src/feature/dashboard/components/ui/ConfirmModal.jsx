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
    showFormatSelector = false,
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

    const [format, setFormat] = useState("pdf");

    const handleConfirm = async () => {
        try {
            setIsLoading(true);

            if (type === "info") {
                const data = {};
                if (showDateFilter) {
                    data.fechaInicio = fechaInicio;
                    data.fechaFin = fechaFin;
                }
                if (showFormatSelector) {
                    data.format = format;
                }
                await onConfirm?.(data);
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

                {/* FORMATO */}
                {type === "info" && showFormatSelector && (
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="text-sm font-medium text-gray-700">Formato del reporte</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormat("excel")}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${format === "excel" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.17 3.25Q22.4 3.25 22.4 4.48V19.52Q22.4 20.75 21.17 20.75H7.83Q6.6 20.75 6.6 19.52V17.3H3.46Q2.23 17.3 2.23 16.07V7.93Q2.23 6.7 3.46 6.7H6.6V4.48Q6.6 3.25 7.83 3.25H21.17ZM14.15 13.91L17.15 18H19.4L15.36 12L19.26 6H17.03L14.28 10.15L11.53 6H9.27L13.18 12L9.14 18H11.4L14.15 13.91ZM6.6 15.8V8.2H3.7V15.8H6.6Z"/></svg>
                                Excel
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormat("pdf")}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${format === "pdf" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.38 13.43Q11.14 14.15 10.74 15.02Q10.16 16.27 9.4 17.58Q9.12 18.06 8.87 18.52L8.68 18.86Q8.02 20.08 7.37 20.48Q6.98 20.73 6.55 20.73Q6 20.73 5.75 20.35Q5.5 19.98 5.61 19.34Q5.7 18.78 6.13 18.06Q6.56 17.33 7.15 16.65L7.22 16.57Q8 15.69 8.82 14.86Q9.63 14.03 10.22 13.5L10.36 13.38Q10.96 12.87 11.52 12.56L11.58 12.52Q11.48 11.96 11.39 11.39V11.23Q11.12 9.68 10.98 8.01Q10.87 6.64 11.02 5.56Q11.14 4.54 11.66 4Q12.18 3.47 12.88 3.47Q13.48 3.47 13.84 3.86Q14.2 4.25 14.2 4.88Q14.2 5.37 13.98 5.92Q13.75 6.47 13.33 7.04Q12.9 7.6 12.35 8.02Q11.8 8.44 11.3 8.64Q11.45 10.25 11.75 11.89L11.79 12.12Q12.13 13.98 12.63 15.6L12.66 15.68Q13.06 16.62 13.56 17.33Q14.06 18.04 14.6 18.42Q15.13 18.79 15.67 18.79Q16.29 18.79 16.71 18.32Q17.13 17.84 17.13 17.06Q17.13 16.32 16.73 15.67Q16.32 15.02 15.66 14.54Q15 14.06 14.22 13.82Q13.44 13.58 12.7 13.58Q12 13.58 11.38 13.43ZM6.76 19.4Q6.98 19.4 7.29 19.06Q7.61 18.71 7.96 18.15Q8.31 17.58 8.64 16.96Q8.96 16.33 9.17 15.82L9.22 15.7Q8.51 16.48 7.89 17.21Q7.27 17.93 6.91 18.47Q6.78 18.66 6.75 18.83Q6.71 19 6.76 19.4ZM12.79 4.87Q12.56 4.87 12.44 5.12Q12.32 5.36 12.27 5.75Q12.21 6.13 12.23 6.6Q12.25 7.07 12.33 7.55Q12.68 7.15 12.92 6.71Q13.15 6.27 13.2 5.86Q13.23 5.48 13.08 5.17Q12.93 4.87 12.79 4.87ZM15.42 17.52Q15.04 17.52 14.65 17.22Q14.26 16.91 13.89 16.42Q13.52 15.93 13.23 15.29L13.18 15.17Q13.79 15.34 14.33 15.66Q14.86 15.98 15.22 16.38Q15.58 16.78 15.68 17.15L15.69 17.21Q15.69 17.34 15.55 17.43Q15.42 17.52 15.42 17.52ZM12.32 13.33Q12.32 13.33 12.34 13.33Q12.78 13.43 13.24 13.6Q13.69 13.77 14.07 14.04L14.15 14.1Q13.75 13.71 13.29 13.29L13.22 13.23Q12.77 12.82 12.32 12.42Q12.07 12.21 11.83 12Q11.66 12.34 11.53 12.77L11.47 12.97Q11.75 13.14 12.04 13.25L12.11 13.28L12.32 13.33ZM20 2H4C2.9 2 2.01 2.9 2.01 4L2 20C2 21.1 2.89 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z"/></svg>
                                PDF
                            </button>
                        </div>
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