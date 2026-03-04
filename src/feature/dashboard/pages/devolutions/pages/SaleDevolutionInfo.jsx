import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, FileText } from "lucide-react";
import Pagination   from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert        from "../../../components/ui/Alert";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { generatePDFReport } from "../../../../../utils/PDFReportGenerator";

const ITEMS_PER_PAGE = 5;

const formatCOP = (v) => "$" + Number(v || 0).toLocaleString("es-CO");

/**
 * Vista: Información devolución de venta
 *
 * Lee la devolución de localStorage["devolutions"] por id (useParams).
 * Lee la venta asociada de localStorage["ventas"] por d.idVenta.
 *
 * ⚠️  Ajusta el key "ventas" al nombre real que use el módulo de ventas.
 */
export default function SaleDevolutionInfo() {
    const navigate = useNavigate();
    const { id }   = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert]             = useState(null);

    // ─── Datos ────────────────────────────────────────────────────────────────
    const devolutions = JSON.parse(localStorage.getItem("devolutions") || "[]");
    const devolucion  = devolutions.find((d) => String(d.id) === String(id));

    // Ajusta "ventas" al key real que use tu módulo de ventas
    const ventas   = JSON.parse(localStorage.getItem("ventas") || "[]");
    const venta    = ventas.find((v) => String(v.id) === String(devolucion?.idVenta));
    const productos = venta?.productos || [];

    // ─── Paginación ───────────────────────────────────────────────────────────
    const totalPages      = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual    = Math.min(currentPage, totalPages);
    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    // ─── Total devolución ─────────────────────────────────────────────────────
    const totalDevolucion = productos.reduce(
        (acc, p) => acc + (Number(p.precio || 0) * Number(p.cantidad || 0)),
        0
    );

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
                    columns: ["Producto", "Precio", "Cantidad", "Subtotal"],
                    data: productos.map((p) => [
                        p.nombre || "—",
                        formatCOP(p.precio),
                        String(p.cantidad || 0),
                        formatCOP((p.precio || 0) * (p.cantidad || 0)),
                    ]),
                });
                setAlert({ type: "success", message: "Reporte generado correctamente." });
                setConfirmData(null);
            },
        });
    };

    // ─── No encontrada ────────────────────────────────────────────────────────
    if (!devolucion) {
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
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

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
                            <p className="font-semibold text-gray-800">{venta?.id ?? devolucion.idVenta ?? "—"}</p>
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

                {/* PRODUCTOS */}
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
                                    <th className="px-4 py-2 w-12" />
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {productosPagina.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            Sin productos en esta venta.
                                        </td>
                                    </tr>
                                ) : (
                                    productosPagina.map((p, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-4 py-2">{p.nombre || "—"}</td>
                                            <td className="px-4 py-2">{(p.precio || 0).toLocaleString("es-CO")}</td>
                                            <td className="px-4 py-2">{p.cantidad || "—"}</td>
                                            <td className="px-4 py-2">
                                                {((p.precio || 0) * (p.cantidad || 0)).toLocaleString("es-CO")}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => navigate(`/dashboard/devolutions/details/${devolucion.id}`)}
                                                    className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                >
                                                    <Eye size={15} className="text-yellow-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN + TOTAL DEVOLUCIÓN */}
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