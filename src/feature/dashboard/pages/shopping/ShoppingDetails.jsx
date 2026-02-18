import { Info } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCOP} from "../shopping/helpers/shoppingHelpers";

const ITEMS_PER_PAGE = 3;

export default function ShoppingDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);

    // Buscar la compra en localStorage por id
    const stored = localStorage.getItem("compras");
    const compras = stored ? JSON.parse(stored) : [];
    const compra = compras.find((c) => String(c.id) === String(id));

    // Si no se encuentra la compra
    if (!compra) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner items-center justify-center">
                <p className="text-gray-500 text-sm">No se encontró la compra solicitada.</p>
                <button
                    onClick={() => navigate("/dashboard/shopping")}
                    className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    Volver
                </button>
            </div>
        );
    }

    const productos = compra.productos || [];

    // Paginación
    const totalPages = Math.max(1, Math.ceil(productos.length / ITEMS_PER_PAGE));
    const paginaActual = Math.min(currentPage, totalPages);
    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">

                {/* CONTENEDOR PRINCIPAL */}
                <div
                    className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden min-h-[584px]"
                    style={{
                        backgroundImage: 'url("/background-shopping-details.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Capa de transparencia para la img */}
                    <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                    <div className="relative z-10 flex flex-col gap-6">

                        {/* TÍTULO */}
                        <div className="flex items-center gap-2">
                            <Info size={22} className="text-gray-800" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Ver Información de Compra
                            </h2>
                        </div>

                        {/* CONTENEDOR BLANCO */}
                        <div className="bg-gray-50 rounded-2xl p-6 shadow-md">

                            {/* TABLA */}
                            <div>
                                <h3 className="text-base font-semibold mb-4 text-gray-800">
                                    Tabla de productos de la Compra
                                </h3>

                                <div className="p-0.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-white">
                                    <div className="bg-gray-100 rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-200">
                                                <tr className="text-left border-b border-gray-300">
                                                    <th className="px-4 py-2 font-semibold">#</th>
                                                    <th className="px-4 py-2 font-semibold">Nombre</th>
                                                    <th className="px-4 py-2 font-semibold">Cantidad</th>
                                                    <th className="px-4 py-2 font-semibold text-center">Precio unitario</th>
                                                    <th className="px-4 py-2 font-semibold text-center">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white text-gray-700">
                                                {productosPagina.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                                            Sin productos registrados.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    productosPagina.map((producto, index) => (
                                                        <tr key={producto.id ?? index}>
                                                            <td className="px-4 py-1 border-b border-gray-300">
                                                                {String((paginaActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                                            </td>
                                                            <td className="px-4 py-1 border-b border-gray-300">{producto.nombre}</td>
                                                            <td className="px-4 py-1 border-b border-gray-300">{producto.cantidad}</td>
                                                            <td className="px-4 py-1 border-b border-gray-300 text-center">
                                                                {formatCOP(producto.precio)}
                                                            </td>
                                                            <td className="px-4 py-1 border-b border-gray-300 text-center">
                                                                {formatCOP(producto.subtotal)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* PAGINADOR — solo si hay más de 3 productos */}
                                {totalPages > 1 && (
                                    <div className="flex justify-end mt-3">
                                        <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={paginaActual === 1}
                                                className="p-1.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                                            >
                                                ←
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1 rounded-md font-medium transition ${
                                                        page === paginaActual
                                                            ? "bg-yellow-400 text-black shadow-sm"
                                                            : "hover:bg-gray-300"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={paginaActual === totalPages}
                                                className="p-1.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-40"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* INFORMACIÓN DE LA COMPRA */}
                            <div className="grid grid-cols-2 gap-6 mt-6">

                                {/* COLUMNA IZQUIERDA */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">Fecha Factura</p>
                                        <p className="text-sm font-semibold text-gray-800">{compra.fechaCompra}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">Proveedor</p>
                                        <p className="text-sm font-semibold text-gray-800">{compra.proveedor}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">Total a pagar</p>
                                        <p className="text-lg font-bold text-gray-800">{compra.total}</p>
                                    </div>
                                </div>

                                {/* COLUMNA DERECHA */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">Número de factura</p>
                                        <p className="text-sm font-semibold text-gray-800">{compra.numeroFactura}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-yellow-400 mb-1">Estado</p>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                compra.estado === "Activo"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {compra.estado}
                                        </span>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>

                {/* BOTÓN */}
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate("/dashboard/shopping")}
                        className="bg-linear-to-r from-white to-yellow-300 hover:shadow-lg transition duration-500 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                    >
                        Volver
                    </button>
                </div>

            </div>
        </>
    );
}