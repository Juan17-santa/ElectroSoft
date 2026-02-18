/**
 * ClientDetailsPage.jsx
 * 
 * Vista de detalles de un cliente.
 * Muestra la información completa del cliente en una tarjeta blanca centrada.
 * Fondo con imagen (reemplazar la URL por la imagen deseada del proyecto).
 * 
 * Campos mostrados:
 * - Tipo de documento / Número de documento
 * - Nombre Completo / Teléfono
 * - Email
 * - Total Compras / Fecha Creación
 * 
 * Navegación: Se accede desde Clients (icono ojo).
 * Los datos se leen de localStorage (clave "clientToView").
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ClientDetailsPage() {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);

    /** Lee los datos del cliente desde localStorage al montar el componente */
    useEffect(() => {
        const data = localStorage.getItem("clientToView");
        if (data) {
            setClient(JSON.parse(data));
        }
    }, []);

    if (!client) return null;

    /** Cierra la vista y regresa a la lista de clientes */
    const handleClose = () => {
        localStorage.removeItem("clientToView");
        navigate("/dashboard/clients");
    };

    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl flex items-center justify-center p-8 bg-gray-100">

            {/* 
               FONDO CON IMAGEN 
               Nota: Reemplaza '/assets/bg-clientes.png' con la ruta real de tu imagen.
               Si la imagen está en public, usa '/nombre-imagen.jpg'.
               Si está en src/assets, importa la imagen arriba y úsala aquí.
            */}
            <div
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: "url('/assets/bg-clientes.png')" }}
            ></div>

            {/* CONTENIDO CENTRADO */}
            <div className="relative z-10 w-full max-w-2xl">

                {/* Header: Título + botón X */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Detalles del Cliente</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tarjeta de información */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/50 p-8">

                    {/* Nombre del cliente destacado */}
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-3xl font-bold text-gray-800">
                            {client.nombres} {client.apellidos}
                        </h3>
                        <p className="text-gray-500 mt-1">{client.email}</p>
                    </div>

                    {/* Grid de información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Tipo de documento</p>
                            <p className="text-lg font-semibold text-gray-800">{client.tipoDocumento}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Número de documento</p>
                            <p className="text-lg font-semibold text-gray-800">{client.documento}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Teléfono</p>
                            <p className="text-lg font-semibold text-gray-800">{client.telefono}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Fecha de Creación</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {client.fechaCreacion || new Date().toISOString().split('T')[0]}
                            </p>
                        </div>

                    </div>

                    {/* Total Compras destacado */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Total Compras</span>
                            <span className="text-3xl font-bold text-yellow-600">
                                ${client.totalCompras?.toLocaleString('es-CO') || '0'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
