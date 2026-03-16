import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, FileText, Trash2 } from "lucide-react";
import Pagination    from "../../../components/ui/Pagination";
import ConfirmModal  from "../../../components/ui/ConfirmModal";
import Alert         from "../../../components/ui/Alert";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";

const ITEMS_PER_PAGE = 7;
const formatCOP = (v) => "$" + Number(v || 0).toLocaleString("es-CO");

/**
 * DevolutionDetails
 *
 * Muestra la info de la venta + tabla de devoluciones hechas para esa venta.
 * Cada fila = una devolución (un producto devuelto), con su propio Eye y Trash.
 *
 * Regla: una devolución = un producto. Si la venta tiene 3 productos y
 * se devolvieron 2, se muestran 2 filas.
 */
export default function DevolutionDetails() {
    const navigate = useNavigate();
    const { id }   = useParams();   // id de la devolución que activó esta vista

    const [devolucionesVenta, setDevolucionesVenta] = useState([]);
    const [currentPage, setCurrentPage]             = useState(1);
    const [confirmData, setConfirmData]             = useState(null);
    const [alert, setAlert]                         = useState(null);

    // ─── Devolución raíz (la del id en la URL) ─────────────────────────────────
    const devolucionRaiz = ServicesDevolutions.getById(id);

    // ─── Todas las devoluciones de la misma venta ─────────────────────────────
    useEffect(() => {
        if (!devolucionRaiz) return;
        setDevolucionesVenta(
            ServicesDevolutions.getByIdVenta(devolucionRaiz.idVenta)
        );
    }, [id]);

    // ─── Datos de la venta ────────────────────────────────────────────────────
    const ventas  = JSON.parse(localStorage.getItem("sales") || "[]");
    const venta   = ventas.find((v) => String(v.id) === String(devolucionRaiz?.idVenta));

    // ─── Precio/cantidad de cada producto devuelto (desde la venta) ───────────
    const getProductoInfo = (nombreProducto) =>
        venta?.productos?.find((p) => p.nombre === nombreProducto) || null;

    // ─── Total devolución ─────────────────────────────────────────────────────
    const totalDevolucion = devolucionesVenta.reduce((acc, d) => {
        const info = getProductoInfo(d.producto);
        return acc + (Number(info?.precio || 0) * Number(info?.cantidad || 0));
    }, 0);

    // ─── Paginación ───────────────────────────────────────────────────────────
    const totalPages      = Math.max(1, Math.ceil(devolucionesVenta.length / ITEMS_PER_PAGE));
    const paginaActual    = Math.min(currentPage, totalPages);
    const filasPagina     = devolucionesVenta.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Eliminar devolución de producto ─────────────────────────────────────
    const handleEliminar = (devolucion) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar devolución",
            message: `¿Estás seguro de que deseas eliminar la devolución del producto "${devolucion.producto}"? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                ServicesDevolutions.delete(devolucion.id);
                const actualizadas = devolucionesVenta.filter(
                    (d) => String(d.id) !== String(devolucion.id)
                );
                setDevolucionesVenta(actualizadas);
                setAlert({ type: "success", message: "Devolución eliminada correctamente." });
                setConfirmData(null);

                // Si no quedan devoluciones para esta venta, volver al listado
                if (actualizadas.length === 0) {
                    setTimeout(() => navigate("/dashboard/devolutions"), 1200);
                }
            },
        });
    };

    // ─── Reporte ──────────────────────────────────────────────────────────────
    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de esta devolución?",
            onConfirm: () => {
                generatePDFReport({
                    title: "Información Devolución de Venta",
                    fileName: `reporte_devolucion_${id}.pdf`,
                    columns: ["Producto", "Precio", "Cantidad", "Subtotal", "Estado"],
                    data: devolucionesVenta.map((d) => {
                        const info = getProductoInfo(d.producto);
                        return [
                            d.producto || "—",
                            formatCOP(info?.precio),
                            String(info?.cantidad || 0),
                            formatCOP((info?.precio || 0) * (info?.cantidad || 0)),
                            d.estadoResolucion || "—",
                        ];
                    }),
                });
                setAlert({ type: "success", message: "Reporte generado correctamente." });
                setConfirmData(null);
            },
        });
    };

    // ─── No encontrada ────────────────────────────────────────────────────────
    if (!devolucionRaiz) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-4 items-center justify-center shadow-inner min-h-40">
                <p className="text-gray-500 text-sm">No se encontró la devolución solicitada.</p>
                <button
                    onClick={() => navigate("/dashboard/devolutions")}
                    className="bg-linear-to-r from-white to-yellow-300 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Información devolución de venta
                    </h2>
                    <button
                        onClick={handleGenerarReporte}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm cursor-pointer"
                    >
                        <FileText size={16} className="text-gray-500" />
                        Generar reporte
                    </button>
                </div>

                {/* INFORMACIÓN VENTA */}
                <div>
                    <p className="text-base font-semibold text-gray-700 mb-3">Información venta</p>
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200 inline-flex items-center gap-8 text-sm">
                        <div className="border-r border-yellow-400 pr-6">
                            <p className="text-yellow-500 text-xs mb-1">ID venta</p>
                            <p className="font-semibold text-gray-800">
                                {venta?.numeroDocumento ?? devolucionRaiz.idVenta ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-yellow-500 text-xs mb-1">Fecha creación</p>
                            <p className="font-semibold text-gray-800">{venta?.fecha ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-yellow-500 text-xs mb-1">Subtotal</p>
                            <p className="font-semibold text-gray-800">{formatCOP(venta?.subtotal)}</p>
                        </div>
                        <div>
                            <p className="text-yellow-500 text-xs mb-1">IVA</p>
                            <p className="font-semibold text-gray-800">{formatCOP(venta?.iva)}</p>
                        </div>
                        <div>
                            <p className="text-yellow-500 text-xs mb-1">Total</p>
                            <p className="font-bold text-gray-800 text-base">{formatCOP(venta?.total)}</p>
                        </div>
                    </div>
                </div>

                {/* TABLA: productos devueltos (una fila = una devolución) */}
                <div>
                    <p className="text-base font-semibold text-gray-700 mb-3">Productos</p>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr className="text-left">
                                    <th className="px-4 py-2 font-semibold">Producto</th>
                                    <th className="px-4 py-2 font-semibold">Precio</th>
                                    <th className="px-4 py-2 font-semibold">Cantidad</th>
                                    <th className="px-4 py-2 font-semibold">Subtotal</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {filasPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            Sin productos devueltos en esta venta.
                                        </td>
                                    </tr>
                                ) : (
                                    filasPagina.map((d) => {
                                        const info = getProductoInfo(d.producto);
                                        return (
                                            <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="px-4 py-2">{d.producto || "—"}</td>
                                                <td className="px-4 py-2">
                                                    {(info?.precio || 0).toLocaleString("es-CO")}
                                                </td>
                                                <td className="px-4 py-2">{info?.cantidad || "—"}</td>
                                                <td className="px-4 py-2">
                                                    {((info?.precio || 0) * (info?.cantidad || 0)).toLocaleString("es-CO")}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-center gap-2">

                                                        {/* VER DETALLE — va al formulario de ESA devolución */}
                                                        <button
                                                            onClick={() => navigate(`/dashboard/devolutions/product-details/${d.id}`)}
                                                            className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                            title="Ver detalle del producto"
                                                        >
                                                            <Eye size={15} className="text-yellow-600" />
                                                        </button>

                                                        {/* ELIMINAR */}
                                                        <button
                                                            onClick={() => handleEliminar(d)}
                                                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                            title="Eliminar devolución de este producto"
                                                        >
                                                            <Trash2 size={15} className="text-red-600" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN + TOTAL */}
                    <div className="flex items-center justify-between mt-3">
                        <Pagination
                            currentPage={paginaActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                        <p className="text-sm font-semibold text-gray-700">
                            Total devolución:{" "}
                            <span className="text-base font-bold">{formatCOP(totalDevolucion)}</span>
                        </p>
                    </div>
                </div>

                {/* BOTÓN VOLVER */}
                <div className="flex justify-end">
                    <PrimaryButton onClick={() => navigate("/dashboard/devolutions")}>
                        Volver
                    </PrimaryButton>
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