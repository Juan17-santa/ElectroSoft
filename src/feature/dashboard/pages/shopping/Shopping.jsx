import { useState } from 'react';
import { FileText, Plus, Search, Eye, Ban } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useShopping } from "../shopping/hooks/useShopping";

const ITEMS_PER_PAGE = 8;

export default function Shopping() {
    const navigate = useNavigate();
    const { comprasFiltradas, searchTerm, setSearchTerm, handleAnular } = useShopping();
    const [currentPage, setCurrentPage] = useState(1);

    // Paginación
    const totalPages = Math.max(1, Math.ceil(comprasFiltradas.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const comprasPagina = comprasFiltradas.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleGenerarReporte = () => {
        alert("¿Estás seguro de que quieres descargar el reporte de compras?");
    };

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Gestión de Compras</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-4/5">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por proveedor, número de factura o fecha..."
                            className="w-full outline-none text-md placeholder-gray-400"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div
                        className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 hover:shadow-lg transition duration-500"
                        onClick={() => navigate("/dashboard/shopping/create")}
                    >
                        <Plus />
                        <button type="button" className="cursor-pointer">
                            Nueva Compra
                        </button>
                    </div>
                </div>

                {/* BOTON GENERAR REPORTE */}
                <div>
                    <button
                        onClick={handleGenerarReporte}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition duration-300 shadow-sm cursor-pointer"
                    >
                        <FileText size={18} className="text-gray-500" />
                        Generar reporte
                    </button>
                </div>

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-4 py-2 font-semibold">ID</th>
                                    <th className="px-4 py-2 font-semibold">Número de Factura</th>
                                    <th className="px-4 py-2 font-semibold">Fecha de compra</th>
                                    <th className="px-4 py-2 font-semibold">Proveedor</th>
                                    <th className="px-4 py-2 font-semibold">Total</th>
                                    <th className="px-4 py-2 font-semibold">Estado</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {comprasPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                            No hay compras registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    comprasPagina.map((compra, index) => (
                                        <tr key={compra.id}>
                                            <td className="px-4 py-1 border-b border-gray-300">
                                                {String((paginaActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-4 py-1 border-b border-gray-300">{compra.numeroFactura}</td>
                                            <td className="px-4 py-1 border-b border-gray-300">{compra.fechaCompra}</td>
                                            <td className="px-4 py-1 border-b border-gray-300">{compra.proveedor}</td>
                                            <td className="px-4 py-1 border-b border-gray-300">{compra.total}</td>
                                            <td className="px-4 py-1 border-b border-gray-300">
                                                <span

                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${compra.estado === "Activo"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                        }`}

                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        compra.estado === "Activo"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                    }`}

                                                >
                                                    {compra.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1 border-b border-gray-300">
                                                <div className="flex justify-center gap-4">
                                                    {/* BOTON VER */}
                                                    <button
                                                        onClick={() => navigate(`/dashboard/shopping/details/${compra.id}`)}
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition duration-300 cursor-pointer"
                                                    >
                                                        <Eye size={18} className="text-yellow-600" />
                                                    </button>

                                                    {/* BOTON ANULAR */}
                                                    <button
                                                        onClick={() => handleAnular(compra.id)}
                                                        disabled={compra.estado === "Anulada"}

                                                        className={`p-2 rounded-lg transition duration-300 cursor-pointer ${compra.estado === "Anulada"
                                                                ? "bg-gray-100 cursor-not-allowed opacity-40"
                                                                : "bg-red-100 hover:bg-red-200"
                                                            }`}

                                                        className={`p-2 rounded-lg transition duration-300 cursor-pointer ${
                                                            compra.estado === "Anulada"
                                                                ? "bg-gray-100 cursor-not-allowed opacity-40"
                                                                : "bg-red-100 hover:bg-red-200"
                                                        }`}

                                                    >
                                                        <Ban size={18} className="text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                {totalPages > 1 && (
                    <div className="flex justify-end mt-4">
                        <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={paginaActual === 1}
                                className="p-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                            >
                                ←
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}

                                    className={`px-3 py-1 rounded-md font-medium transition ${page === paginaActual
                                            ? "bg-yellow-400 text-black shadow-sm"
                                            : "hover:bg-gray-300"
                                        }`}

                                    className={`px-3 py-1 rounded-md font-medium transition ${
                                        page === paginaActual
                                            ? "bg-yellow-400 text-black shadow-sm"
                                            : "hover:bg-gray-300"
                                    }`}

                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={paginaActual === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

