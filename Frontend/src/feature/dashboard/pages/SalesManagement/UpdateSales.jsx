import { User, FileText, X, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";

export default function UpdateSales() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        numeroDocumento: "",
        tipoVenta: "Contado",
        diasPlazo: "",
        fecha: (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        })(),
        estado: "Vigente"
    });

    const [productos, setProductos] = useState([
        { id: 1, nombre: "", cantidad: 1, precio: 0 }
    ]);

    useEffect(() => {
        const data = localStorage.getItem("saleToEdit");
        if (data) {
            const sale = JSON.parse(data);
            setFormData({
                id: sale.id,
                numeroDocumento: sale.numeroDocumento,
                tipoVenta: sale.tipoVenta,
                diasPlazo: sale.diasPlazo || "",
                fecha: sale.fecha,
                estado: sale.estado
            });
            if (sale.productos && sale.productos.length > 0) {
                setProductos(sale.productos);
            }
        }
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "diasPlazo") {
            value = value.replace(/\D/g, "");
            if (value !== "" && Number(value) > 60) value = "60";
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const newProductos = [...productos];
        newProductos[index][field] = field === 'cantidad' || field === 'precio' ? parseFloat(value) || 0 : value;
        setProductos(newProductos);
    };

    const handleAddProduct = () => {
        const newId = Math.max(...productos.map(p => p.id), 0) + 1;
        setProductos([...productos, { id: newId, nombre: "", cantidad: 1, precio: 0 }]);
    };

    const handleRemoveProduct = (index) => {
        if (productos.length > 1) {
            setProductos(productos.filter((_, i) => i !== index));
        }
    };

    // Calcular totales
    const calcularTotales = () => {
        const subtotal = productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        return { subtotal, iva, total };
    };

    const { subtotal, iva, total } = calcularTotales();

    const handleForm = (e) => {
        e.preventDefault();

        try {
            // Validaciones
            if (!formData.numeroDocumento.trim()) {
                alert("El número de documento es requerido");
                return;
            }

            if (productos.length === 0) {
                alert("Debe agregar al menos un producto");
                return;
            }

            // Validar que todos los productos tengan nombre y precio
            const productoInvalido = productos.some(p => !p.nombre.trim() || p.precio <= 0);
            if (productoInvalido) {
                alert("Todos los productos deben tener nombre y precio");
                return;
            }

            const datosVenta = {
                ...formData,
                diasPlazo: formData.tipoVenta === 'Credito' ? Number(formData.diasPlazo) : null,
                productos,
                subtotal,
                iva,
                total,
                montoPagado: formData.tipoVenta === 'Contado' ? total : (formData.montoPagado || 0),
                montoPorPagar: formData.tipoVenta === 'Contado' ? 0 : (total - (formData.montoPagado || 0))
            };

            SalesService.update(datosVenta);

            alert("Venta actualizada correctamente!");

            // LIMPIEZA: Borramos el rastro del localStorage
            localStorage.removeItem("saleToEdit");

            navigate("/dashboard/sales-management");

        } catch (error) {
            console.error(error);
            alert("Error al actualizar la venta");
        }
    };

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Editar <span className="text-yellow-400">venta</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/sales-management")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm} className="flex flex-col gap-6">

                    {/* FILA 1: NUMERO DOCUMENTO Y TIPO VENTA */}
                    <div className={`grid gap-6 ${formData.tipoVenta === "Credito" ? "grid-cols-3" : "grid-cols-2"}`}>
                        {/* NUMERO DOCUMENTO */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Número Documento *</span>
                            </div>
                            <input
                                type="text"
                                name="numeroDocumento"
                                value={formData.numeroDocumento}
                                onChange={handleChange}
                                placeholder="Ej: DOC-001"
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        {/* TIPO VENTA */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Tipo Venta *</span>
                            </div>
                            <select
                                name="tipoVenta"
                                value={formData.tipoVenta}
                                onChange={handleChange}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="Contado">Contado</option>
                                <option value="Credito">Crédito</option>
                            </select>
                        </div>

                        {/* DIAS PLAZO */}
                        {formData.tipoVenta === "Credito" && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <FileText size={16} />
                                    <span>Plazo (Crédito) *</span>
                                </div>
                                <input
                                    type="text"
                                    name="diasPlazo"
                                    value={formData.diasPlazo}
                                    onChange={handleChange}
                                    placeholder="Ej: 45 (Máx 60)"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* FILA 2: FECHA Y ESTADO */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* FECHA */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Fecha *</span>
                            </div>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        {/* ESTADO */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Estado *</span>
                            </div>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="Vigente">Vigente</option>
                                <option value="Finalizado">Finalizado</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <FileText size={16} />
                                <span>Productos *</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="flex items-center gap-2 bg-linear-to-r from-white to-yellow-300 text-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                            >
                                <Plus size={16} />
                                Agregar Producto
                            </button>
                        </div>

                        <div className="bg-white rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200 border-b border-gray-300">
                                        <th className="px-4 py-3 text-left font-semibold">Producto</th>
                                        <th className="px-4 py-3 text-center font-semibold w-24">Cantidad</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Precio</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Subtotal</th>
                                        <th className="px-4 py-3 text-center font-semibold w-12">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((producto, index) => (
                                        <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={producto.nombre}
                                                    onChange={(e) => handleProductChange(index, 'nombre', e.target.value)}
                                                    placeholder="Nombre del producto"
                                                    className="w-full bg-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    value={producto.cantidad}
                                                    onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                                                    min="1"
                                                    className="w-full bg-gray-100 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={producto.precio}
                                                    onChange={(e) => handleProductChange(index, 'precio', e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-100 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                ${(producto.cantidad * producto.precio).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    disabled={productos.length === 1}
                                                    className="p-1 hover:bg-red-100 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash size={16} className="text-red-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TOTALES */}
                    <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">Subtotal</p>
                            <p className="text-2xl font-bold text-gray-800">${subtotal.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">IVA (19%)</p>
                            <p className="text-2xl font-bold text-blue-600">${iva.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-600 text-sm mb-2">Total</p>
                            <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* BOTON GUARDAR */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/sales-management")}
                            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition cursor-pointer font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-linear-to-r from-white to-yellow-300 shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                        >
                            Editar Venta
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}