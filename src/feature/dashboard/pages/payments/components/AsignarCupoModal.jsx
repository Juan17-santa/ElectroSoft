import { useState } from "react";
import { X, CreditCard, User } from "lucide-react";

const fmt = (val) => new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0
}).format(val ?? 0);

export default function AsignarCupoModal({ clientes, onAsignar, onClose }) {
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [cupo, setCupo] = useState("");
    const [error, setError] = useState("");

    const handleCupoChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setCupo(raw);
        setError("");
    };

    const handleAsignar = () => {
        if (!clienteSeleccionado) {
            setError("Selecciona un cliente.");
            return;
        }
        const monto = Number(cupo);
        if (!monto || monto <= 0) {
            setError("Ingresa un cupo válido mayor a 0.");
            return;
        }
        onAsignar(clienteSeleccionado, monto);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-yellow-500 font-semibold">
                        <CreditCard size={18} />
                        <span>Asignar cupo de crédito</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <p className="text-xs text-gray-400 -mt-2">
                    Temporal — cuando el módulo de Clientes implemente este campo, elimina este modal.
                </p>

                {/* Lista de clientes */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {clientes.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">
                            No hay clientes activos con ventas a crédito sin cupo asignado.
                        </p>
                    ) : (
                        clientes.map(c => (
                            <button
                                key={c.id}
                                onClick={() => { setClienteSeleccionado(c); setError(""); }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left cursor-pointer
                                    ${clienteSeleccionado?.id === c.id
                                        ? "border-yellow-400 bg-yellow-50"
                                        : "border-gray-100 hover:border-yellow-200 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center font-bold text-sm shrink-0">
                                    {c.nombres?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {c.nombres} {c.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {c.tipoDocumento} {c.documento}
                                    </p>
                                </div>
                                {clienteSeleccionado?.id === c.id && (
                                    <span className="ml-auto text-xs text-yellow-500 font-semibold">
                                        Seleccionado
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Input cupo */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Monto del cupo *
                    </label>
                    <input
                        type="text"
                        value={cupo ? new Intl.NumberFormat("es-CO").format(Number(cupo)) : ""}
                        onChange={handleCupoChange}
                        placeholder="Ej: 2.000.000"
                        disabled={!clienteSeleccionado}
                        className="bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    />
                    {clienteSeleccionado && cupo && (
                        <p className="text-xs text-gray-400">
                            Cupo a asignar: <span className="font-semibold text-gray-700">
                                {fmt(Number(cupo))}
                            </span>
                        </p>
                    )}
                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium transition cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAsignar}
                        disabled={!clienteSeleccionado || !cupo}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Asignar cupo
                    </button>
                </div>
            </div>
        </div>
    );
}