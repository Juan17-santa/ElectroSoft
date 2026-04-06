import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

/**
 * Combobox de búsqueda para seleccionar una venta por número de documento.
 *
 * Props:
 *  value       — id de la venta seleccionada
 *  onChange    — (id: string) => void
 *  onBlur      — () => void   (para marcar campo como tocado)
 *  ventasList  — array de ventas { id, numeroDocumento }
 *  disabled    — boolean
 *  estado      — { valido, mensaje } | null  (para ring de validación)
 */
export default function VentaSearchSelect({
    value, onChange, onBlur, ventasList = [], disabled = false, estado = null,
}) {
    const [query, setQuery]   = useState("");
    const [open, setOpen]     = useState(false);
    const containerRef        = useRef(null);
    const inputRef            = useRef(null);

    const selectedLabel = (() => {
        const found = ventasList.find((v) => String(v.id) === String(value));
        if (!found) return "";
        return found.numeroDocumento || `#${String(found.id).slice(-6)}`;
    })();

    const filtered = ventasList.filter((v) => {
        const doc = (v.numeroDocumento || "").toLowerCase();
        const id  = String(v.id).toLowerCase();
        return doc.includes(query.toLowerCase()) || id.includes(query.toLowerCase());
    });

    // Ring class según estado de validación
    const ringClass = !estado
        ? "focus-within:ring-2 focus-within:ring-gray-400"
        : estado.valido
            ? "ring-1 ring-green-300"
            : "ring-1 ring-red-300";

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                if (open) onBlur?.();
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleSelect = (venta) => {
        onChange(String(venta.id));
        setQuery("");
        setOpen(false);
        onBlur?.();
    };

    const handleOpen = () => {
        if (disabled) return;
        setOpen((prev) => !prev);
        if (!open) {
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">

            {/* TRIGGER */}
            <div
                onClick={handleOpen}
                className={`
                    flex items-center justify-between
                    bg-gray-200 rounded-xl px-4 py-3 text-sm w-full shadow-sm
                    transition-all duration-200
                    ${disabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
                    ${open ? "ring-2 ring-gray-400" : ringClass}
                `}
            >
                {open ? (
                    <div className="flex items-center gap-2 w-full">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por N° documento..."
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm"
                        />
                    </div>
                ) : (
                    <span className={selectedLabel ? "text-gray-700" : "text-gray-400"}>
                        {selectedLabel || "Seleccionar..."}
                    </span>
                )}

                <ChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </div>

            {/* DROPDOWN */}
            {open && !disabled && (
                <div className="
                    absolute z-50 top-full mt-1 w-full
                    bg-white border border-gray-200 rounded-xl shadow-lg
                    max-h-52 overflow-y-auto
                    animate-[fadeSlideDown_0.15s_ease-out]
                ">
                    <style>{`
                        @keyframes fadeSlideDown {
                            from { opacity: 0; transform: translateY(-6px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>

                    {filtered.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400 text-center">
                            Sin resultados para "{query}"
                        </p>
                    ) : (
                        filtered.map((v) => {
                            const label    = v.numeroDocumento || `#${String(v.id).slice(-6)}`;
                            const isActive = String(v.id) === String(value);
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => handleSelect(v)}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm
                                        flex items-center justify-between
                                        transition-colors duration-150
                                        ${isActive
                                            ? "bg-yellow-50 text-yellow-700 font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <span>{label}</span>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}