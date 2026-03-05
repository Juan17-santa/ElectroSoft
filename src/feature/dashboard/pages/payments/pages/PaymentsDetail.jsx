import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info, X } from "lucide-react";
import paymentsService from "../services/PaymentsService";

export default function PaymentDetail() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [sale, setSale] = useState(null);

    useEffect(() => {
        const foundSale = paymentsService.getById(id);
        setSale(foundSale);
    }, [id]);

    if (!sale) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">
                    No hay información para mostrar.
                </p>
            </div>
        );
    }

    const handleBack = () => {
        navigate("/dashboard/payments");
    };

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl h-full"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    {/* Título */}
                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">
                            Detalle de Venta
                        </h2>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-16 shadow-xl max-w-4xl w-full mx-auto min-h-112.5">

                        {/* Estado */}
                        <div className="flex justify-between">
                            <h3 className="text-sm font-bold uppercase text-gray-500 py-2">
                                Información General
                            </h3>

                            <div
                                className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md
                                ${sale.estado
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {sale.estado ? "Pendiente" : "Finalizado"}
                            </div>
                        </div>

                        {/* Datos */}
                        <div className="flex flex-wrap gap-20">

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Cliente</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {sale.cliente}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Número Venta</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {sale.numeroVenta}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Total</p>
                                <p className="text-m font-semibold text-gray-800">
                                    ${sale.total?.toLocaleString()}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Saldo Pendiente</p>
                                <p className="text-m font-semibold text-red-600">
                                    ${sale.saldoPendiente?.toLocaleString()}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Fecha</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {sale.fecha}
                                </p>
                            </div>

                            <div className="min-w-72">
                                <p className="text-sm text-yellow-400 mb-1">Fecha Límite</p>
                                <p className="text-m font-semibold text-gray-800">
                                    {sale.fechaLimite}
                                </p>
                            </div>

                        </div>

                        {/* Historial de Abonos */}
                        <div className="mt-12">
                            <h3 className="text-md font-semibold mb-4">
                                Historial de Abonos
                            </h3>

                            <table className="w-full text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2 text-left">Fecha</th>
                                        <th className="p-2 text-left">Método</th>
                                        <th className="p-2 text-left">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.abonos && sale.abonos.length > 0 ? (
                                        sale.abonos.map((abono) => (
                                            <tr key={abono.id} className="border-b">
                                                <td className="p-2">{abono.date}</td>
                                                <td className="p-2">{abono.paymentMethod}</td>
                                                <td className="p-2">
                                                    ${Number(abono.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-gray-500">
                                                No hay abonos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>

            {/* Botón */}
            <div className="flex justify-end">
                <button
                    onClick={handleBack}
                    className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    <X size={18} className="inline-block mr-2" />
                    Volver
                </button>
            </div>

        </div>
    );
}