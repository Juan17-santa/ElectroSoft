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
 * Los datos de la venta se leen de localStorage (clave "saleToView").
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import Alert from "../../components/ui/Alert";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function SaleDetailsPage() {
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [alert, setAlert] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    /** Lee los datos de la venta desde localStorage al montar el componente */
    useEffect(() => {
        const data = localStorage.getItem("saleToView");
        if (data) {
            const parsedSale = JSON.parse(data);
            setSale(parsedSale);
        }
    }, []);

    const [productosNetos, setProductosNetos] = useState([]);
    const [totalesNetos, setTotalesNetos] = useState({ subtotal: 0, iva: 0, total: 0 });

    useEffect(() => {
        if (sale) {
            const devoluciones = ServicesDevolutions.getByIdVenta(sale.id);
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
        }
    }, [sale]);

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
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de esta venta?",
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

            {/* Capa semitransparente para legibilidad */}
            <div className="absolute inset-0 bg-white/55 rounded-2xl pointer-events-none"></div>
            {/* ═══ DECORACIONES DORADAS ═══ */}

            {/* Esquina superior izquierda — arcos finos + punta dorada */}
            <svg className="absolute -top-4 -left-4 w-48 h-48 pointer-events-none" viewBox="0 0 200 200" fill="none">
                <ellipse cx="30" cy="30" rx="100" ry="100" stroke="url(#goldGrad1)" strokeWidth="3" opacity=".35" />
                <ellipse cx="30" cy="30" rx="80" ry="80" stroke="url(#goldGrad1)" strokeWidth="2" opacity=".25" />
                <ellipse cx="30" cy="30" rx="60" ry="60" stroke="url(#goldGrad1)" strokeWidth="1.5" opacity=".18" />
                <path d="M60 5 Q95 15 110 55" stroke="url(#goldGrad2)" strokeWidth="4" fill="none" opacity=".6" />
                <path d="M5 60 Q15 95 55 110" stroke="url(#goldGrad2)" strokeWidth="3" fill="none" opacity=".45" />
                <defs>
                    <linearGradient id="goldGrad1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d4a843" />
                        <stop offset="100%" stopColor="#f0d68a" />
                    </linearGradient>
                    <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#c9952c" />
                        <stop offset="50%" stopColor="#e8c34a" />
                        <stop offset="100%" stopColor="#f5e08a" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Esquina superior derecha — semicírculos dorados con relleno */}
            <svg className="absolute -top-6 -right-6 w-52 h-52 pointer-events-none" viewBox="0 0 220 220" fill="none">
                <circle cx="190" cy="30" r="90" fill="url(#goldFill1)" opacity=".12" />
                <circle cx="190" cy="30" r="70" stroke="url(#goldGrad3)" strokeWidth="3" opacity=".3" />
                <circle cx="190" cy="30" r="50" stroke="url(#goldGrad3)" strokeWidth="2" opacity=".2" />
                <circle cx="190" cy="30" r="55" fill="url(#goldFill2)" opacity=".15" />
                <circle cx="170" cy="60" r="25" fill="url(#goldFill2)" opacity=".25" />
                <defs>
                    <radialGradient id="goldFill1"><stop offset="0%" stopColor="#e8c34a" /><stop offset="100%" stopColor="#d4a843" stopOpacity="0" /></radialGradient>
                    <radialGradient id="goldFill2"><stop offset="0%" stopColor="#c9952c" /><stop offset="100%" stopColor="#e8c34a" stopOpacity="0" /></radialGradient>
                    <linearGradient id="goldGrad3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4a843" /><stop offset="100%" stopColor="#f0d68a" /></linearGradient>
                </defs>
            </svg>

            {/* Puntos dorados izquierda */}
            <div className="absolute left-5 top-[42%] pointer-events-none">
                <div className="w-4 h-4 rounded-full mb-2" style={{ background: 'radial-gradient(circle, #d4a843, #c9952c)' }}></div>
                <div className="w-2.5 h-2.5 rounded-full mb-1.5 ml-3" style={{ background: 'radial-gradient(circle, #e8c34a, #d4a843)' }}></div>
                <div className="w-3 h-3 rounded-full ml-1" style={{ background: 'radial-gradient(circle, #d4a843, #c9952c)' }}></div>
            </div>

            {/* Esquina inferior izquierda — arcos */}
            <svg className="absolute -bottom-4 -left-4 w-48 h-48 pointer-events-none" viewBox="0 0 200 200" fill="none">
                <ellipse cx="30" cy="170" rx="100" ry="100" stroke="url(#goldGrad1)" strokeWidth="3" opacity=".3" />
                <ellipse cx="30" cy="170" rx="80" ry="80" stroke="url(#goldGrad1)" strokeWidth="2" opacity=".22" />
                <ellipse cx="30" cy="170" rx="55" ry="55" fill="url(#goldFill1)" opacity=".1" />
                <path d="M5 120 Q25 155 70 175" stroke="url(#goldGrad2)" strokeWidth="3.5" fill="none" opacity=".5" />
            </svg>

            {/* Esquina inferior derecha — relleno texturado */}
            <svg className="absolute -bottom-8 -right-8 w-56 h-56 pointer-events-none" viewBox="0 0 240 240" fill="none">
                <circle cx="200" cy="200" r="100" fill="url(#goldFill3)" opacity=".2" />
                <circle cx="200" cy="200" r="75" fill="url(#goldFill4)" opacity=".18" />
                <circle cx="200" cy="200" r="80" stroke="url(#goldGrad3)" strokeWidth="2.5" opacity=".25" />
                <circle cx="180" cy="180" r="40" fill="url(#goldFill4)" opacity=".22" />
                <defs>
                    <radialGradient id="goldFill3"><stop offset="0%" stopColor="#c9952c" /><stop offset="80%" stopColor="#d4a843" /><stop offset="100%" stopColor="#e8c34a" stopOpacity="0" /></radialGradient>
                    <radialGradient id="goldFill4"><stop offset="0%" stopColor="#b8860b" /><stop offset="100%" stopColor="#d4a843" stopOpacity="0" /></radialGradient>
                </defs>
            </svg>

            {/* Línea dorada horizontal */}
            <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '38%' }}>
                <div className="h-[1.5px] w-full" style={{ background: 'linear-gradient(90deg, transparent 5%, #d4a843 30%, #e8c34a 50%, #d4a843 70%, transparent 95%)' }}></div>
            </div>

            {/* ═══ CONTENIDO ═══ */}
            <div className="px-10 py-8 relative z-10 flex flex-col h-full overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[22px] font-bold italic text-gray-800">
                        Detalles de Ventas #{String(sale.numeroVenta || "").padStart(2, '0')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-white px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer shadow-sm"
                        >
                            <FileText size={16} />
                            Generar reporte
                        </button>
                        <button
                            onClick={handleClose}
                            className="text-gray-800 hover:text-black transition cursor-pointer"
                        >
                            <X size={22} strokeWidth={2.5} />
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
                    <div className="flex gap-24">
                        {/* Columna izquierda */}
                        <div className="flex flex-col gap-3">
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
                        </div>

                        {/* Columna derecha */}
                        <div className="flex flex-col gap-2">
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Subtotal {totalesNetos.subtotal !== sale.subtotal && "(Neto)"}</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.subtotal?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">IVA {totalesNetos.iva !== sale.iva && "(Neto)"}</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.iva?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 leading-none mb-1">Total {totalesNetos.total !== sale.total && "(Neto)"}</p>
                                <p className="font-bold text-gray-800 text-[17px]">${totalesNetos.total?.toLocaleString()}</p>
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
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="px-5 py-3 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Producto</th>
                                        <th className="px-5 py-3 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Precio Unit.</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Cant. Original</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Devuelto</th>
                                        <th className="px-5 py-3 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Cant. Neta</th>
                                        <th className="px-5 py-3 text-right font-bold text-gray-700 uppercase text-[11px] tracking-wider">Subtotal Neto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosNetos.map((prod, index) => (
                                        <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition">
                                            <td className="px-5 py-4 text-gray-800 font-medium">{prod.nombre}</td>
                                            <td className="px-5 py-4 text-gray-600">${prod.precio?.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-center text-gray-600 bg-gray-50/30">{prod.cantOriginal}</td>
                                            <td className={`px-5 py-4 text-center font-bold ${prod.cantDevuelta > 0 ? 'text-red-500 bg-red-50/30' : 'text-gray-300'}`}>
                                                {prod.cantDevuelta > 0 ? `-${prod.cantDevuelta}` : '0'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-800 font-bold bg-yellow-50/30">{prod.cantNeta}</td>
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
