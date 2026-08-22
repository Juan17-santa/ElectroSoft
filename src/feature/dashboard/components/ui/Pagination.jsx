import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages === 0) return null;

    const getPages = () => {
        const pages = [];

        // Caso 1: Pocas páginas, se muestran todas
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        }
        // Caso 2: Estamos al inicio
        else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...");
        }
        // Caso 3: Estamos al final
        else if (currentPage >= totalPages - 2) {
            pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        }
        // Caso 4: Estamos en el medio (Mantiene 5 elementos)
        else {
            pages.push("...", currentPage, currentPage + 1, currentPage + 2, "...");
        }

        return pages;
    };

    return (
        <div className="flex items-center gap-1 bg-[#e7e9ee] px-2 py-1 rounded-2xl w-fit shadow-sm">
            {/* Botón Anterior */}
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
                <ChevronLeft size={18} className="text-gray-500" />
            </button>

            {/* Renderizado de Números y Puntos */}
            <div className="flex items-center gap-1">
                {getPages().map((page, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={page === "..."}
                        onClick={() => page !== "..." && onPageChange(page)}
                        className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${currentPage === page
                            ? "bg-[#FFC107] text-black shadow-sm"
                            : page === "..."
                                ? "text-gray-500 cursor-default px-1"
                                : "text-gray-600 hover:bg-gray-300 cursor-pointer"
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Botón Siguiente */}
            <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
                <ChevronRight size={18} className="text-gray-500" />
            </button>
        </div>
    );
}