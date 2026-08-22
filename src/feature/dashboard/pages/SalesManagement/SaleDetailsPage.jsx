import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, ArrowLeft, RefreshCw, User, CalendarDays, CreditCard, Package, Receipt, Clock, AlertCircle } from "lucide-react";
import { generatePDFReport } from "../../../../utils/PDFReportGenerator";
import { ServicesDevolutions } from "../devolutions/services/ServicesDevolutions";
import { SalesService } from "./services/SalesService";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../../../context/ToastContext";

export default function SaleDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();

    const [sale, setSale] = useState(null);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        if (!id) return;

        setLoadingRefresh(true);
        SalesService.getById(id)
            .then((freshSale) => {
                if (freshSale) setSale(freshSale);
            })
            .catch((err) => {
                console.warn(
                    "[SaleDetailsPage] No se pudo cargar desde el backend:",
                    err?.message
                );
            })
            .finally(() => setLoadingRefresh(false));
    }, [id]);

    const [productosNetos, setProductosNetos] = useState([]);

    const [totalesNetos, setTotalesNetos] = useState({
        subtotal: 0,
        iva: 0,
        total: 0
    });

    useEffect(() => {
        if (!sale) return;

        ServicesDevolutions.getBySaleId(sale.id)
            .then((devoluciones) => {
                const cantDevueltasMap = devoluciones.reduce(
                    (acc, d) => {
                        acc[d.producto] =
                            (acc[d.producto] || 0) +
                            Number(d.cantidad || 0);

                        return acc;
                    },
                    {}
                );

                const netos = (sale.productos || []).map((p) => {
                    const devuelto =
                        cantDevueltasMap[p.nombre] || 0;

                    return {
                        ...p,
                        cantOriginal: p.cantidad,
                        cantDevuelta: devuelto,
                        cantNeta: Math.max(
                            0,
                            p.cantidad - devuelto
                        )
                    };
                });

                const newTotal = netos.reduce(
                    (sum, p) =>
                        sum +
                        p.precio *
                        p.cantNeta,
                    0
                );

                const newIva = newTotal * 0.19;

                const newSubtotal =
                    newTotal - newIva;

                setProductosNetos(netos);

                setTotalesNetos({
                    subtotal: newSubtotal,
                    iva: newIva,
                    total: newTotal
                });
            })
            .catch((e) =>
                console.error(
                    "Error al obtener devoluciones:",
                    e
                )
            );
    }, [sale]);

    const calculateDeadline = () => {
        if (!sale || !sale.fecha) return null;

        if (
            sale.tipoVenta !== "Credito" &&
            sale.tipoVenta !== "Crédito" &&
            sale.tipoVenta !== "Mixto"
        ) {
            return null;
        }

        const diasPlazo = sale.diasPlazo != null ? Number(sale.diasPlazo) : 0;
        const creationDate = new Date(sale.fecha + "T00:00:00");
        const deadlineDate = new Date(creationDate);
        deadlineDate.setDate(deadlineDate.getDate() + diasPlazo);

        const now = new Date();
        const todayStr =
            `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-${String(
                now.getDate()
            ).padStart(2, "0")}`;

        const todayDate = new Date(todayStr + "T00:00:00");
        const diffTime = deadlineDate.getTime() - todayDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        const deadStr =
            `${deadlineDate.getFullYear()}-${String(
                deadlineDate.getMonth() + 1
            ).padStart(2, "0")}-${String(
                deadlineDate.getDate()
            ).padStart(2, "0")}`;

        return { fechaLimite: deadStr, diasRestantes: diffDays };
    };

    const deadlineInfo = calculateDeadline();

    if (!sale) {
        return (
            <div className="bg-white p-6 flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">
                    Cargando información de la venta...
                </p>
            </div>
        );
    }

    const productos = sale.productos || [];

    const handleClose = () => {
        navigate("/dashboard/sales-management");
    };

    const handleGenerateReport = () => {
        setConfirmData({
            type: "info",
            title: "Imprimir venta",
            message: "¿Deseas imprimir el reporte de esta venta?",
            onConfirm: () => {
                const formatCurrency = (val) =>
                    val
                        ? `$${val.toLocaleString(
                            "es-CO"
                        )}`
                        : "$0";

                const tipoDocumento =
                    sale.clienteId?.documentType
                        ?.abbreviation ||
                    sale.clienteId?.documentType
                        ?.name ||
                    "";

                const numeroDoc =
                    sale.numeroDocumento ||
                    sale.clienteId
                        ?.documentNumber ||
                    "-";

                const docText =
                    tipoDocumento
                        ? `${tipoDocumento} ${numeroDoc}`
                        : numeroDoc;

                const extraInfo = [
                    `Cliente: ${sale.cliente || "-"}`,
                    `Documento: ${docText}`,
                    `Correo: ${sale.clienteId?.email || "-"}`,
                    `Fecha creación: ${sale.fecha}`,
                    `Estado: ${sale.estado}`,
                    `Tipo de Venta: ${sale.tipoVenta || "Contado"
                    }`
                ];

                if (sale.estado === "Anulado") {
                    extraInfo.push(
                        `Fecha Anulación: ${sale.anuladaEn
                            ? new Date(
                                sale.anuladaEn
                            ).toLocaleString(
                                "es-CO"
                            )
                            : sale.fecha ||
                            "N/A"
                        }`
                    );

                    extraInfo.push(
                        `Motivo Anulación: ${sale.observaciones ||
                        "Anulación registrada sin motivo."
                        }`
                    );
                }

                if (
                    sale.tipoVenta ===
                    "Credito" ||
                    sale.tipoVenta ===
                    "Crédito" ||
                    sale.tipoVenta ===
                    "Mixto"
                ) {
                    extraInfo.push(
                        `Plazo (Crédito): ${sale.diasPlazo != null
                            ? sale.diasPlazo
                            : 0
                        } días`
                    );

                    if (deadlineInfo) {
                        extraInfo.push(
                            `Fecha Límite Pago: ${deadlineInfo.fechaLimite}`
                        );
                    }
                }

                generatePDFReport({
                    title: `Reporte de la Venta #${String(
                        sale.numeroVenta || ""
                    ).padStart(2, "0")}`,

                    fileName: `venta_${String(
                        sale.numeroVenta || ""
                    ).padStart(2, "0")}.pdf`,

                    columns: [
                        "Producto",
                        "Precio",
                        "Cant.",
                        "Dev.",
                        "Neto",
                        "Subtotal"
                    ],

                    data: productosNetos.map(
                        (p) => [
                            p.nombre,
                            formatCurrency(
                                p.precio
                            ),
                            p.cantOriginal,
                            p.cantDevuelta > 0
                                ? `-${p.cantDevuelta}`
                                : "0",
                            p.cantNeta,
                            formatCurrency(
                                p.precio *
                                p.cantNeta
                            )
                        ]
                    ),
                    extraInfo,
                    totals: [
                        `Subtotal: ${formatCurrency(
                            totalesNetos.subtotal
                        )}`,

                        `IVA: ${formatCurrency(
                            totalesNetos.iva
                        )}`,

                        `Total: ${formatCurrency(
                            totalesNetos.total
                        )}`
                    ]
                });

                showToast("success", "Reporte generado correctamente.");
                setConfirmData(null);
            },
            onCancel: () =>
                setConfirmData(null)
        });
    };

    const getEstadoStyles = (estado) => {
        switch (estado) {
            case "Finalizado":
            case "Finalizadas":
            case "Finalizada":
                return {
                    container:
                        "bg-green-50 border-green-200",
                    text: "text-green-700",
                    dot: "bg-green-500"
                };

            case "Vigente":
                return {
                    container:
                        "bg-yellow-50 border-yellow-200",
                    text: "text-yellow-700",
                    dot: "bg-yellow-500"
                };

            case "Anulado":
                return {
                    container:
                        "bg-red-50 border-red-200",
                    text: "text-red-700",
                    dot: "bg-red-500"
                };

            case "Devuelto":
                return {
                    container:
                        "bg-gray-50 border-gray-200",
                    text: "text-gray-600",
                    dot: "bg-gray-500"
                };

            case "Devolución Parcial":
                return {
                    container:
                        "bg-amber-50 border-amber-200",
                    text: "text-amber-700",
                    dot: "bg-amber-500"
                };

            default:
                return {
                    container:
                        "bg-gray-50 border-gray-200",
                    text: "text-gray-600",
                    dot: "bg-gray-500"
                };
        }
    };

    const estadoStyles = getEstadoStyles(sale.estado);

    const isCredito =
        sale.tipoVenta === "Credito" ||
        sale.tipoVenta === "Crédito" ||
        sale.tipoVenta === "Mixto";

    return (
        <>
            <div className="bg-white p-4 md:p-6 flex flex-col w-full h-full overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto">

                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pb-5 border-b border-gray-300">
                        <div className="flex items-center gap-2 min-w-0">
                            <Receipt
                                size={22}
                                className="text-gray-700 shrink-0"
                            />

                            <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                                Ver información de la venta #
                                {String(
                                    sale.numeroVenta || ""
                                ).padStart(2, "0")}
                            </h2>

                            {loadingRefresh && (
                                <RefreshCw
                                    size={16}
                                    className="animate-spin text-yellow-500 shrink-0"
                                    title="Actualizando datos..."
                                />
                            )}
                        </div>

                        {/* BOTONES */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={
                                    handleGenerateReport
                                }
                                className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                            >
                                <FileText size={16} />
                                Imprimir
                            </button>

                            <button
                                onClick={handleClose}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </button>
                        </div>
                    </div>


                    {/* INFORMACIÓN GENERAL */}
                    <div className="py-6 border-b border-gray-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* INFORMACIÓN DE LA VENTA */}
                            <div className="pb-6 lg:pb-0 lg:pr-8 lg:border-r lg:border-gray-300">
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-5 flex items-center gap-2">
                                    <CalendarDays
                                        size={15}
                                    />
                                    Información de la Venta
                                </h3>

                                {/* FECHA */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                    <div>
                                        <p className="text-sm text-yellow-500 mb-1">
                                            Fecha de creación
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {sale.fecha || "-"}
                                        </p>
                                    </div>

                                    {/* TIPO */}
                                    <div>
                                        <p className="text-sm text-yellow-500 mb-1">
                                            Tipo de venta
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800 capitalize">
                                            {sale.tipoVenta || "Contado"}
                                        </p>
                                    </div>

                                    {/* ESTADO */}
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-yellow-500 mb-2">
                                            Estado actual
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${estadoStyles.container} ${estadoStyles.text}`}
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${estadoStyles.dot}`}
                                            />
                                            {sale.estado || "Sin estado"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* INFORMACIÓN DEL CLIENTE */}
                            <div className="pt-6 lg:pt-0 lg:pl-8">
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-5 flex items-center gap-2">
                                    <User size={15} />
                                    Información del Cliente
                                </h3>

                                {/* CLIENTE */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                    <div>
                                        <p className="text-sm text-yellow-500 mb-1">
                                            Cliente
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {sale.cliente || "Sin cliente"}
                                        </p>
                                    </div>

                                    {/* DOCUMENTO */}
                                    <div>
                                        <p className="text-sm text-yellow-500 mb-1">
                                            Documento
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {sale.clienteId?.documentType?.abbreviation ||
                                                sale.clienteId?.documentType?.name || ""}
                                            {" "}
                                            {sale.numeroDocumento ||
                                                sale.clienteId?.documentNumber || "-"}
                                        </p>
                                    </div>

                                    {/* CORREO */}
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-yellow-500 mb-1">
                                            Correo electrónico
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800 break-all">
                                            {sale.clienteId?.email || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFORMACIÓN DE CRÉDITO / ANULACIÓN */}

                    {(sale.estado === "Anulado" || isCredito) && (
                        <div className="py-6 border-b border-gray-300">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                                {/* ANULACIÓN */}
                                {sale.estado === "Anulado" && (
                                    <div className="lg:pr-8 lg:border-r lg:border-gray-300">
                                        <h3 className="text-sm font-bold uppercase text-red-500 mb-5 flex items-center gap-2">
                                            <AlertCircle
                                                size={15}
                                            />
                                            Información de Anulación
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <p className="text-sm text-red-500 mb-1">
                                                    Motivo
                                                </p>
                                                <p className="text-sm font-semibold text-red-700">
                                                    {sale.observaciones || "Anulación registrada sin motivo."}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-red-500 mb-1">
                                                    Fecha de anulación
                                                </p>
                                                <p className="text-sm font-semibold text-red-700">
                                                    {sale.anuladaEn
                                                        ? new Date(
                                                            sale.anuladaEn
                                                        ).toLocaleString(
                                                            "es-CO"
                                                        )
                                                        : sale.fecha ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CRÉDITO */}
                                {isCredito && (
                                    <div
                                        className={sale.estado === "Anulado" ? "lg:pl-0" : ""}
                                    >
                                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-5 flex items-center gap-2">
                                            <CreditCard
                                                size={15}
                                            />
                                            Información de Crédito
                                        </h3>

                                        {/* PLAZO */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <div>
                                                <p className="text-sm text-yellow-500 mb-1">
                                                    Plazo
                                                </p>
                                                <p className="text-sm font-semibold text-yellow-700">
                                                    {sale.diasPlazo != null ? sale.diasPlazo : 0}{" "}
                                                    días
                                                </p>
                                            </div>

                                            {/* FECHA LÍMITE */}
                                            {deadlineInfo && (
                                                <div>
                                                    <p className="text-sm text-blue-500 mb-1">
                                                        Fecha límite
                                                    </p>
                                                    <p className="text-sm font-semibold text-blue-700">
                                                        {deadlineInfo.fechaLimite}
                                                    </p>
                                                </div>
                                            )}

                                            {/* TIEMPO RESTANTE */}
                                            {deadlineInfo && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                        <Clock
                                                            size={13}
                                                        />
                                                        Tiempo restante
                                                    </p>
                                                    <p
                                                        className={`text-sm font-semibold ${deadlineInfo.diasRestantes < 0
                                                            ? "text-red-600" : deadlineInfo.diasRestantes <= 5
                                                                ? "text-orange-500" : "text-green-600"
                                                            }`}
                                                    >
                                                        {deadlineInfo.diasRestantes < 0
                                                            ? `Vencido hace ${Math.abs(deadlineInfo.diasRestantes)} días`
                                                            : deadlineInfo.diasRestantes === 0
                                                                ? "Vence hoy"
                                                                : `${deadlineInfo.diasRestantes} días restantes`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PRODUCTOS */}
                    <div className="pt-6">

                        {/* TÍTULO */}
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-300">
                            <Package
                                size={18}
                                className="text-yellow-500"
                            />
                            <h3 className="text-sm font-bold uppercase text-gray-700">
                                Productos de la venta
                            </h3>
                        </div>

                        {/* TABLA */}
                        {productos.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-190 w-full text-left text-sm">
                                    <thead className="text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-4 font-semibold">
                                                Producto
                                            </th>

                                            <th className="px-4 py-4 font-semibold text-center w-28">
                                                Cant. Original
                                            </th>

                                            <th className="px-4 py-4 font-semibold text-center w-24">
                                                Devuelto
                                            </th>

                                            <th className="px-4 py-4 font-semibold text-center w-24">
                                                Cant. Neta
                                            </th>

                                            <th className="px-4 py-4 font-semibold text-center w-32">
                                                Precio Unit.
                                            </th>

                                            <th className="px-4 py-4 font-semibold text-center w-32">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {productosNetos.map(
                                            (prod, index) => (
                                                <tr key={index}
                                                    className="hover:bg-gray-50 transition"
                                                >
                                                    <td className="px-4 py-4 font-medium text-gray-800">
                                                        {prod.nombre}
                                                    </td>

                                                    <td className="px-4 py-4 text-center text-gray-600">
                                                        {prod.cantOriginal}
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        {prod.cantDevuelta > 0 ? (
                                                            <span className="text-red-600 font-semibold">
                                                                - {prod.cantDevuelta}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                0
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-center text-gray-600">
                                                        {prod.cantNeta}
                                                    </td>

                                                    <td className="px-4 py-4 text-center text-gray-600">
                                                        ${prod.precio?.toLocaleString("es-CO")}
                                                    </td>

                                                    <td className="px-4 py-4 text-center font-semibold text-gray-800">
                                                        ${(prod.precio * prod.cantNeta).toLocaleString("es-CO")}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm border-b border-gray-100">
                                No hay productos registrados.
                            </div>
                        )}

                        {/* TOTALES */}
                        <div className="border-t border-gray-200 pt-5 mt-2">
                            <div className="flex flex-col items-end gap-2 text-sm">
                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        Subtotal:
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                        $ {totalesNetos.subtotal?.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        IVA (19%):
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                        $ {totalesNetos.iva?.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-8 min-w-65 pt-2 border-t border-gray-300">
                                    <span className="text-gray-700 uppercase font-bold">
                                        Total:
                                    </span>
                                    <span className="text-green-600 font-bold text-base">
                                        $ {totalesNetos.total?.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE IMPRESIÓN */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={
                        confirmData.onConfirm
                    }
                    onCancel={
                        confirmData.onCancel
                    }
                />
            )}
        </>
    );
}