import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export default function CategorySelect({
    label,
    icon: Icon,
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar categoría",
    width = "w-full",
    hasError = false,
    onlyActive = true,
    multiple = false,
    required = true
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (open && menuRef.current) {
            const timer = setTimeout(() => {
                menuRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const selectedIds = multiple
        ? (Array.isArray(value) ? value : [])
        : (value ? [value] : []);

    const filteredOptions = options.filter(option => {
        const matchesSearch = option.name &&
            option.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (onlyActive) {
            const isActive = option.status === true;
            const isSelected = selectedIds.includes(option.id);
            return matchesSearch && (isActive || isSelected);
        }

        return matchesSearch;
    });

    const selectedOption = !multiple ? options.find(opt => opt.id === value) : null;

    const handleSelect = (option) => {
        if (multiple) {
            const isSelected = selectedIds.includes(option.id);
            const newSelection = isSelected
                ? selectedIds.filter(id => id !== option.id)
                : [...selectedIds, option.id];
            onChange(newSelection);
        } else {
            onChange(option.id);
            setOpen(false);
            setSearchTerm("");
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    const getDisplayLabel = () => {
        if (multiple) {
            if (selectedIds.length === 0) return placeholder;
            if (selectedIds.length === 1) {
                const opt = options.find(o => o.id === selectedIds[0]);
                return opt ? opt.name : `1 seleccionada`;
            }
            return `${selectedIds.length} categorías seleccionadas`;
        }
        return selectedOption ? selectedOption.name : placeholder;
    };

    const hasSelection = multiple ? selectedIds.length > 0 : !!selectedOption;

    return (
        <div ref={dropdownRef} className={`relative ${width}`}>
            <div className="flex flex-col gap-3">
                {label && (
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        {Icon && <Icon size={16} />}
                        <span>{label}{required ? " *" : ""}</span>
                    </label>
                )}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(!open);
                            if (!open) setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className={`w-full bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md border-2 flex justify-between items-center cursor-pointer hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 text-left ${hasError ? 'border-red-500' : 'border-transparent'
                            }`}
                    >
                        <span className={`truncate ${hasSelection ? "text-gray-800" : "text-gray-500"}`}>
                            {getDisplayLabel()}
                        </span>
                        <ChevronDown
                            size={18}
                            className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {open && (
                        <div ref={menuRef} className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl p-3 z-20">

                            <div className="flex items-center gap-2 mb-3 bg-gray-100 rounded-lg px-3 py-2">
                                <Search size={16} className="text-gray-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="text-gray-400 hover:text-gray-600 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="max-h-48 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => {
                                        const isSelected = multiple
                                            ? selectedIds.includes(option.id)
                                            : value === option.id;

                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => handleSelect(option)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${isSelected
                                                    ? "bg-yellow-400 text-gray-800 font-medium"
                                                    : "hover:bg-yellow-100 text-gray-700"
                                                    }`}
                                            >
                                                <span>{option.name}</span>
                                                {multiple && isSelected && (
                                                    <Check size={16} className="shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        No hay coincidencias
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}