import { Search, Plus, FileText, X, Calendar } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
    searchTerm,
    onSearchChange,
    placeholder = "Buscar...",
    onCreateClick,
    createButtonText = "Crear",
    onReportClick,
    showReportButton = false,
    showCreateButton = true,
    showDateFilter = false,
}) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const fmt = (d) => d.toISOString().split("T")[0];

    const [showModal,   setShowModal]   = useState(false);
    const [fechaInicio, setFechaInicio] = useState(fmt(firstDayOfMonth));
    const [fechaFin,    setFechaFin]    = useState(fmt(today));

    const formatDisplay = (dateStr) => {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-");
        return `${d}/${m}/${y}`;
    };

    const handleFechaInicio = (e) => {
        const val = e.target.value;
        if (val > fmt(today)) return;
        if (val > fechaFin) return;
        setFechaInicio(val);
    };

    const handleFechaFin = (e) => {
        const val = e.target.value;
        if (val > fmt(today)) return;
        if (val < fechaInicio) return;
        setFechaFin(val);
    };

    const handleConfirm = () => {
        showDateFilter
            ? onReportClick?.({ fechaInicio, fechaFin })
            : onReportClick?.();
        setShowModal(false);
    };

    return (
        <>
            <div className="flex justify-between gap-3">
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

                {showReportButton && onReportClick && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition duration-300 shadow-sm cursor-pointer"
                    >
                        <FileText size={18} className="text-gray-500" />
                        Generar reporte
                    </button>
                )}

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

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

                        {/* Header */}
                        <div className="p-6 pb-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={20} className="text-yellow-500" />
                                <p className="text-base font-semibold text-gray-800">Generar reporte</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">

                            <p className="text-sm text-gray-500">
                                {showDateFilter
                                    ? "Selecciona el rango de fechas para incluir en el reporte."
                                    : "¿Deseas generar el reporte con todos los registros?"}
                            </p>

                            {/* FILTRO DE FECHAS */}
                            {showDateFilter && (
                                <div className="flex flex-col gap-3">

                                    {/* Preview del rango */}
                                    <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-400 mb-0.5">Desde</span>
                                            <span className="text-sm font-semibold text-gray-700">{formatDisplay(fechaInicio)}</span>
                                        </div>
                                        <div className="h-px w-10 bg-yellow-300" />
                                        <Calendar size={16} className="text-yellow-400" />
                                        <div className="h-px w-10 bg-yellow-300" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-400 mb-0.5">Hasta</span>
                                            <span className="text-sm font-semibold text-gray-700">{formatDisplay(fechaFin)}</span>
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Fecha inicio
                                            </label>
                                            <input
                                                type="date"
                                                value={fechaInicio}
                                                max={fechaFin}
                                                onChange={handleFechaInicio}
                                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Fecha fin
                                            </label>
                                            <input
                                                type="date"
                                                value={fechaFin}
                                                max={fmt(today)}
                                                min={fechaInicio}
                                                onChange={handleFechaFin}
                                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-white transition shadow-sm"
                                >
                                    Generar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}