import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCOP } from "../shopping/helpers/shoppingHelpers";
import { ServicesShopping } from "../shopping/services/ServicesShopping";
import Pagination from "../../components/ui/Pagination";
import { ArrowLeft } from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function ShoppingDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [compra, setCompra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        setLoading(true);
        setError("");

        ServicesShopping.fetchById(id)
            .then((data) => {
                if (mounted) setCompra(data);
            })
            .catch((err) => {
                if (mounted) {
                    setError(err.message || "No se pudo cargar la compra.");
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading && !compra) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
                <svg
                    className="animate-spin h-6 w-6 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                </svg>

                <p className="text-gray-500 text-sm font-medium">
                    Cargando compra...
                </p>
            </div>
        );
    }

    if (!compra) {
        return (
            <div className="bg-white p-6 flex flex-col gap-6 h-full items-center justify-center">
                <p className="text-gray-500 text-sm">
                    {error || "No se encontro la compra solicitada."}
                </p>

                <button
                    onClick={() => navigate("/dashboard/shopping")}
                    className="bg-white border border-gray-200 hover:bg-gray-50 px-6 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition cursor-pointer"
                >
                    Volver
                </button>
            </div>
        );
    }

    const productos = compra.productos || [];

    const totalPages = Math.max(
        1,
        Math.ceil(productos.length / ITEMS_PER_PAGE)
    );

    const paginaActual = Math.min(currentPage, totalPages);

    const productosPagina = productos.slice(
        (paginaActual - 1) * ITEMS_PER_PAGE,
        paginaActual * ITEMS_PER_PAGE
    );

    return (
        <>
            {/* CONTENEDOR PRINCIPAL */}
            <div className="bg-white p-4 md:p-6 flex flex-col w-full min-h-full overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto">

                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pb-5 border-b border-gray-300">

                        <div className="flex items-center gap-2 min-w-0">
                            <Info
                                size={22}
                                className="text-gray-700 shrink-0"
                            />

                            <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                                Ver Información de Compra
                            </h2>
                        </div>

                        {/* BOTÓN VOLVER */}
                        <button
                            onClick={() => navigate("/dashboard/shopping")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>

                    {/* INFORMACIÓN DE LA COMPRA */}
                    <div className="py-6 border-b border-gray-300">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5 px-2">

                            {/* FACTURA */}
                            <div>
                                <p className="text-sm text-yellow-500 mb-1">
                                    Número de Factura
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {compra.numeroFactura}
                                </p>
                            </div>

                            {/* FECHA */}
                            <div>
                                <p className="text-sm text-yellow-500 mb-1">
                                    Fecha Factura
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {compra.fechaCompra}
                                </p>
                            </div>

                            {/* PROVEEDOR */}
                            <div>
                                <p className="text-sm text-yellow-500 mb-1">
                                    Proveedor
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {compra.proveedor}
                                </p>
                            </div>

                            {/* ESTADO */}
                            <div>
                                <p className="text-sm text-yellow-500 mb-1">
                                    Estado
                                </p>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${compra.estado === "Completada"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {compra.estado}
                                </span>
                            </div>
                        </div>

                        {compra.estado === "Anulada" && compra.infoAnulacion && (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm font-semibold text-red-700">Motivo de anulación</p>
                                <p className="mt-1 text-sm text-red-600">
                                    {compra.infoAnulacion.motivo || "Sin motivo especificado"}
                                </p>
                                {compra.infoAnulacion.fechaAnulacion && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Fecha: {new Date(compra.infoAnulacion.fechaAnulacion).toLocaleString("es-CO")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PRODUCTOS */}
                    <div className="pt-6">

                        {/* CABECERA */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Info
                                    size={18}
                                    className="text-yellow-500"
                                />
                                <span className="font-bold text-gray-700 text-sm uppercase">
                                    Productos de la Compra
                                </span>
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={paginaActual}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>

                        {/* TABLA */}
                        <div className="overflow-x-auto w-full">
                            <table className="min-w-175 w-full text-left text-sm">
                                <thead className="text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold">
                                            #
                                        </th>

                                        <th className="px-4 py-4 font-semibold">
                                            Nombre
                                        </th>

                                        <th className="px-4 py-4 font-semibold">
                                            Cantidad
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center">
                                            Precio inventario
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center">
                                            Coste compra
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center">
                                            Precio venta
                                        </th>

                                        <th className="px-4 py-4 font-semibold text-center">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {productosPagina.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-8 text-center text-gray-400"
                                            >
                                                Sin productos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        productosPagina.map((producto, index) => (
                                            <tr
                                                key={producto.id ?? index}
                                                className="hover:bg-gray-50 transition"
                                            >

                                                <td className="px-4 py-4 text-gray-600">
                                                    {String(
                                                        (paginaActual - 1) *
                                                        ITEMS_PER_PAGE +
                                                        index +
                                                        1
                                                    ).padStart(2, "0")}
                                                </td>

                                                <td className="px-4 py-4 font-medium text-gray-800">
                                                    {producto.nombre}
                                                </td>

                                                <td className="px-4 py-4 text-gray-600">
                                                    {producto.cantidad}
                                                </td>

                                                <td className="px-4 py-4 text-center text-gray-400">
                                                    {formatCOP(producto.precio)}
                                                </td>

                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {formatCOP(producto.costeProducto || producto.precio)}
                                                </td>

                                                <td className="px-4 py-4 text-center text-blue-500 font-medium">
                                                    {formatCOP(producto.precioVenta || producto.precio)}
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold text-gray-800">
                                                    {formatCOP(producto.subtotal)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div className="flex justify-end mt-4">
                                <Pagination
                                    currentPage={paginaActual}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}

                        {/* TOTALES */}
                        <div className="border-t border-gray-300 pt-5 mt-4">
                            <div className="flex flex-col items-end gap-2 text-sm">
                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        Subtotal:
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                        {compra.subtotal ?? "—"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-8 min-w-65">
                                    <span className="text-gray-500 uppercase">
                                        IVA (19%):
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                        {compra.iva ?? "—"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-8 min-w-65 pt-2 border-t border-gray-300">
                                    <span className="text-gray-700 uppercase font-bold">
                                        Total:
                                    </span>
                                    <span className="text-green-600 font-bold text-base">
                                        {compra.total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}