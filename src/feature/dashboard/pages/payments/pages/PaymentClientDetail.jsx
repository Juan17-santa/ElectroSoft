import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, FileDown } from "lucide-react";
import paymentsService from "../services/paymentsService";
import VentaCreditoCard from "../components/VentaCreditoCard";
import { generarReporteCliente } from "../hooks/reportesPayments";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

export default function PaymentClientDetail() {
    const navigate      = useNavigate();
    const { documento } = useParams();
    const [resumen, setResumen] = useState(null);
    const [ventas,  setVentas]  = useState([]);

    const cargarDatos = () => {
        paymentsService.checkAndExpireOverdue();
        setResumen(paymentsService.getResumenCliente(documento));
        setVentas(paymentsService.getVentasCredito(documento));
    };

    useEffect(() => {
        cargarDatos();
    }, [documento]);

    // ✅ Escucha cambios de abonos y se actualiza en tiempo real
    useEffect(() => {
        window.addEventListener("payments-updated", cargarDatos);
        return () => window.removeEventListener("payments-updated", cargarDatos);
    }, [documento]);

    if (!resumen) return (
        <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
            <p className="text-gray-500 text-sm">Cliente no encontrado.</p>
        </div>
    );

    const isSuspendido = resumen.estado === false;
    const porcentaje   = resumen.cupoCredito > 0
        ? Math.min((resumen.cupoOcupado / resumen.cupoCredito) * 100, 100)
        : 0;

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard/payments")}
                        className="p-2 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <p className="text-xl font-semibold">
                        Cuenta de <span className="text-yellow-500">crédito</span>
                    </p>
                </div>

                <button
                    onClick={() => generarReporteCliente(resumen, ventas)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-sm font-medium text-yellow-600 shadow-sm transition cursor-pointer"
                >
                    <FileDown size={16} />
                    Descargar estado de cuenta
                </button>
            </div>

            {/* Card resumen cliente — compacto */}
            <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">

                {/* Fila superior: avatar + datos + estado */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0
                        ${isSuspendido ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-500"}`}>
                        {resumen.nombres?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                            {resumen.nombres} {resumen.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">
                            {resumen.tipoDocumento} {resumen.documento} · {resumen.email}
                        </p>
                    </div>
                    {isSuspendido && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-full">
                            <AlertCircle size={13} className="text-red-500" />
                            <span className="text-xs text-red-600 font-semibold">Suspendido</span>
                        </div>
                    )}
                </div>

                {/* Fila cupos — compacta en línea */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
                        <p className="text-xs text-gray-400">Cupo total</p>
                        <p className="text-sm font-bold text-gray-800">{fmt(resumen.cupoCredito)}</p>
                    </div>
                    <div className="flex-1 bg-orange-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
                        <p className="text-xs text-gray-400">Cupo ocupado</p>
                        <p className="text-sm font-bold text-orange-500">{fmt(resumen.cupoOcupado)}</p>
                    </div>
                    <div className={`flex-1 rounded-xl px-4 py-2.5 flex justify-between items-center ${
                        resumen.cupoDisponible === 0 ? "bg-red-50" : "bg-green-50"
                    }`}>
                        <p className="text-xs text-gray-400">Cupo disponible</p>
                        <p className={`text-sm font-bold ${
                            resumen.cupoDisponible === 0 ? "text-red-500" : "text-green-600"
                        }`}>{fmt(resumen.cupoDisponible)}</p>
                    </div>
                </div>

                {/* Barra uso cupo */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Uso del cupo</span>
                        <span>{porcentaje.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isSuspendido     ? "bg-red-400"    :
                                porcentaje >= 80 ? "bg-orange-400" :
                                porcentaje >= 50 ? "bg-yellow-400" :
                                                   "bg-green-400"
                            }`}
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Ventas a crédito */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ventas a crédito pendientes — {ventas.length}
                </p>

                {ventas.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-md">
                        Este cliente no tiene ventas a crédito pendientes.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {ventas.map(venta => (
                            <VentaCreditoCard
                                key={`${venta.fuente}-${venta.id}`}
                                venta={venta}
                                onDetalle={() => navigate(
                                    `/dashboard/payments/detail/${venta.id}`,
                                    { state: { payment: venta, documento } }
                                )}
                                onAbonar={() => navigate(
                                    `/dashboard/payments/create/${venta.id}`,
                                    { state: { venta, documento } }
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}