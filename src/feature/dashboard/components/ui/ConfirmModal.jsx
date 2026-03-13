import { Trash2, AlertTriangle, Info } from "lucide-react";

export default function ConfirmModal({
    type = "delete",
    title,
    message,
    onConfirm,
    onCancel,
    labelConfirmar = "Confirmar",
    labelCancelar  = "Cancelar",
}) {

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
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition cursor-pointer ${current.button}`}
                    >
                        {labelConfirmar}
                    </button>
                </div>

            </div>
        </div>
    );
}