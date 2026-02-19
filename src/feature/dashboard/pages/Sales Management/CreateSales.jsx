import { User, FileText, X, Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SalesService } from "./services/SalesService";
import { ProductService } from "./services/ProductService";
import AddProductModal from "./AddProductModal";

export default function CreateSales() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        numeroDocumento: "",
        tipoVenta: "Contado",
        fecha: new Date().toISOString().split('T')[0],
        estado: "Vigente"
    });

    const [productos, setProductos] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setAvailableProducts(ProductService.getAll());
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const newProductos = [...productos];
        newProductos[index][field] = field === 'cantidad' ? parseFloat(value) || 0 : value;
        setProductos(newProductos);
    };

    const handleAddProduct = () => {
        setIsModalOpen(true);
    };

    const handleSaveProduct = (selectedProduct, quantity) => {
        const newProduct = {
            id: Date.now(), // Generate a unique ID for the row
            nombre: selectedProduct.nombre,
            cantidad: quantity,
            precio: selectedProduct.precio
        };
        setProductos([...productos, newProduct]);
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (index) => {
        setProductos(productos.filter((_, i) => i !== index));
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

            const datosVenta = {
                ...formData,
                productos,
                subtotal,
                iva,
                total,
                montoPagado: formData.tipoVenta === 'Contado' ? total : 0,
                montoPorPagar: formData.tipoVenta === 'Contado' ? 0 : total
            };

            SalesService.create(datosVenta);

            alert("Venta creada correctamente!");

            navigate("/dashboard/sales-management");

        } catch (error) {
            console.error(error);
            alert("Error al crear la venta");
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nueva <span className="text-yellow-400">venta</span></p>
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
                    <div className="grid grid-cols-2 gap-6">
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
                                <option value="Crédito">Crédito</option>
                            </select>
                        </div>
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
                                    {productos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                No hay productos agregados. Haga clic en "Agregar Producto".
                                            </td>
                                        </tr>
                                    ) : (
                                        productos.map((producto, index) => (
                                            <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-800">{producto.nombre}</span>
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
                                                    ${parseFloat(producto.precio).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">
                                                    ${(producto.cantidad * producto.precio).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(index)}
                                                        className="p-1 hover:bg-red-100 rounded transition cursor-pointer"
                                                    >
                                                        <Trash size={16} className="text-red-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                            Registrar Venta
                        </button>
                    </div>
                </form>

                {/* MODAL PARA AGREGAR PRODUCTO */}
                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleSaveProduct}
                    products={availableProducts}
                />
            </div>
        </>
    );
}
