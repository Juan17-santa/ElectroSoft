import { Check, X } from "lucide-react";

/**
 * Componente de selección Sí/No con animación suave.
 * Exclusivo del módulo de devoluciones.
 *
 * Props:
 *  value     — boolean: true = Sí, false = No
 *  onChange  — (value: boolean) => void
 *  readOnly  — boolean
 */
export default function GarantiaCheckbox({ value, onChange, readOnly = false }) {
    const options = [
        { label: "si",  val: true  },
        { label: "no",  val: false },
    ];

    return (
        <>
            <style>{`
                @keyframes popIn {
                    0%   { opacity: 0; transform: scale(0.4) rotate(-10deg); }
                    60%  { transform: scale(1.2) rotate(4deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .garantia-icon { animation: popIn 0.22s cubic-bezier(.4,0,.2,1) both; }
            `}</style>

            <div className="flex items-center gap-5">
                {options.map(({ label, val }) => {
                    const isSelected = value === val;
                    return (
                        <button
                            key={label}
                            type="button"
                            onClick={() => !readOnly && onChange(val)}
                            disabled={readOnly}
                            className={`
                                flex items-center gap-2.5 group
                                transition-all duration-200
                                ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            {/* CAJA */}
                            <div className={`
                                relative w-6 h-6 rounded-md border-2
                                flex items-center justify-center
                                transition-all duration-300 ease-out
                                ${isSelected
                                    ? "bg-yellow-400 border-yellow-400 shadow-md shadow-yellow-200/60 scale-110"
                                    : `border-gray-300
                                       ${!readOnly ? "group-hover:border-yellow-300 group-hover:shadow-sm" : ""}`
                                }
                            `}>
                                {isSelected && (
                                    <span className="garantia-icon">
                                        {val
                                            ? <Check size={13} className="text-white" strokeWidth={3} />
                                            : <X     size={13} className="text-white" strokeWidth={3} />
                                        }
                                    </span>
                                )}
                            </div>

                            {/* LABEL */}
                            <span className={`
                                text-sm font-medium transition-colors duration-200
                                ${isSelected ? "text-gray-800" : "text-gray-500"}
                                ${!readOnly ? "group-hover:text-gray-700" : ""}
                            `}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}