import { User, CreditCard, ChevronRight, AlertCircle, CheckCircle, Clock } from "lucide-react";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

// ✅ Deriva el estado de pago a partir de los datos del cliente
const getEstadoPago = (cliente) => {
    if (cliente.estado === false) {
        return {
            label: "Suspendido",
            color: "bg-red-100 text-red-600",
            dot: "bg-red-500",
        };
    }
    if (cliente.cupoOcupado > 0) {
        return {
            label: "Por pagar",
            color: "bg-yellow-100 text-yellow-700",
            dot: "bg-yellow-400",
        };
    }
    return {
        label: "Al día",
        color: "bg-green-100 text-green-700",
        dot: "bg-green-500",
    };
};

export default function ClientCreditCard({ cliente, onClick }) {
    const porcentajeOcupado = cliente.cupoCredito > 0
        ? Math.min((cliente.cupoOcupado / cliente.cupoCredito) * 100, 100)
        : 0;

    const isSuspendido = cliente.estado === false;
    const isAlerta = porcentajeOcupado >= 80 && !isSuspendido;
    const estadoPago = getEstadoPago(cliente);

    return (
        <button
            onClick={onClick}
            className="w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 text-left group border border-transparent hover:border-yellow-300 overflow-x-auto"
        >
            <div className="flex items-center gap-6 min-w-max">
                {/* FILA 1 EN MÓVIL: Avatar + Info */}
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0
                    ${isSuspendido ? "bg-red-100 text-red-500" : "bg-yellow-100 text-yellow-500"}`}>
                        {cliente.nombres?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1 md:w-48 shrink-0">
                        <p className="font-semibold text-gray-800 text-sm">
                            {cliente.nombres} {cliente.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">
                            {cliente.tipoDocumento} {cliente.documento}
                        </p>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit mt-0.5 ${estadoPago.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estadoPago.dot}`} />
                            <span className="text-xs font-semibold">{estadoPago.label}</span>
                        </div>
                    </div>
                </div>

                {/* CUPOS + BARRA */}
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex flex-col gap-0.5 w-36 shrink-0">
                        <p className="text-xs text-gray-400">Cupo total</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt(cliente.cupoCredito)}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 w-36 shrink-0">
                        <p className="text-xs text-gray-400">Cupo ocupado</p>
                        <p className={`text-sm font-semibold ${isAlerta ? "text-red-500" : "text-gray-800"}`}>
                            {fmt(cliente.cupoOcupado)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-0.5 w-36 shrink-0">
                        <p className="text-xs text-gray-400">Cupo disponible</p>
                        <p className={`text-sm font-semibold ${cliente.cupoDisponible === 0 ? "text-red-500" : "text-green-600"}`}>
                            {fmt(cliente.cupoDisponible)}
                        </p>
                    </div>

                    {/* BARRA */}
                    <div className="flex flex-col gap-1 flex-1 min-w-32">
                        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>Uso del cupo</span>
                            <span>{porcentajeOcupado.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isSuspendido ? "bg-red-400" :
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
                </div>

                {/* Flecha */}
                <ChevronRight size={20} className="text-gray-300 group-hover:text-yellow-400 transition shrink-0" />
            </div>
        </button>
    );
}