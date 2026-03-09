import { useState } from 'react';
import { Eye, Ban, ShoppingCart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useShopping } from "../shopping/hooks/useShopping";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from '../../components/ui/Alert';
import CancellationModal from "../../components/CancellationModal";
import CancellationInfoTooltip from "../shopping/components/CancellationInfoTooltip";
import { generatePDFReport } from '../../../../utils/PDFReportGenerator';


const ITEMS_PER_PAGE = 8;

export default function Shopping() {
    const navigate = useNavigate();
    const { comprasFiltradas, searchTerm, setSearchTerm, handleAnular, validarAnulacion } = useShopping();
    const [currentPage, setCurrentPage] = useState(1);
    // MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);
    // MODAL DE ANULACION
    const [cancelModalData, setCancelModalData] = useState(null);

    // ALERTAS
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // Paginación
    const comprasOrdenadas = [...comprasFiltradas].reverse();
    const totalPages = Math.max(1, Math.ceil(comprasOrdenadas.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const comprasPagina = comprasOrdenadas.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const parseMoney = (value) => {
        if (!value) return 0;

        if (typeof value === "number") return value;

        return Number(
            String(value)
                .replace(/\$/g, "")
                .replace(/\./g, "")
                .replace(/,/g, "")
                .trim()
        ) || 0;
    };
    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Estás seguro de que deseas descargar el reporte de compras?",
            onConfirm: () => {

                generatePDFReport({
                    title: "Gestión de Compras - Reporte",
                    fileName: "reporte_compras.pdf",
                    columns: [
                        "ID",
                        "Número de Factura",
                        "Fecha",
                        "Proveedor",
                        "Total",
                        "Estado"
                    ],
                    data: comprasFiltradas.map((compra, index) => {
                        const totalNumerico = parseMoney(compra.total);

                        return [
                            String(index + 1).padStart(2, '0'),
                            compra.numeroFactura,
                            compra.fechaCompra,
                            compra.proveedor,
                            `$${totalNumerico.toLocaleString()}`,
                            compra.estado
                        ];
                    })
                });

                showAlert("success", "Reporte generado correctamente.");
                setConfirmData(null);
            }
        });
    };

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold flex items-center gap-2">
                    <ShoppingCart size={22} className="text-yellow-500" />
                    Gestión de Compras
                </p>

                {/* BUSCADOR, REPORTE Y BOTON CREAR */}
                <Searchbar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    placeholder="Buscar por proveedor, número de factura, fecha o estado..."
                    onCreateClick={() => navigate("/dashboard/shopping/create")}
                    createButtonText="Nueva Compra"
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

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
                                                >
                                                    {compra.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1 border-b border-gray-300">
                                                <div className="flex justify-center gap-4">
                                                    {/* BOTON VER */}
                                                    <button
                                                        onClick={() => navigate(`/dashboard/shopping/details/${compra.id}`)}
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* BOTON ANULAR O TOOLTIP */}
                                                    {compra.estado === "Anulada" ? (
                                                        <CancellationInfoTooltip cancelInfo={compra.infoAnulacion} />
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const validacion = validarAnulacion(compra);
                                                                if (validacion.puedeAnularse) {
                                                                    setCancelModalData(compra);
                                                                } else {
                                                                    showAlert("error", validacion.razon);
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition duration-300 cursor-pointer"
                                                        >
                                                            <Ban size={18} className="text-red-600" />
                                                        </button>
                                                    )}
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
                <div className="flex justify-end mt-4">
                    <Pagination
                        currentPage={paginaActual}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            {/* MODAL DE CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {/* MODAL DE ANULACION */}
            {cancelModalData && (
                <CancellationModal
                    title="Anular Compra"
                    infoData={[
                        { label: "Factura", value: cancelModalData?.numeroFactura ?? "F-00123" },
                        { label: "Proveedor", value: cancelModalData?.proveedor ?? "Proveedor Ejemplo" }
                    ]}
                    placeholder="Describe el motivo de la anulación..."
                    minLength={20}
                    onConfirm={(infoAnulacion) => {
                        handleAnular(cancelModalData.id, infoAnulacion);
                        showAlert("success", "La compra fue anulada correctamente.");
                        setCancelModalData(null);
                    }}
                    onCancel={() => setCancelModalData(null)}
                />
            )}

            {/* ALERTA */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

        </>
    );
}