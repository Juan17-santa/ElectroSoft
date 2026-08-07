/**
 * SaleDetailsPage.jsx
 * 
 * Vista de detalles generales de una venta.
 * Muestra la información de la venta (fecha, estado, subtotal, IVA, total)
 * y la tabla de productos comprados.
 * 
 * Diseño: Fondo con decoraciones SVG doradas, tarjeta blanca con borde izquierdo.
 * 
 * Navegación: Se accede desde SalesManagement (icono ojo).
 * Los datos de la venta se leen de localStorage (carga inicial rápida) y luego
 * se refrescan desde el backend para garantizar datos financieros actualizados.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { generatePDFReport } from "../../../../utils/PDFReportGenerator";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { SalesService } from "./services/SalesService";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../../../context/ToastContext";

export default function SaleDetailsPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sale, setSale] = useState(null);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [confirmData, setConfirmData] = useState(null);

    /**
     * Carga inicial desde localStorage (instantánea) + refresco desde backend.
     * Esto garantiza que los datos financieros (montoPagado, montoPorPagar, estado)
     * siempre estén actualizados aunque se hayan registrado abonos recientemente.
     */
    useEffect(() => {
        const data = localStorage.getItem("saleToView");
        if (!data) return;

        const parsedSale = JSON.parse(data);
        setSale(parsedSale); // Mostrar inmediatamente con datos de localStorage

        // Refrescar desde el backend en segundo plano
        if (parsedSale?.id) {
            setLoadingRefresh(true);
            SalesService.getById(parsedSale.id)
                .then(freshSale => {
                    if (freshSale) {
                        setSale(freshSale);
                        localStorage.setItem("saleToView", JSON.stringify(freshSale));
                    }
                })
                .catch(err => {
                    console.warn("[SaleDetailsPage] No se pudo refrescar desde el backend:", err?.message);
                })
                .finally(() => setLoadingRefresh(false));
        }
    }, []);

    const [productosNetos, setProductosNetos] = useState([]);
    const [totalesNetos, setTotalesNetos] = useState({ subtotal: 0, iva: 0, total: 0 });

    useEffect(() => {
        if (sale) {
            ServicesDevolutions.getBySaleId(sale.id).then(devoluciones => {
                const cantDevueltasMap = devoluciones.reduce((acc, d) => {
                    acc[d.producto] = (acc[d.producto] || 0) + Number(d.cantidad || 0);
                    return acc;
                }, {});

                const netos = (sale.productos || []).map(p => {
                    const devuelto = cantDevueltasMap[p.nombre] || 0;
                    return {
                        ...p,
                        cantOriginal: p.cantidad,
                        cantDevuelta: devuelto,
                        cantNeta: Math.max(0, p.cantidad - devuelto)
                    };
                });

                const newTotal = netos.reduce((sum, p) => sum + (p.precio * p.cantNeta), 0);
                const newIva = newTotal * 0.19;
                const newSubtotal = newTotal - newIva;

                setProductosNetos(netos);
                setTotalesNetos({ subtotal: newSubtotal, iva: newIva, total: newTotal });
            }).catch(e => console.error("Error al obtener devoluciones:", e));
        }
    }, [sale]);

    const calculateDeadline = () => {
        if (!sale || !sale.fecha) return null;
        if (sale.tipoVenta !== "Credito" && sale.tipoVenta !== "Crédito" && sale.tipoVenta !== "Mixto") return null;

        const diasPlazo = sale.diasPlazo != null ? Number(sale.diasPlazo) : 0;
        const creationDate = new Date(sale.fecha + "T00:00:00");
        const deadlineDate = new Date(creationDate);
        deadlineDate.setDate(deadlineDate.getDate() + diasPlazo);

        // Obtener hoy en formato YYYY-MM-DD usando la hora local (evitar desfase UTC de toISOString)
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const todayDate = new Date(todayStr + "T00:00:00");

        const diffTime = deadlineDate.getTime() - todayDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const deadStr = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')}`;

        return {
            fechaLimite: deadStr,
            diasRestantes: diffDays
        };
    };

    const deadlineInfo = calculateDeadline();

    if (!sale) return null;

    /** Lista de productos de la venta */
    const productos = sale.productos || [];

    /** Cierra la vista y limpia localStorage, regresa a la lista de ventas */
    const handleClose = () => {
        localStorage.removeItem("saleToView");
        navigate("/dashboard/sales-management");
    };

    /**
     * Genera un reporte PDF con la información de la venta y sus productos.
     * Usa jsPDF v4 + jspdf-autotable v5.
     * Se descarga como "venta_[numero].pdf".
     */
    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Imprimir venta",
            message: "¿Deseas imprimir el reporte de esta venta?",
            onConfirm: () => {
                const formatCurrency = (val) => val ? `$${val.toLocaleString('es-CO')}` : "$0";
                
                const extraInfo = [
                    `Cliente: ${sale.cliente || '-'}`,
                    `Documento: ${sale.numeroDocumento || '-'}`,
                    `Fecha creación: ${sale.fecha}`,
                    `Estado: ${sale.estado}`,
                    `Tipo de Venta: ${sale.tipoVenta || "Contado"}`
                ];
                
                if (sale.estado === "Anulado") {
                    extraInfo.push(`Fecha Anulación: ${sale.anuladaEn ? new Date(sale.anuladaEn).toLocaleString('es-CO') : (sale.fecha || "N/A")}`);
                    extraInfo.push(`Motivo Anulación: ${sale.observaciones || "Anulación registrada sin motivo."}`);
                }
                
                if ((sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito" || sale.tipoVenta === "Mixto")) {
                    extraInfo.push(`Plazo (Crédito): ${sale.diasPlazo != null ? sale.diasPlazo : 0} días`);
                    if (deadlineInfo) {
                        extraInfo.push(`Fecha Límite Pago: ${deadlineInfo.fechaLimite}`);
                    }
                }

                generatePDFReport({
                    title: `Reporte de la Venta #${String(sale.numeroVenta || "").padStart(2, '0')}`,
                    fileName: `venta_${String(sale.numeroVenta || "").padStart(2, '0')}.pdf`,
                    columns: ["Producto", "Precio", "Cant.", "Dev.", "Neto", "Subtotal"],
                    data: productosNetos.map(p => [
                        p.nombre,
                        formatCurrency(p.precio),
                        p.cantOriginal,
                        p.cantDevuelta > 0 ? `-${p.cantDevuelta}` : '0',
                        p.cantNeta,
                        formatCurrency(p.precio * p.cantNeta)
                    ]),
                    extraInfo: extraInfo,
                    totals: [
                        `Subtotal: ${formatCurrency(totalesNetos.subtotal)}`,
                        `IVA: ${formatCurrency(totalesNetos.iva)}`,
                        `Total: ${formatCurrency(totalesNetos.total)}`
                    ]
                });

                showToast("success", "Reporte generado correctamente.");
                setConfirmData(null);
            },
            onCancel: () => setConfirmData(null)
        });
    };

    /**
     * Retorna la clase CSS del color de estado.
     * Verde = Finalizado, Amarillo = Vigente, Rojo = Anulado, Gris = Devuelto
     */
    const getEstadoColor = (estado) => {
        switch (estado) {
            case "Finalizado": case "Finalizadas": case "Finalizada": return "bg-green-500";
            case "Vigente": return "bg-yellow-500";
            case "Anulado": return "bg-red-500";
            case "Devuelto": return "bg-gray-500";
            case "Devolución Parcial": return "bg-amber-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div
            className="h-full rounded-2xl shadow-lg relative overflow-hidden"
            style={{
                backgroundImage: 'url("/background-details.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* ═══ CONTENIDO ═══ */}
            <div className="px-10 py-8 relative z-10 flex flex-col h-full overflow-y-auto bg-gray-100 md:bg-transparent">

                {/* Header */}
                <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[22px] font-bold italic text-gray-800">
                           Ver información de la venta #{String(sale.numeroVenta || "").padStart(2, '0')}
                        </h2>
                        {loadingRefresh && (
                            <RefreshCw size={16} className="animate-spin text-yellow-500" title="Actualizando datos..." />
                        )}
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600  transition duration-300 shadow-sm cursor-pointer"
                        >
                            <FileText size={16} />
                            Imprimir
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>
                </div>

                {/* Tarjeta info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 px-8 py-6 mb-8"
                    style={{ borderLeft: '4px solid #fbbf24' }}
                >
                    {/* Nombre cliente */}
                    <p className="text-[17px] font-bold text-gray-800 mb-5">{sale.cliente || 'Sin cliente'}</p>

                    {/* Info grid — 2 columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="flex flex-col gap-6 md:gap-3">
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Fecha creacion</p>
                                <p className="font-bold text-gray-800 text-[15px]">{sale.fecha}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Estado Actual</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getEstadoColor(sale.estado)}`}></span>
                                    <p className="font-bold text-[15px]">{sale.estado}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Tipo de Venta</p>
                                <p className="font-bold text-gray-800 text-[15px] capitalize">{sale.tipoVenta || "Contado"}</p>
                            </div>
                            {sale.estado === "Anulado" && (
                                <>
                                    <div className="mt-2">
                                        <p className="text-xs text-red-500 leading-none mb-1">Motivo Anulación</p>
                                        <p className="font-bold text-red-600 text-[14px]">{sale.observaciones || "Anulación registrada sin motivo."}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-500 leading-none mb-1">Fecha Anulación</p>
                                        <p className="font-bold text-red-600 text-[14px]">
                                            {sale.anuladaEn ? new Date(sale.anuladaEn).toLocaleString('es-CO') : (sale.fecha || "N/A")}
                                        </p>
                                    </div>
                                </>
                            )}
                            {(sale.tipoVenta === "Credito" || sale.tipoVenta === "Crédito" || sale.tipoVenta === "Mixto") && (
                                <>
                                    <div className="mt-2">
                                        <p className="text-xs text-yellow-600 leading-none mb-1">Plazo (Crédito)</p>
                                        <p className="font-bold text-yellow-700 text-[14px]">{sale.diasPlazo != null ? sale.diasPlazo : 0} días</p>
                                    </div>
                                    {deadlineInfo && (
                                        <>
                                            <div className="mt-2">
                                                <p className="text-xs text-blue-600 leading-none mb-1">Fecha Límite Pago</p>
                                                <p className="font-bold text-blue-700 text-[14px]">{deadlineInfo.fechaLimite}</p>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500 leading-none mb-1">Tiempo Restante</p>
                                                <p className={`font-bold text-[14px] ${deadlineInfo.diasRestantes < 0 ? 'text-red-600' : deadlineInfo.diasRestantes <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {deadlineInfo.diasRestantes < 0
                                                        ? `Vencido hace ${Math.abs(deadlineInfo.diasRestantes)} días`
                                                        : deadlineInfo.diasRestantes === 0
                                                            ? 'Vence hoy'
                                                            : `${deadlineInfo.diasRestantes} días restantes`}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Columna derecha */}
                        <div className="flex flex-col gap-6 md:gap-3">
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Subtotal</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.subtotal?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">IVA</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.iva?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Total</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.total?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separador dorado */}
                <div className="mb-8">
                    <div className="h-[1.5px]" style={{ background: 'linear-gradient(90deg, #d4a843, #e8c34a, #d4a843)' }}></div>
                </div>

                {/* Productos */}
                <div className="flex-1">
                    <p className="text-[18px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
                        Productos en esta venta
                    </p>
                    {productos.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-96 w-full text-left text-sm">
                                    <thead className="text-gray-500 bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Producto</th>
                                            <th className="px-4 py-3 font-semibold text-center w-28">Cant. Original</th>
                                            <th className="px-4 py-3 font-semibold text-center w-24">Devuelto</th>
                                            <th className="px-4 py-3 font-semibold text-center w-24">Cant. Neta</th>
                                            <th className="px-4 py-3 font-semibold text-center w-32">Precio Unit.</th>
                                            <th className="px-4 py-3 font-semibold text-center w-32">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productosNetos.map((prod, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 font-medium text-gray-800">{prod.nombre}</td>
                                                <td className="px-4 py-3 text-center">{prod.cantOriginal}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {prod.cantDevuelta > 0 ? (
                                                        <span className="text-red-600 font-semibold">
                                                            -{prod.cantDevuelta}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">{prod.cantNeta}</td>
                                                <td className="px-4 py-3 text-center">${prod.precio?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center font-semibold">
                                                    ${(prod.precio * prod.cantNeta).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOTALES (Estilo idéntico a Pedidos - OrderDetails.jsx) */}
                            <div className="bg-gray-50 border-t border-gray-200 p-4 mt-auto">
                                <div className="flex flex-wrap justify-end items-center gap-4 md:gap-10 text-xs md:text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 uppercase">Subtotal:</span>
                                        <span className="text-gray-800 font-semibold">${totalesNetos.subtotal?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-500 uppercase">IVA (19%):</span>
                                        <span className="text-blue-600 font-semibold">${totalesNetos.iva?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-700 uppercase font-bold">Total:</span>
                                        <span className="text-green-600 font-bold">${totalesNetos.total?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                            No hay productos registrados
                        </div>
                    )}
                </div>
            </div>

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={confirmData.onCancel}
                />
            )}
        </div>
    );
}
