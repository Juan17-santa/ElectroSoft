import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";

export default function ClientDetailsPage() {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);

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
                className="p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner relative overflow-hidden"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Capa de transparencia */}
                <div className="absolute inset-0 bg-white/55 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-6 h-full">

                    {/* CONTENEDOR PRINCIPAL */}
                    <div className="relative bg-white/80 rounded-3xl p-6 shadow-lg flex-1 flex flex-col gap-6">

                        {/* TÍTULO */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info size={22} className="text-gray-800" />
                                <h2 className="text-xl font-semibold text-gray-800">Detalles del Cliente</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 bg-white/80 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* TARJETA DE INFORMACIÓN */}
                        <div className="bg-gray-50 rounded-2xl p-6 shadow-md">

                            {/* NOMBRE DESTACADO */}
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {client.nombres} {client.apellidos}
                                </h3>
                                <p className="text-gray-500 mt-1 text-sm">{client.email}</p>
                            </div>

                            {/* GRID DE DATOS */}
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Tipo de documento</p>
                                    <p className="text-sm font-semibold text-gray-800">{client.tipoDocumento}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Número de documento</p>
                                    <p className="text-sm font-semibold text-gray-800">{client.documento}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Teléfono</p>
                                    <p className="text-sm font-semibold text-gray-800">{client.telefono}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Fecha de Creación</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {client.fechaCreacion || new Date().toISOString().split("T")[0]}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Total Compras</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        ${client.totalCompras?.toLocaleString("es-CO") || "0"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* FIN CONTENEDOR PRINCIPAL */}

                    {/* BOTÓN VOLVER */}
                    <div className="flex justify-end mt-auto">
                        <button
                            onClick={handleClose}
                            className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
