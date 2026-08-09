import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ArrowLeft } from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function ClientDetailsPage() {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("clientToView");
        if (data) setClient(JSON.parse(data));
    }, []);

    if (!client) return null;

    const handleClose = () => {
        localStorage.removeItem("clientToView");
        navigate("/dashboard/clients");
    };

    return (
        <>
            <div
                className="p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative overflow-auto"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Capa de transparencia */}
                <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>

                {/* TÍTULO */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={22} className="text-gray-800" />
                        <h2 className="text-xl font-semibold text-gray-800">Ver información del cliente</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">

                    {/* HEADER */}
                    <div className="border-b border-gray-200 pb-5 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 break-all">
                                    {client.nombres} {client.apellidos}
                                </h3>
                                <p className="text-gray-500 mt-1 text-sm">{client.email}</p>
                            </div>

                            <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm w-20 ${client.estado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {client.estado ? "ACTIVO" : "INACTIVO"}
                            </span>
                        </div>
                    </div>

                    {/* INFO PERSONAL */}
                    <h4 className="text-sm font-bold text-gray-600 mb-3 tracking-wide uppercase">
                        Información personal
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400">Tipo documento</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {client.tipoDocumento} ({client.abreviacion})
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400">Número</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {client.documento}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400">Teléfono</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {client.telefono}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400">Fecha creación</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {client.fechaCreacion || new Date().toISOString().split("T")[0]}
                            </p>
                        </div>
                    </div>

                    {/* INFO FINANCIERA */}
                    <h4 className="text-sm font-bold text-gray-600 mb-3 tracking-wide uppercase">
                        Información financiera
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Total Compras</p>
                            <p className="text-lg font-bold text-gray-800">
                                ${client.totalCompras?.toLocaleString("es-CO") || "0"}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Cupo Asignado</p>
                            <p className="text-lg font-bold text-gray-800">
                                ${client.cupoTotal?.toLocaleString("es-CO") || "0"}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
        </>
    );
}
