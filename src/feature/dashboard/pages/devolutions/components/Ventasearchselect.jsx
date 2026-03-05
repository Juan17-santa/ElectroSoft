import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

/**
 * Combobox de búsqueda para seleccionar una venta por número de documento.
 * Reemplaza el <select> nativo del campo ID Venta.
 *
 * ⚠️  Definido como componente de módulo (no global) ya que su lógica
 *     es específica del formato de las ventas.
 *
 * Props:
 *  value       — id de la venta actualmente seleccionada
 *  onChange    — (id: string) => void
 *  ventasList  — array de ventas { id, numeroDocumento }
 *  disabled    — boolean
 */
export default function VentaSearchSelect({ value, onChange, ventasList = [], disabled = false }) {
    const [query, setQuery]       = useState("");
    const [open, setOpen]         = useState(false);
    const containerRef            = useRef(null);
    const inputRef                = useRef(null);

    // Etiqueta de la venta seleccionada actualmente
    const selectedLabel = (() => {
        const found = ventasList.find((v) => String(v.id) === String(value));
        if (!found) return "";
        return found.numeroDocumento || `#${String(found.id).slice(-6)}`;
    })();

    // Opciones filtradas por lo que escribe el usuario
    const filtered = ventasList.filter((v) => {
        const doc = (v.numeroDocumento || "").toLowerCase();
        const id  = String(v.id).toLowerCase();
        return doc.includes(query.toLowerCase()) || id.includes(query.toLowerCase());
    });

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (venta) => {
        onChange(String(venta.id));
        setQuery("");
        setOpen(false);
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setOpen(true);
        // Si el usuario borra todo, limpia la selección
        if (e.target.value === "") onChange("");
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

            {/* TRIGGER: muestra el valor seleccionado o el input de búsqueda */}
            <div
                onClick={handleOpen}
                className={`
                    flex items-center justify-between
                    bg-gray-200 rounded-xl px-4 py-3 text-sm w-full shadow-sm
                    transition-all duration-200
                    ${disabled
                        ? "opacity-75 cursor-not-allowed"
                        : "cursor-pointer focus-within:ring-2 focus-within:ring-gray-400"
                    }
                    ${open ? "ring-2 ring-gray-400" : ""}
                `}
            >
                {open ? (
                    // Modo búsqueda: muestra input con lupa
                    <div className="flex items-center gap-2 w-full">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Buscar por ID venta"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm"
                        />
                    </div>
                ) : (
                    // Modo display: muestra la selección actual
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
                            const label   = v.numeroDocumento || `#${String(v.id).slice(-6)}`;
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