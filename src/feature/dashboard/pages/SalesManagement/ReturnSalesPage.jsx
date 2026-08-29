import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Eye, Pencil, Trash2, Undo2, FileText, History, ArrowLeft } from "lucide-react";
import { SalesService } from "./services/SalesService";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { getEstadoColor } from "../devolutions/helpers/devolutionsHelpers";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Pagination from "../../components/ui/Pagination";
import StatusHistoryModal from "../devolutions/components/StatusHistoryModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from "../../../../utils/logoBase64";
import { useToast } from "../../../../context/ToastContext";

const formatCOP = (v) => "$" + Number(v || 0).toLocaleString("es-CO");
const PROD_PER_PAGE = 5;
const DEV_PER_PAGE = 3;
const ESTADOS_BLOQUEADOS = ["RESUELTO", "RECHAZADA", "Anulada"];


export default function ReturnSalesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { showToast } = useToast();

    const [sale, setSale] = useState(null);
    const [devolucionesVenta, setDevolucionesVenta] = useState([]);
    const [confirmData, setConfirmData] = useState(null);
    const [prodPage, setProdPage] = useState(1);
    const [devPage, setDevPage] = useState(1);
    const [historyDev, setHistoryDev] = useState(null);

    const mode = location.state?.mode ?? "from-sales";
    const isFromSales = mode === "from-sales";
    const isEditable = mode === "editable";
    const desdeVentas = isFromSales || location.state?.origin === "sales";

    useEffect(() => {
        if (!id) return;
        SalesService.getById(id)
            .then(found => setSale(found || null))
            .catch(e => console.error(e));
    }, [id]);

    const recargarDevoluciones = useCallback(() => {
        if (sale?.id) {
            ServicesDevolutions.getBySaleId(sale.id)
                .then((devs) => {
                    const devsActivas = desdeVentas
                        ? devs.filter(
                            (d) => !d.anulada && d.estadoResolucion !== "Anulada" && d.estadoResolucion !== "RECHAZADA",
                        )
                        : devs;
                    const localDevsStr = localStorage.getItem(`pendingDevs_${sale.id}`);
                    const localDevs = localDevsStr ? JSON.parse(localDevsStr) : [];
                    setDevolucionesVenta([...devsActivas, ...localDevs]);
                })
                .catch(e => console.error("Error cargando devoluciones:", e));
        }
    }, [sale?.id, desdeVentas]);

    useEffect(() => { recargarDevoluciones(); }, [recargarDevoluciones]);

    if (!sale) return null;

    const productos = sale.productos || [];

    const cantidadDevueltaPorProductoId = (productoId) =>
        devolucionesVenta
            .filter(
                (d) =>
                    d.estadoResolucion !== "Anulada" &&
                    d.estadoResolucion !== "RECHAZADA" &&
                    d.productoId === productoId,
            )
            .reduce((s, d) => s + Number(d.cantidad || 0), 0);

    const isYaDevuelto = sale.estado === "Devuelto";

    const totalMontoReembolsado = devolucionesVenta
        .filter((d) =>
            d.estadoResolucion !== "Anulada" &&
            d.estadoResolucion !== "RECHAZADA" &&
            (d.gestion === "REEMBOLSO_TOTAL" || d.gestion === "REEMBOLSO_PARCIAL"),
        )
        .reduce((s, d) => s + Number(d.montoReembolso || 0), 0);

    const totalProdPages = Math.max(1, Math.ceil(productos.length / PROD_PER_PAGE));
    const prodActual = Math.min(prodPage, totalProdPages);
    const paginatedProds = productos.slice((prodActual - 1) * PROD_PER_PAGE, prodActual * PROD_PER_PAGE);

    const totalDevPages = Math.max(1, Math.ceil(devolucionesVenta.length / DEV_PER_PAGE));
    const devActual = Math.min(devPage, totalDevPages);
    const paginatedDevs = devolucionesVenta.slice((devActual - 1) * DEV_PER_PAGE, devActual * DEV_PER_PAGE);

    const handleDevolver = (producto) => {
        const devuelto = cantidadDevueltaPorProductoId(producto.productoId);
        const restante = producto.cantidad - devuelto;

        if (restante <= 0) return;

        const meses = parseInt(producto.garantia) || 0;
        const fechaVenta = new Date(sale.fechaCreacion || sale.fecha);
        const fechaVencimiento = new Date(fechaVenta);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);
        const garantiaVencida = meses > 0 && new Date() > fechaVencimiento;
        navigate("/dashboard/devolutions/create", {
            state: { idVenta: sale.id, productoNombre: producto.nombre, mode, garantiaVencida },
        });
    };

    const handleVerDetalle = (devolucion) => {
        navigate(`/dashboard/devolutions/product-details/${devolucion.id}`, {
            state: { mode, idVenta: sale.id },
        });
    };

    const handleEditar = (devolucion) => {
        navigate(`/dashboard/devolutions/edit/${devolucion.id}`, {
            state: { idVenta: sale.id, mode },
        });
    };

    const handleEliminar = (devolucion) => {
        const esTemporal = String(devolucion.id).startsWith("temp-");
        if (!esTemporal && ESTADOS_BLOQUEADOS.includes(devolucion.estadoResolucion)) {
            showToast("error", `No se puede anular una devolución en estado ${devolucion.estadoResolucion}.`);
            return;
        }

        setConfirmData({
            type: "delete",
            title: "Eliminar devolución",
            message: `¿Eliminar la devolución del producto "${devolucion.producto}"? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    if (esTemporal) {
                        const key = `pendingDevs_${sale.id}`;
                        const localDevsStr = localStorage.getItem(key);
                        if (localDevsStr) {
                            const localDevs = JSON.parse(localDevsStr).filter(d => String(d.id) !== String(devolucion.id));
                            localStorage.setItem(key, JSON.stringify(localDevs));
                        }
                    } else {
                        await ServicesDevolutions.delete(devolucion.id);
                        const saleActualizada = await SalesService.getById(sale.id);
                        setSale(saleActualizada);
                    }
                    setDevolucionesVenta((prev) => prev.filter((d) => String(d.id) !== String(devolucion.id)));
                    showToast("success", "Devolución eliminada.");
                } catch (error) {
                    showToast("error", "Error eliminando devolución: " + error.message);
                } finally {
                    setConfirmData(null);
                }
            },
        });
    };

    const handleRegistrar = () => {
        if (devolucionesVenta.length === 0) {
            showToast("error", "Debes devolver al menos un producto antes de registrar.");
            return;
        }
        setConfirmData({
            type: "warning",
            title: "Registrar devolución",
            message: devolucionesVenta.length < productos.length
                ? "¿Estás seguro? El estado de la venta cambiará a 'Devolución Parcial'."
                : "¿Estás seguro? El estado de la venta cambiará a 'Devuelto'.",
            onConfirm: async () => {
                try {
                    const key = `pendingDevs_${sale.id}`;
                    const localDevsStr = localStorage.getItem(key);
                    const localDevs = localDevsStr ? JSON.parse(localDevsStr) : [];

                    if (localDevs.length > 0) {
                        const payloads = localDevs.map((dev) => {
                            const { id: _id, ...rest } = dev;
                            return rest;
                        });
                        await ServicesDevolutions.createBatch(sale.id, payloads);
                    }

                    localStorage.removeItem(key);
                    showToast("success", "Devolución registrada correctamente.");
                    setConfirmData(null);
                     setTimeout(() => {
                         navigate(isFromSales ? "/dashboard/sales-management" : "/dashboard/devolutions");
                     }, 1500);
                } catch (error) {
                    showToast("error", "Error registrando devolución: " + error.message);
                    setConfirmData(null);
                }
            },
        });
    };

    const handleGenerarPDF = () => {
        const doc = new jsPDF();
        const numeroVenta = String(sale.numeroVenta || "").padStart(2, "0");
        const fileName = `devolucion_${numeroVenta}.pdf`;
        const headColor = [234, 179, 8];
        const pageWidth = doc.internal.pageSize.width;

        // --- BANNER INSTITUCIONAL (idéntico a PDFReportGenerator) ---
        // Fondo claro para ahorrar tinta en impresión
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, pageWidth, 32, "F");

        // Logo (bombillo)
        try {
            doc.addImage(logoBase64, "PNG", 12, 6, 20, 20);
        } catch { void 0; }

        // Nombre de Empresa
        doc.setTextColor(50, 50, 50); // Gris oscuro
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ElectroSoft", 35, 15);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("CL 51 # 55 - 69 Local 133", 35, 21);
        doc.text("Tel: +57 313 6345398", 35, 26);

        // Título del Reporte (alineado a la derecha)
        doc.setTextColor(80, 80, 80); // Gris oscuro
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`DEVOLUCIÓN — ${numeroVenta}`, pageWidth - 14, 21, { align: "right" });

        // --- INFORMACIÓN DEL REPORTE ---
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Fecha de emisión alineada a la derecha
        doc.text(
            `Fecha de emisión: ${new Date().toLocaleDateString()}`,
            pageWidth - 14,
            41,
            { align: "right" }
        );

        // Información general
        let currentY = 41;
        const infoLines = [
            `ID venta: ${numeroVenta}`,
            `Fecha creación: ${sale.fecha ?? "—"}`,
            `Total venta: ${formatCOP(sale.total)}`,
            `Estado: ${sale.estado ?? "—"}`,
            `Productos devueltos: ${devolucionesVenta.length}`,
            `Total monto reembolso: ${totalMontoReembolsado > 0 ? formatCOP(totalMontoReembolsado) : "No aplica."}`,
        ];
        infoLines.forEach((line) => {
            doc.text(line, 14, currentY);
            currentY += 6;
        });

        // Línea separadora sutil
        currentY += 2;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, currentY, pageWidth - 14, currentY);
        currentY += 5;

        // Tabla 1: Productos de la venta
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Productos de la venta", 14, currentY + 4);
        currentY += 8;

        const prodColumns = ["Producto", "Precio", "Cantidad", "Subtotal"];
        const prodData = (sale.productos || []).map((p) => [
            p.nombre ?? "—",
            formatCOP(p.precio),
            String(p.cantidad ?? "—"),
            formatCOP((p.precio || 0) * (p.cantidad || 0)),
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [prodColumns],
            body: prodData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: headColor },
        });

        // Tabla 2: Productos devueltos
        const afterFirstTable = doc.lastAutoTable.finalY + 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Productos devueltos", 14, afterFirstTable);

        const devColumns = ["Producto", "Cantidad", "Motivo", "Condición", "Gestión", "Estado resolución"];
        const devData = devolucionesVenta.map((d) => [
            d.producto ?? "—",
            d.cantidad ?? "—",
            (d.motivo ?? "—").replace(/_/g, " "),
            (d.condicionProducto ?? "—").replace(/_/g, " "),
            (d.gestion ?? "—").replace(/_/g, " "),
            d.estadoResolucion ?? "—",
        ]);

        autoTable(doc, {
            startY: afterFirstTable + 4,
            head: [devColumns],
            body: devData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: headColor },
        });

        doc.save(fileName);
    };

    const handleVolver = () => {
        if (sale?.id) {
            localStorage.removeItem(`pendingDevs_${sale.id}`);
        }
        if (isFromSales) {
            navigate("/dashboard/sales-management");
        } else {
            navigate("/dashboard/devolutions");
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-4 w-full h-full overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Devolución de venta
                        {isYaDevuelto && (
                            <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                                Devuelta
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleGenerarPDF}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer shadow-sm"
                            title="Generar reporte PDF"
                        >
                            <FileText size={15} />
                            Generar reporte
                        </button>
                        <button
                            onClick={handleVolver}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>
                </div>

                {/* Información venta */}
                <div className="border-b border-gray-300 py-4">
                    <p className="font-semibold text-gray-800 mb-2">Información venta</p>
                    <div className="bg-white rounded-xl border-l-4 border-yellow-400 px-5 py-5 grid grid-cols-1 md:grid-cols-5 items-center gap-8 shadow-sm">
                        <div><p className="text-xs text-gray-400">ID venta</p><p className="font-semibold text-gray-800">{String(sale.numeroVenta || "").padStart(2, '0')}</p></div>
                        <div><p className="text-xs text-gray-400">Fecha creación</p><p className="font-semibold text-gray-800">{sale.fecha ?? "—"}</p></div>
                        <div><p className="text-xs text-gray-400">IVA</p><p className="font-bold text-gray-800">{formatCOP(sale.iva)}</p></div>
                        <div><p className="text-xs text-gray-400">Total</p><p className="font-bold text-gray-800 text-base">{formatCOP(sale.total)}</p></div>
                        <div><p className="text-xs text-gray-400">Estado</p><p className="font-semibold text-gray-700">{sale.estado ?? "—"}</p></div>
                    </div>
                </div>

                {/* Productos de la venta */}
                <div className="border-b border-gray-300 py-4">
                    <p className="font-semibold text-gray-800 mb-2">Productos de la venta</p>
                    <div className="rounded-xl overflow-x-auto border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-4 py-3 font-semibold">Producto</th>
                                    <th className="px-4 py-3 font-semibold text-center">Estado</th>
                                    <th className="px-4 py-3 font-semibold text-center">Garantía</th>
                                    <th className="px-4 py-3 font-semibold text-center">Cantidad</th>
                                    <th className="px-4 py-3 font-semibold">Precio</th>
                                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                                     {(isFromSales || isEditable) && <th className="px-4 py-3 font-semibold text-center">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProds.map((prod, i) => {
                                    const devuelto = cantidadDevueltaPorProductoId(prod.productoId);
                                    const restante = prod.cantidad - devuelto;
                                    const totalDevuelto = devuelto >= prod.cantidad;
                                    
                                    const mesesGarantia = parseInt(prod.garantia) || 0;
                                    const fechaVenta = new Date(sale.fechaCreacion || sale.fecha);
                                    const fechaVencimiento = new Date(fechaVenta);
                                    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesGarantia);
                                    const garantiaValida = new Date() <= fechaVencimiento;
                                    const diasRestantesGarantia = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / 86400000);

                                    return (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3">{prod.nombre}</td>
                                            <td className="px-4 py-3 text-center">
                                                {totalDevuelto
                                                    ? <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">Devuelto</span>
                                                    : devuelto > 0
                                                        ? <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded-full">Parcial</span>
                                                        : <span className="text-xs bg-green-100 text-green-600 font-medium px-2 py-0.5 rounded-full">Disponible</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {mesesGarantia === 0 ? (
                                                    <span className="text-xs text-gray-500">Sin garantía</span>
                                                ) : garantiaValida ? (
                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                                                        Vigente (por {diasRestantesGarantia} {diasRestantesGarantia === 1 ? "día" : "días"})
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-medium">Expiró</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span>{prod.cantidad}</span>
                                                {devuelto > 0 && (
                                                    <span className="ml-1.5 text-xs text-orange-500 font-medium">
                                                        ({restante > 0 ? `${restante} disp.` : "agotado"})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{formatCOP(prod.precio)}</td>
                                            <td className="px-4 py-3">{formatCOP(prod.precio * prod.cantidad)}</td>
                                             {(isFromSales || isEditable) && (
                                                <td className="px-4 py-3 text-center">
                                                    {!totalDevuelto
                                                        ? <button onClick={() => handleDevolver(prod)} title="Devolver este producto" className="text-yellow-600 hover:text-yellow-800 transition cursor-pointer"><Undo2 size={16} /></button>
                                                        : <button disabled title="Stock completamente devuelto" className="text-gray-300 cursor-not-allowed"><Undo2 size={16} /></button>
                                                    }
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {totalProdPages > 1 && (
                        <div className="flex justify-end mt-3">
                            <Pagination currentPage={prodActual} totalPages={totalProdPages} onPageChange={setProdPage} />
                        </div>
                    )}
                </div>

                {/* Productos devueltos */}
                <div className="border-b border-gray-300 py-4">
                    <p className="font-semibold text-gray-800 mb-2">
                        Productos devueltos
                        <span className="ml-2 text-xs font-normal text-gray-400">({devolucionesVenta.length})</span>
                    </p>
                    <div className="rounded-xl overflow-x-auto border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-3 py-2.5 font-semibold">Producto</th>
                                    <th className="px-3 py-2.5 font-semibold text-center">Cantidad</th>
                                    <th className="px-3 py-2.5 font-semibold">Motivo</th>
                                    <th className="px-3 py-2.5 font-semibold">Condición</th>
                                    <th className="px-3 py-2.5 font-semibold">Gestión</th>
                                    <th className="px-3 py-2.5 font-semibold">Monto reembolsado</th>
                                    <th className="px-3 py-2.5 font-semibold">Estado resolución</th>
                                    <th className="px-3 py-2.5 font-semibold text-center w-32">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDevs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-6 text-center text-gray-400 text-sm">
                                            {isFromSales
                                                ? "Usa el botón ↩ para agregar productos a devolver."
                                                : "No hay productos devueltos para esta venta."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDevs.map((dev) => {
                                        const esTemporal = String(dev.id).startsWith("temp-");
                                        // Las temporales (borradores locales) siempre son editables (R5)
                                        const bloqueado = !esTemporal && ESTADOS_BLOQUEADOS.includes(dev.estadoResolucion);
                                        return (
                                            <tr key={dev.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-2.5 text-xs font-medium">{dev.producto}</td>
                                                <td className="px-3 py-2.5 text-xs text-center">{dev.cantidad ?? "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.motivo?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.condicionProducto?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">{dev.gestion?.replace(/_/g, " ") || "—"}</td>
                                                <td className="px-3 py-2.5 text-xs">
                                                    {dev.gestion === "REEMBOLSO_TOTAL" || dev.gestion === "REEMBOLSO_PARCIAL"
                                                        ? (Number(dev.montoReembolso) > 0 ? formatCOP(dev.montoReembolso) : "N/A")
                                                        : "N/A"}
                                                </td>
                                                <td className="px-3 py-2.5 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(dev.estadoResolucion)}`}>
                                                        {dev.estadoResolucion || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <div className="flex justify-center gap-1.5">
                                                        {/* Ver detalle */}
                                                        <button title="Ver detalle" onClick={() => handleVerDetalle(dev)} className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer">
                                                            <Eye size={14} className="text-blue-600" />
                                                        </button>
                                                        {/* Historial de estados — 1.6 */}
                                                         {!esTemporal && (
                                                             <button
                                                                 title="Ver historial de estados"
                                                                 onClick={() => setHistoryDev(dev)}
                                                                 className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                                                             >
                                                                 <History size={14} className="text-purple-600" />
                                                             </button>
                                                         )}
                                                        {/* Editar — from-sales y editable */}
                                                        {(isFromSales || isEditable) && (
                                                            <button
                                                                title={bloqueado ? "No se puede editar" : "Editar"}
                                                                onClick={() => !bloqueado && handleEditar(dev)}
                                                                disabled={bloqueado}
                                                                className={`p-1.5 rounded-lg transition ${bloqueado ? "bg-gray-100 opacity-40 cursor-not-allowed" : "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"}`}
                                                            >
                                                                <Pencil size={14} className="text-yellow-600" />
                                                            </button>
                                                        )}
                                                         {/* Eliminar — from-sales y editable */}
                                                         {(isFromSales || isEditable) && (
                                                            <button
                                                                title={bloqueado ? "No se puede anular una devolución en estado final" : "Eliminar devolución"}
                                                                onClick={() => handleEliminar(dev)}
                                                                disabled={bloqueado}
                                                                className={`p-1.5 rounded-lg transition ${bloqueado ? "bg-gray-100 opacity-40 cursor-not-allowed" : "bg-red-100 hover:bg-red-200 cursor-pointer"}`}
                                                            >
                                                                <Trash2 size={14} className="text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                     {totalDevPages > 1 && (
                         <div className="flex justify-end mt-3">
                             <Pagination currentPage={devActual} totalPages={totalDevPages} onPageChange={setDevPage} />
                         </div>
                     )}
                 </div>

                 {/* Footer */}
                 <div className={`flex items-center pt-4 justify-end gap-6`}>
                     <div className="flex items-center gap-2 text-sm">
                         <span className="font-semibold text-gray-700">Total monto reembolsado:</span>
                         <span className="font-bold text-green-700 text-base">
                             {formatCOP(totalMontoReembolsado)}
                         </span>
                     </div>
                      {(isFromSales || (isEditable && devolucionesVenta.some((d) => String(d.id).startsWith("temp-")))) && !isYaDevuelto && (
                         <button
                             onClick={handleRegistrar}
                             className="px-6 py-2.5 bg-linear-to-r from-white to-yellow-300 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer font-medium text-sm"
                        >
                            Registrar devolución
                        </button>
                    )}
                </div>

            </div>

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
            {/* 1.6: Modal historial de estados */}
            {historyDev && (
                <StatusHistoryModal
                    devolucion={historyDev}
                    onClose={() => setHistoryDev(null)}
                />
            )}
        </>
    );
}
