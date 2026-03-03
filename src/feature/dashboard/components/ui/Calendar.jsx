import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/**
 * Componente Calendar reutilizable
 * 
 * @param {string} fechaSeleccionada - Fecha en formato ISO (YYYY-MM-DD)
 * @param {function} onSeleccionar - Callback que recibe la fecha ISO seleccionada
 * @param {function} onCerrar - Callback para cerrar el calendario
 */
function CalendarDropdown({ fechaSeleccionada, onSeleccionar, onCerrar }) {
    const hoy = new Date();
    const [viewYear, setViewYear] = useState(fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00").getFullYear() : hoy.getFullYear());
    const [viewMonth, setViewMonth] = useState(fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00").getMonth() : hoy.getMonth());
    const [animDir, setAnimDir] = useState(null);
    const [animKey, setAnimKey] = useState(0);

    const navMes = (dir) => {
        setAnimDir(dir === 1 ? "right" : "left");
        setAnimKey(k => k + 1);
        let m = viewMonth + dir;
        let y = viewYear;
        if (m > 11) { m = 0; y++; }
        if (m < 0) { m = 11; y--; }
        setViewMonth(m);
        setViewYear(y);
    };

    const primerDia = new Date(viewYear, viewMonth, 1).getDay();
    const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate();
    const celdas = Array(primerDia).fill(null).concat(Array.from({ length: diasEnMes }, (_, i) => i + 1));

    const esFuturo = (dia) => {
        const fecha = new Date(viewYear, viewMonth, dia);
        fecha.setHours(0, 0, 0, 0);
        const h = new Date(); h.setHours(0, 0, 0, 0);
        return fecha > h;
    };

    const esHoy = (dia) => {
        return dia === hoy.getDate() && viewMonth === hoy.getMonth() && viewYear === hoy.getFullYear();
    };

    const esSeleccionado = (dia) => {
        if (!fechaSeleccionada) return false;
        const s = new Date(fechaSeleccionada + "T00:00:00");
        return dia === s.getDate() && viewMonth === s.getMonth() && viewYear === s.getFullYear();
    };

    const handleDia = (dia) => {
        if (esFuturo(dia)) return;
        const mes = String(viewMonth + 1).padStart(2, "0");
        const d = String(dia).padStart(2, "0");
        onSeleccionar(`${viewYear}-${mes}-${d}`);
        onCerrar();
    };

    return (
        <>
            {/* Animaciones CSS */}
            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div
                className="absolute z-50 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72"
                style={{ animation: "fadeSlideDown 0.25s cubic-bezier(.4,0,.2,1)" }}
            >
                {/* Cabecera */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => navMes(-1)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                    >
                        <ChevronLeft size={18} className="text-gray-500" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 select-none">
                        {MESES[viewMonth]} {viewYear}
                    </span>
                    <button
                        onClick={() => navMes(1)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                    >
                        <ChevronRight size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Días de semana */}
                <div className="grid grid-cols-7 mb-1">
                    {DIAS_SEMANA.map(d => (
                        <div key={d} className="text-center text-xs text-gray-400 font-medium py-1 select-none">{d}</div>
                    ))}
                </div>

                {/* Celdas del mes */}
                <div
                    key={animKey}
                    className="grid grid-cols-7 gap-y-0.5"
                    style={{ animation: `slideIn${animDir === "right" ? "Right" : animDir === "left" ? "Left" : "Right"} 0.22s cubic-bezier(.4,0,.2,1)` }}
                >
                    {celdas.map((dia, i) => {
                        if (!dia) return <div key={`empty-${i}`} />;
                        const futuro = esFuturo(dia);
                        const hoyFlag = esHoy(dia);
                        const sel = esSeleccionado(dia);
                        return (
                            <button
                                key={dia}
                                onClick={() => handleDia(dia)}
                                disabled={futuro}
                                className={`
                                    w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium
                                    transition-all duration-200 cursor-pointer
                                    ${sel ? "bg-yellow-400 text-black shadow-md scale-110" : ""}
                                    ${!sel && hoyFlag ? "border border-yellow-400 text-yellow-600" : ""}
                                    ${!sel && !hoyFlag && !futuro ? "hover:bg-yellow-100 hover:scale-105 text-gray-700" : ""}
                                    ${futuro ? "text-gray-300 cursor-not-allowed" : ""}
                                `}
                            >
                                {dia}
                            </button>
                        );
                    })}
                </div>

                {/* Pie: ir a hoy */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={() => {
                            const h = new Date();
                            const mes = String(h.getMonth() + 1).padStart(2, "0");
                            const d = String(h.getDate()).padStart(2, "0");
                            onSeleccionar(`${h.getFullYear()}-${mes}-${d}`);
                            onCerrar();
                        }}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition duration-300 cursor-pointer"
                    >
                        Hoy
                    </button>
                </div>
            </div>
        </>
    );
}

/**
 * Helper: Formatea fecha ISO → DD/MM/YYYY
 */
function formatearFecha(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

/**
 * Componente Calendar con input y dropdown
 * 
 * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
 * @param {function} onFechaChange - Callback que recibe la fecha ISO seleccionada
 * @param {string} label - Etiqueta del campo (default: "Fecha")
 * @param {boolean} required - Si el campo es obligatorio (default: false)
 * @param {string} className - Clases CSS adicionales para el contenedor
 */
export default function Calendar({
    fechaISO,
    onFechaChange,
    label = "Fecha",
    required = false,
    className = ""
}) {
    const [showCalendario, setShowCalendario] = useState(false);
    const calRef = useRef(null);

    // Cerrar calendario al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (calRef.current && !calRef.current.contains(e.target)) {
                setShowCalendario(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {/* LABEL */}
            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                <CalendarDays size={20} />
                <span>{label} {required && "*"}</span>
            </div>

            {/* INPUT CON CALENDARIO */}
            <div className="relative" ref={calRef}>
                <button
                    type="button"
                    onClick={() => setShowCalendario(v => !v)}
                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md w-52 text-left transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer flex items-center justify-between gap-2
                        ${fechaISO ? "text-gray-700" : "text-gray-400"}`}
                >
                    <span>
                        {fechaISO ? formatearFecha(fechaISO) : "Seleccionar fecha"}
                    </span>
                    <CalendarDays
                        size={16}
                        className={`transition duration-300 ${showCalendario ? "text-yellow-500 rotate-6" : "text-gray-400"}`}
                    />
                </button>

                {/* CALENDARIO DESPLEGABLE */}
                {showCalendario && (
                    <CalendarDropdown
                        fechaSeleccionada={fechaISO}
                        onSeleccionar={onFechaChange}
                        onCerrar={() => setShowCalendario(false)}
                    />
                )}
            </div>
        </div>
    );
}

// Exportar también el helper de formateo para usar en otros componentes
export { formatearFecha };
