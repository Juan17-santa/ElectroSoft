/**
 * SalesManagement.jsx
 * 
 * Página principal de gestión de ventas.
 * Muestra una tabla con todas las ventas registradas, permite buscar,
 * paginar, generar reportes PDF y ejecutar acciones por venta:
 * - Ver detalles (ojo) → navega a SaleDetailsPage
 * - Ver crédito (tarjeta) → navega a CreditDetailsPage (solo créditos vigentes)
 * - Devolver (undo) → navega a ReturnSalesPage
 * - Anular (ban) → cambia el estado a "Anulado"
 * 
 * Los datos se obtienen desde localStorage a través de SalesService.
 */
import { Eye, Undo2, Ban, Plus, Search, FileText, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalesManagement() {
    const navigate = useNavigate();

    /** Estado: lista de ventas y término de búsqueda */
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("")

    /** Filtra las ventas por número de documento o nombre de cliente */
    const filteredSales = sales.filter(sale =>
        sale.numeroDocumento.toLowerCase().includes(search.toLowerCase()) ||
        (sale.cliente && sale.cliente.toLowerCase().includes(search.toLowerCase()))
    );

    /** Paginación: 8 registros por página */
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 8;
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const paginatedSales = filteredSales.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredSales.length / recordsPerPage);

    const nextPage = () => {
        if (presentPage < totalPages) setPresentPage(presentPage + 1);
    };

    const prevPage = () => {
        if (presentPage > 1) setPresentPage(presentPage - 1);
    };

    useEffect(() => {
        getSales();
    }, [])

    /**
     * Obtiene las ventas desde localStorage.
     * Para ventas antiguas sin nombre de cliente, busca el nombre
     * en la lista de clientes usando el número de documento.
     */
    const getSales = () => {
        try {
            const response = SalesService.get();
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const salesConCliente = response.map(sale => {
                if (!sale.cliente) {
                    const found = clients.find(c => c.documento === sale.numeroDocumento);
                    if (found) {
                        return { ...sale, cliente: `${found.nombres} ${found.apellidos}` };
                    }
                }
                return sale;
            });
            setSales(salesConCliente);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Navega a la vista de detalles generales de la venta.
     * Guarda la venta en localStorage con clave "saleToView".
     */
    const handleViewDetails = (sale) => {
        localStorage.setItem("saleToView", JSON.stringify(sale));
        navigate("/dashboard/sales-management/details");
    };

    /**
     * Navega a la vista de detalles del crédito.
     * Solo disponible para ventas tipo "Crédito" con estado "Vigente".
     */
    const handleViewCredit = (sale) => {
        localStorage.setItem("saleToView", JSON.stringify(sale));
        navigate("/dashboard/sales-management/credit-details");
    };

    /**
     * Navega a la vista de devolución de venta.
     * Guarda la venta en localStorage con clave "saleToReturn".
     */
    const handleReturn = (sale) => {
        localStorage.setItem("saleToReturn", JSON.stringify(sale));
        navigate("/dashboard/sales-management/return");
    };

    /**
     * Anula una venta (cambia estado a "Anulado").
     * Pide confirmación antes de ejecutar.
     */
    const handleAnull = (id) => {
        const confirmAnull = window.confirm("¿Está seguro de anular esta venta?");
        if (!confirmAnull) return;
        const updatedSales = SalesService.anullSale(id);
        setSales(updatedSales);
        alert("Venta anulada correctamente");
    };

    /**
     * Genera un reporte PDF de las ventas filtradas.
     * Usa jsPDF v4 con jspdf-autotable v5.
     * El PDF incluye: título, fecha de generación, y tabla con todas las columnas.
     * Se descarga automáticamente como "reporte_ventas.pdf".
     */
    const handleGenerateReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Gestión de Ventas - Reporte", 14, 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

        // autoTable v5: se pasa doc como primer argumento
        autoTable(doc, {
            startY: 38,
            head: [["# Venta", "Cliente", "Fecha", "Tipo", "Total", "Pagado", "Por Pagar", "Estado"]],
            body: filteredSales.map(sale => [
                sale.numeroDocumento,
                sale.cliente || '-',
                sale.fecha,
                sale.tipoVenta,
                `$${sale.total?.toLocaleString() || '0'}`,
                `$${sale.montoPagado?.toLocaleString() || '0'}`,
                `$${sale.montoPorPagar?.toLocaleString() || '0'}`,
                sale.estado
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [234, 179, 8] } // Amarillo dorado
        });

        doc.save("reporte_ventas.pdf");
    };

    /**
     * Retorna la clase CSS del punto de color según el estado de la venta.
     * Verde = Finalizado, Amarillo = Vigente, Rojo = Anulado, Gris = Devuelto
     */
    const getEstadoDot = (estado) => {
        switch (estado) {
            case "Finalizado": case "Finalizadas":
                return "bg-green-500";
            case "Vigente":
                return "bg-yellow-500";
            case "Anulado":
                return "bg-red-500";
            case "Devuelto":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    /**
     * Calcula los números de página a mostrar en el paginador.
     * Si hay 5 o menos páginas, muestra todas.
     * Si hay más, muestra: 1 ... [prev] [actual] [next] ... última
     */
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (presentPage > 3) pages.push("...");
            for (let i = Math.max(2, presentPage - 1); i <= Math.min(totalPages - 1, presentPage + 1); i++) {
                pages.push(i);
            }
            if (presentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
            {/* TITULO */}
            <p className="text-xl font-semibold">Gestión de Ventas</p>

            {/* BUSCADOR Y BOTON CREAR */}
            <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 bg-white">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar Ventas por documento, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none text-md placeholder-gray-400 bg-transparent"
                        />
                    </div>
                    {/* GENERAR REPORTE */}
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer w-fit"
                    >
                        <FileText size={16} />
                        Generar reporte
                    </button>
                </div>
                <button
                    type="button"
                    className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md hover:shadow-lg transition h-fit"
                    onClick={() => navigate("/dashboard/sales-management/create")}
                >
                    <Plus size={18} />
                    Nueva Venta
                </button>
            </div>

            {/* TABLA */}
            <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                <div className="bg-white rounded-2xl border-none overflow-hidden">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-200">
                            <tr className="text-left border-b border-gray-300">
                                <th className="px-3 py-3 font-semibold"># venta</th>
                                <th className="px-3 py-3 font-semibold">Cliente</th>
                                <th className="px-3 py-3 font-semibold">Fecha</th>
                                <th className="px-3 py-3 font-semibold">Tipo de venta</th>
                                <th className="px-3 py-3 font-semibold">Total</th>
                                <th className="px-3 py-3 font-semibold">Monto Pagado</th>
                                <th className="px-3 py-3 font-semibold">Monto Por Pagar</th>
                                <th className="px-3 py-3 font-semibold">Estado</th>
                                <th className="px-3 py-3 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white text-gray-700">
                            {paginatedSales.map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-3 py-3 font-medium">{sale.numeroDocumento}</td>
                                    <td className="px-3 py-3">{sale.cliente || '-'}</td>
                                    <td className="px-3 py-3">{sale.fecha}</td>
                                    <td className="px-3 py-3">{sale.tipoVenta}</td>
                                    <td className="px-3 py-3">{sale.total?.toLocaleString() || '0'}</td>
                                    <td className="px-3 py-3">{sale.montoPagado?.toLocaleString() || '0'}</td>
                                    <td className="px-3 py-3">{sale.montoPorPagar?.toLocaleString() || '0'}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getEstadoDot(sale.estado)}`}></span>
                                            <span className="text-sm">{sale.estado}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex justify-center gap-1.5">

                                            {/* DEVOLVER */}
                                            <button
                                                className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                onClick={() => handleReturn(sale)}
                                                title="Devolver venta"
                                                disabled={sale.estado === "Devuelto" || sale.estado === "Anulado"}
                                            >
                                                <Undo2 size={17} className="text-yellow-600" />
                                            </button>

                                            {/* VER DETALLES */}
                                            <button
                                                className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                onClick={() => handleViewDetails(sale)}
                                                title="Ver detalles"
                                            >
                                                <Eye size={17} className="text-yellow-600" />
                                            </button>

                                            {/* ANULAR */}
                                            <button
                                                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                onClick={() => handleAnull(sale.id)}
                                                title="Anular venta"
                                                disabled={sale.estado === "Anulado" || sale.estado === "Devuelto"}
                                            >
                                                <Ban size={17} className="text-red-500" />
                                            </button>

                                            {/* TARJETA CRÉDITO - solo para ventas a crédito vigentes */}
                                            {sale.tipoVenta === "Crédito" && sale.estado === "Vigente" && (
                                                <button
                                                    className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => handleViewCredit(sale)}
                                                    title="Detalles del crédito"
                                                >
                                                    <CreditCard size={17} className="text-yellow-600" />
                                                </button>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINADOR */}
            <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">

                    {/* Flecha izquierda */}
                    <button
                        onClick={prevPage}
                        className="p-2 rounded-lg hover:bg-gray-300 transition"
                        disabled={presentPage === 1}
                    >
                        ←
                    </button>

                    {/* Números de página */}
                    {getPageNumbers().map((page, i) => (
                        page === "..." ? (
                            <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => setPresentPage(page)}
                                className={`px-3 py-1 rounded-md transition
                                    ${presentPage === page
                                        ? "bg-yellow-400 text-black font-medium shadow-sm"
                                        : "hover:bg-gray-300"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}

                    {/* Flecha derecha */}
                    <button
                        onClick={nextPage}
                        className="p-2 rounded-lg hover:bg-gray-300 transition"
                        disabled={presentPage === totalPages || totalPages === 0}
                    >
                        →
                    </button>

                </div>
            </div>
        </div>
    )
}