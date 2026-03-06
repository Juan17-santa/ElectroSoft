import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X, Package, Calendar as CalendarIcon, User, CreditCard } from "lucide-react";

export default function OrderDetails() {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtenemos el pedido desde el estado de la navegación
    const orderDetail = location.state?.order;
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (orderDetail) {
            setOrder(orderDetail);
        }
    }, [orderDetail]);

    // Formateador de moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (!order) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">No hay información del pedido para mostrar.</p>
            </div>
        );
    }

    const handleBack = () => navigate("/dashboard/orders");

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner min-h-full">

            <div className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden flex-1"
                style={{
                    backgroundImage: 'url("/background-shopping-details.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}>
                <div className="absolute inset-0 bg-white/40 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">
                    {/* ENCABEZADO */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info size={22} className="text-gray-700" />
                            <h2 className="text-xl font-semibold text-gray-800">Detalle del Pedido #{order.id}</h2>
                        </div>
                        <div
                            className={`px-5 py-1.5 rounded-full text-sm font-bold shadow-sm 
                                ${order.estado === 'Pendiente' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            }`}>
                            {order.estado}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* COLUMNA IZQUIERDA: INFO GENERAL */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2">
                                    <User size={14} /> Datos del Cliente
                                </h3>
                                <p className="text-sm text-yellow-500 font-medium">Nombre</p>
                                <p className="text-base font-semibold text-gray-800 mb-3">{order.nombres}</p>

                                <p className="text-sm text-yellow-500 font-medium">Documento</p>
                                <p className="text-base font-semibold text-gray-800">{order.documento}</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 flex items-center gap-2">
                                    <CalendarIcon size={14} /> Fechas y Pago
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-yellow-500">Fecha Pedido</p>
                                        <p className="text-sm font-semibold text-gray-800">{order.fechaPedido}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-yellow-500">Tipo de Pago</p>
                                        <p className="text-sm font-semibold text-gray-800">{order.formaPago}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: TABLA DE PRODUCTOS */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <Package size={18} className="text-yellow-500" />
                                <span className="font-bold text-gray-700 text-sm uppercase">Artículos del Pedido</span>
                            </div>

                            <div className="overflow-auto max-h-75">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Producto</th>
                                            <th className="px-4 py-3 font-semibold text-center">Cant.</th>
                                            <th className="px-4 py-3 font-semibold text-right">Precio Unit.</th>
                                            <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {order.productos?.map((prod, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-800">{prod.nombre}</td>
                                                <td className="px-4 py-3 text-center">{prod.cantidad}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(prod.precio)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(prod.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOTALES AL PIE DE LA TABLA */}
                            <div className="mt-auto bg-yellow-50 p-6 border-t border-yellow-100">
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex justify-between w-48 text-sm">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between w-48 text-sm">
                                        <span className="text-gray-500">IVA (19%):</span>
                                        <span className="font-semibold text-blue-600">{formatCurrency(order.iva)}</span>
                                    </div>
                                    <div className="flex justify-between w-56 text-lg border-t border-yellow-200 pt-2 mt-2">
                                        <span className="font-bold text-gray-700">Total:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* BOTÓN VOLVER */}
            <div className="flex justify-end">
                <button
                    onClick={handleBack}
                    className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-300 px-8 py-2.5 rounded-xl text-sm font-bold shadow flex items-center gap-2 cursor-pointer border border-yellow-100"
                >
                    <X size={18} />
                    Cerrar Detalle
                </button>
            </div>
        </div>
    );
}