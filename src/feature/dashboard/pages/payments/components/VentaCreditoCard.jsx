import { FileText, Eye, Plus, AlertCircle, ChevronRight } from "lucide-react";
import { Restricted } from "../../../components/ui/Restricted";


const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

export default function VentaCreditoCard({ venta, onDetalle, onAbonar }) {
    const isVencida = venta.estado === "Anulada";
    const isFinalizado = venta.estado === "Finalizado";
    const isPedido = venta.fuente === "pedido";

    const porcentajePagado = venta.total > 0
        ? Math.min(((venta.montoPagado || 0) / venta.total) * 100, 100)
        : 0;

    return (
        <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 flex items-center gap-4 overflow-x-auto border border-transparent ${isVencida ? "border-l-4 border-l-red-400" :
            isFinalizado ? "border-l-4 border-l-green-400" :
                "border-l-4 border-l-yellow-400"
            }`}>
            <div className="flex items-center gap-4 min-w-max w-full">
                {/* Ícono */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isVencida ? "bg-red-100" :
                    isFinalizado ? "bg-green-100" :
                        "bg-yellow-100"
                    }`}>
                    <FileText size={18} className={
                        isVencida ? "text-red-500" :
                            isFinalizado ? "text-green-500" :
                                "text-yellow-500"
                    } />
                </div>

                {/* Número venta + badge */}
                <div className="flex flex-col gap-0.5 w-44 shrink-0">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">
                            {venta.numeroVenta || `V-${venta.id}`}
                        </p>
                        {isPedido && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                Pedido
                            </span>
                        )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${isVencida ? "bg-red-100 text-red-600" :
                        isFinalizado ? "bg-green-100 text-green-600" :
                            "bg-yellow-100 text-yellow-700"
                        }`}>
                        {isVencida ? "Vencida" : isFinalizado ? "Finalizado" : "Pendiente"}
                    </span>
                </div>

                {/* Tipo */}
                <div className="flex flex-col gap-0.5 w-20 shrink-0">
                    <p className="text-xs text-gray-400">Tipo</p>
                    <p className="text-sm font-semibold text-gray-800">{venta.tipoVenta || "Crédito"}</p>
                </div>

                {/* Total */}
                <div className="flex flex-col gap-0.5 w-28 shrink-0">
                    <p className="text-xs text-gray-400">Total venta</p>
                    <p className="text-sm font-semibold text-gray-800">{fmt(venta.total)}</p>
                </div>

                {/* Pagado */}
                <div className="flex flex-col gap-0.5 w-28 shrink-0">
                    <p className="text-xs text-gray-400">Pagado</p>
                    <p className="text-sm font-semibold text-green-600">{fmt(venta.montoPagado || 0)}</p>
                </div>

                {/* Saldo */}
                <div className="flex flex-col gap-0.5 w-28 shrink-0">
                    <p className="text-xs text-gray-400">Saldo pendiente</p>
                    <p className={`text-sm font-semibold ${isVencida ? "text-red-600" : "text-red-500"}`}>
                        {fmt(venta.montoPorPagar)}
                    </p>
                </div>

                {/* Fechas */}
                <div className="flex flex-col gap-0.5 w-24 shrink-0">
                    <p className="text-xs text-gray-400">Fecha</p>
                    <p className="text-xs text-gray-700">{venta.fecha || "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">Límite</p>
                    <p className={`text-xs ${isVencida ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                        {venta.fechaLimite || "—"}
                    </p>
                </div>

                {/* Barra progreso + aviso */}
                <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-400 mb-0.5">
                        <span>{porcentajePagado.toFixed(0)}% pagado</span>
                        <span>{(venta.abonos || []).length} abono{(venta.abonos || []).length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isVencida ? "bg-red-400" : "bg-green-400"
                                }`}
                            style={{ width: `${porcentajePagado}%` }}
                        />
                    </div>
                    {isVencida && (
                        <div className="flex items-center gap-1 mt-1">
                            <AlertCircle size={11} className="text-red-500 shrink-0" />
                            <p className="text-xs text-red-500">Venta vencida — crédito suspendido</p>
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-2 shrink-0">
                    <Restricted scope="Pagos y abonos" action="Ver">
                        <button
                            onClick={onDetalle}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-medium transition cursor-pointer"
                        >
                            <Eye size={13} />
                            Detalle
                        </button>
                    </Restricted>
                    {!isFinalizado && (
                        <Restricted scope="Pagos y abonos" action="Abonar">
                            <button
                                onClick={onAbonar}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-xs font-medium transition cursor-pointer"
                            >
                                <Plus size={13} />
                                Abonar
                            </button>
                        </Restricted>
                    )}
                </div>
            </div>


        </div>
    );
}