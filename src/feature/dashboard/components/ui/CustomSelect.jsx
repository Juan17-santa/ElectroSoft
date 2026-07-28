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
    width = "w-full",
    disabled = false,
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

    const handleSelect = (optionValue) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            if (current.includes(optionValue)) {
                onChange(current.filter((v) => v !== optionValue));
            } else {
                onChange([...current, optionValue]);
            }
        } else {
            onChange(optionValue);
            setOpen(false);
        }
    };

    const getLabel = () => {
        if (multiple) {
            return Array.isArray(value) && value.length > 0
                ? `${value.length} seleccionada(s)`
                : placeholder;
        }
        const selectedOption = options.find((opt) => opt.value === value);
        if (selectedOption) return selectedOption.label;
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
                    onClick={() => {
                        if (disabled) return;
                        setOpen(!open);
                    }}
                    disabled={disabled}
                    className={`w-full bg-gray-200 rounded-xl px-4 py-3 text-gray-500 text-sm shadow-md flex justify-between items-center gap-2 min-w-0 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    <span className="truncate min-w-0 flex-1 text-left">{getLabel()}</span>
                    <ChevronDown
                        size={18}
                        className={`transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {/* DROPDOWN */}
                {open && !disabled && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-xl p-3 max-h-48 overflow-y-auto z-20 shadow-[0_0_20px_rgba(0,0,0,0.15)]">
                        {options.map((option) => (
                            multiple ? (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 py-1 cursor-pointer hover:bg-yellow-100 rounded px-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(value) && value.includes(option.value)}
                                        onChange={() => handleSelect(option.value)}
                                        className="accent-yellow-400"
                                    />
                                    {option.label}
                                </label>
                            ) : (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !option.disabled && handleSelect(option.value)}
                                    disabled={option.disabled}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                        option.disabled
                                            ? "text-gray-400 cursor-not-allowed line-through"
                                            : "hover:bg-yellow-100 cursor-pointer"
                                    }`}
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