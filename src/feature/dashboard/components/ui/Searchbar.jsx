import { Search, Plus, FileText } from "lucide-react";

/**
 * Componente SearchBar reutilizable
 * 
 * @param {string} searchTerm - Valor del término de búsqueda
 * @param {function} onSearchChange - Función que se ejecuta al cambiar el input
 * @param {string} placeholder - Texto placeholder del input
 * @param {function} onCreateClick - Función que se ejecuta al hacer clic en "Crear/Nueva"
 * @param {string} createButtonText - Texto del botón de crear
 * @param {function} onReportClick - (Opcional) Función para generar reporte
 * @param {boolean} showReportButton - (Opcional) Mostrar botón de reporte, default: false
 */
export default function SearchBar({
    searchTerm,
    onSearchChange,
    placeholder = "Buscar...",
    onCreateClick,
    createButtonText = "Crear",
    onReportClick,
    showReportButton = false,
    showCreateButton = true,
}) {
    return (
        <div className="flex justify-between gap-3">
            {/* BUSCADOR */}
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 flex-1">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full outline-none text-md placeholder-gray-400"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>

            {/* BOTON GENERAR REPORTE (Opcional) */}
            {showReportButton && onReportClick && (
                <button
                    onClick={onReportClick}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition duration-300 shadow-sm cursor-pointer"
                >
                    <FileText size={18} className="text-gray-500" />
                    Generar reporte
                </button>
            )}

            {/* BOTON CREAR (Opcional) */}
            {showCreateButton && (
                <div
                    className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 hover:shadow-lg transition duration-500"
                    onClick={onCreateClick}
                >
                    <Plus />
                    <button type="button" className="cursor-pointer whitespace-nowrap">
                        {createButtonText}
                    </button>
                </div>
            )}
        </div>
    );
}
