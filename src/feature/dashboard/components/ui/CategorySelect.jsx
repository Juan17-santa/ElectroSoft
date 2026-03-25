import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export default function CategorySelect({
    label,
    icon: Icon,
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar categoría",
    width = "w-full",
    hasError = false,
    onlyActive = true // <--- NUEVA PROP: Por defecto solo muestra activas
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Filtrar opciones según el término de búsqueda
    const filteredOptions = options.filter(option => {
        // Coincidencia con búsqueda
        const matchesSearch = option.nombre &&
            option.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        // Regla de negocio:
        // Si onlyActive es true, mostramos solo si está activa O si es la opción seleccionada actualmente
        // (Esto evita que en edición el campo quede en blanco si la categoría se inactivó)
        if (onlyActive) {
            const isActive = option.estado === true;
            const isSelected = option.id === value;
            return matchesSearch && (isActive || isSelected);
        }

        return matchesSearch;
    });

    const selectedOption = options.find(opt => opt.id === value);

    const handleSelect = (option) => {
        onChange(option.id);
        setOpen(false);
        setSearchTerm("");
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div ref={dropdownRef} className={`relative ${width}`}>
            <div className="flex flex-col gap-3">
                {/* LABEL */}
                {label && (
                    <label className="flex items-center gap-2 text-yellow-500 font-medium">
                        {Icon && <Icon size={16} />}
                        <span>{label} *</span>
                    </label>
                )}

                {/* BOTÓN CON BUSCADOR */}
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
                        <span className={selectedOption ? "text-gray-800" : "text-gray-500"}>
                            {selectedOption ? selectedOption.nombre : placeholder}
                        </span>
                        <ChevronDown
                            size={18}
                            className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* DROPDOWN CON BÚSQUEDA */}
                    {open && (
                        <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl p-3 z-20">

                            {/* INPUT DE BÚSQUEDA */}
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

                            {/* LISTA DE OPCIONES */}
                            <div className="max-h-48 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${value === option.id
                                                    ? "bg-yellow-400 text-gray-800 font-medium"
                                                    : "hover:bg-yellow-100 text-gray-700"
                                                }`}
                                        >
                                            {option.nombre}
                                        </button>
                                    ))
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
