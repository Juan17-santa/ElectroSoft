import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
    label,
    icon: Icon,
    options = [],
    value,
    onChange,
    multiple = false,
    placeholder = "Seleccionar",
    width = "w-full"
}) {

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (option) => {

        if (multiple) {

            if (value.includes(option)) {
                onChange(value.filter(v => v !== option));
            } else {
                onChange([...value, option]);
            }

        } else {

            onChange(option);
            setOpen(false);

        }
    };

    const getLabel = () => {

        if (multiple) {
            return value.length > 0
                ? `${value.length} seleccionada(s)`
                : placeholder;
        }

        return value || placeholder;
    };

    return (
        <div ref={dropdownRef} className={`relative ${width}`}>
            <div className="flex flex-col gap-1">

                {/* LABEL */}
                {label && (
                    <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                        {Icon && <Icon size={16} />}
                        <span>{label}</span>
                    </div>
                )}

                {/* BOTON */}
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md flex justify-between items-center"
                >
                    <span>{getLabel()}</span>

                    <ChevronDown
                        size={18}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {/* DROPDOWN */}
                {open && (
                    <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl p-3 max-h-48 overflow-y-auto z-20">

                        {options.map(option => (

                            multiple ? (

                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 py-1 cursor-pointer hover:bg-yellow-100 rounded px-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={value.includes(option.value)}
                                        onChange={() => handleSelect(option.value)}
                                        className="accent-yellow-400"
                                    />
                                    {option.label}
                                </label>

                            ) : (

                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm transition"
                                >
                                    {option.label}
                                </button>

                            )

                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}