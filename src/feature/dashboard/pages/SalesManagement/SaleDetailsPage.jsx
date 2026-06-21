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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { SalesService } from "./services/SalesService";
import Alert from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function SaleDetailsPage() {
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [alert, setAlert] = useState(null);
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

                const newSubtotal = netos.reduce((sum, p) => sum + (p.precio * p.cantNeta), 0);
                const newIva = newSubtotal * 0.19;
                const newTotal = newSubtotal + newIva;

                setProductosNetos(netos);
                setTotalesNetos({ subtotal: newSubtotal, iva: newIva, total: newTotal });
            }).catch(e => console.error("Error al obtener devoluciones:", e));
        }
    }, [sale]);

    const calculateDeadline = () => {
        if (!sale || !sale.fecha || sale.diasPlazo === undefined || sale.diasPlazo === null) return null;

        const creationDate = new Date(sale.fecha + "T00:00:00");
        const deadlineDate = new Date(creationDate);
        deadlineDate.setDate(deadlineDate.getDate() + Number(sale.diasPlazo));

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
                const doc = new jsPDF();

                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text("Detalles de Venta", 14, 22);

                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(`Cliente: ${sale.cliente || '-'}`, 14, 36);
                doc.text(`Fecha creación: ${sale.fecha}`, 14, 44);
                doc.text(`Estado: ${sale.estado}`, 14, 52);
                doc.text(`Subtotal: $${totalesNetos.subtotal?.toLocaleString()}`, 120, 36);
                doc.text(`IVA: $${totalesNetos.iva?.toLocaleString()}`, 120, 44);
                doc.text(`Total: $${totalesNetos.total?.toLocaleString()}`, 120, 52);

                if (productosNetos.length > 0) {
                    autoTable(doc, {
                        startY: 64,
                        head: [["Producto", "Precio", "Cant.", "Dev.", "Neto", "Subtotal"]],
                        body: productosNetos.map(p => [
                            p.nombre,
                            `$${p.precio?.toLocaleString()}`,
                            p.cantOriginal,
                            p.cantDevuelta,
                            p.cantNeta,
                            `$${(p.precio * p.cantNeta).toLocaleString()}`
                        ]),
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [234, 179, 8] }
                    });
                }

                doc.save(`venta_${String(sale.numeroVenta || "").padStart(2, '0')}.pdf`);
                setAlert({ type: "success", message: "Reporte generado correctamente." });
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
            {/* ALERTA FLOTANTE EN PARTE SUPERIOR */}
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

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
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 px-8 py-6 mb-8"
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
                            {sale.estado === "Anulado" && (
                                <>
                                    <div className="mt-2">
                                        <p className="text-xs text-red-500 leading-none mb-1">Motivo Anulación</p>
                                        <p className="font-bold text-red-600 text-[14px]">{sale.motivoAnulacion || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-500 leading-none mb-1">Fecha Anulación</p>
                                        <p className="font-bold text-red-600 text-[14px]">{sale.fechaAnulacion || "N/A"}</p>
                                    </div>
                                </>
                            )}
                            {sale.tipoVenta === "Credito" && sale.diasPlazo != null && (
                                <>
                                    <div className="mt-2">
                                        <p className="text-xs text-yellow-600 leading-none mb-1">Plazo (Crédito)</p>
                                        <p className="font-bold text-yellow-700 text-[14px]">{sale.diasPlazo} días</p>
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
                                <p className="font-bold text-gray-800 text-[17px]">${sale.subtotal?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">IVA</p>
                                <p className="font-bold text-gray-800 text-[17px]">${sale.iva?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Total</p>
                                <p className="font-bold text-gray-800 text-[17px]">${sale.total?.toLocaleString()}</p>
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
                        <div className="border border-gray-200 rounded-sm overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-200">
                                        <th className="px-5 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">Producto</th>
                                        <th className="px-5 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">Precio Unit.</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">Cant. Original</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">Devuelto</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">Cant. Neta</th>
                                        <th className="px-5 py-3 text-right font-bold text-gray-700 uppercase text-xs tracking-wider">Subtotal Neto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosNetos.map((prod, index) => (
                                        <tr key={index} className="border-b border-gray-100 last:border-b-0 bg-gray-50/30 hover:bg-gray-50/60 transition">
                                            <td className="px-5 py-4 text-gray-800 font-medium">{prod.nombre}</td>
                                            <td className="px-5 py-4 text-gray-600">${prod.precio?.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-center text-gray-600">{prod.cantOriginal}</td>
                                            <td className={`px-5 py-4 text-center font-bold ${prod.cantDevuelta > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {prod.cantDevuelta > 0 ? `-${prod.cantDevuelta}` : '0'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-600">{prod.cantNeta}</td>
                                            <td className="px-5 py-4 text-right text-gray-800 font-bold">
                                                ${(prod.precio * prod.cantNeta).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
