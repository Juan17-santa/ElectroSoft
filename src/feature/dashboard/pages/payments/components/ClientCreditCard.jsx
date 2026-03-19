import { User, CreditCard, ChevronRight, AlertCircle } from "lucide-react";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

export default function ClientCreditCard({ cliente, onClick }) {
    const porcentajeOcupado = cliente.cupoCredito > 0
        ? Math.min((cliente.cupoOcupado / cliente.cupoCredito) * 100, 100)
        : 0;

    const isSuspendido = cliente.estado === false;
    const isAlerta = porcentajeOcupado >= 80 && !isSuspendido;

    return (
        <button
            onClick={onClick}
            className="w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 flex items-center gap-6 text-left group border border-transparent hover:border-yellow-300"
        >
            {/* Avatar */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0
                ${isSuspendido ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-500"}`}>
                {cliente.nombres?.charAt(0).toUpperCase()}
            </div>

            {/* Info cliente */}
            <div className="flex flex-col gap-0.5 w-52 shrink-0">
                <p className="font-semibold text-gray-800 text-sm">
                    {cliente.nombres} {cliente.apellidos}
                </p>
                <p className="text-xs text-gray-500">
                    {cliente.tipoDocumento} {cliente.documento}
                </p>
                {isSuspendido && (
                    <div className="flex items-center gap-1 mt-1">
                        <AlertCircle size={12} className="text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Cliente suspendido</span>
                    </div>
                )}
            </div>

            {/* Cupo crédito */}
            <div className="flex flex-col gap-0.5 w-36 shrink-0">
                <p className="text-xs text-gray-400">Cupo total</p>
                <p className="text-sm font-semibold text-gray-800">{fmt(cliente.cupoCredito)}</p>
            </div>

            {/* Cupo ocupado */}
            <div className="flex flex-col gap-0.5 w-36 shrink-0">
                <p className="text-xs text-gray-400">Cupo ocupado</p>
                <p className={`text-sm font-semibold ${isAlerta ? "text-red-500" : "text-gray-800"}`}>
                    {fmt(cliente.cupoOcupado)}
                </p>
            </div>

            {/* Cupo disponible */}
            <div className="flex flex-col gap-0.5 w-36 shrink-0">
                <p className="text-xs text-gray-400">Cupo disponible</p>
                <p className={`text-sm font-semibold ${cliente.cupoDisponible === 0 ? "text-red-500" : "text-green-600"}`}>
                    {fmt(cliente.cupoDisponible)}
                </p>
            </div>

            {/* Barra de uso */}
            <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>Uso del cupo</span>
                    <span>{porcentajeOcupado.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            isSuspendido       ? "bg-red-400"    :
                            porcentajeOcupado >= 80 ? "bg-orange-400" :
                            porcentajeOcupado >= 50 ? "bg-yellow-400" :
                                                 "bg-green-400"
                        }`}
                        style={{ width: `${porcentajeOcupado}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400">
                    {cliente.totalVentas} venta{cliente.totalVentas !== 1 ? "s" : ""} pendiente{cliente.totalVentas !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Flecha */}
            <ChevronRight size={20} className="text-gray-300 group-hover:text-yellow-400 transition shrink-0" />
        </button>
    );
}