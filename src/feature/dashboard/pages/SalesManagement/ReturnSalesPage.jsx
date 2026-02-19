/**
 * ReturnSalesPage.jsx
 * 
 * Vista de devolución de venta.
 * Permite seleccionar productos de una venta para devolverlos,
 * especificando motivo, condición, gestión, estado de resolución y responsable.
 * 
 * Funcionalidades:
 * - Tabla de productos de la venta original con botón para agregar a devolución
 * - Modal con formulario de 5 campos (motivo, condición, gestión, estado, responsable)
 * - Si motivo = "Otro", aparece un campo de texto para motivo personalizado
 * - Tabla de productos seleccionados para devolución (editar/eliminar)
 * - Registro de devolución (cambia estado de la venta a "Devuelto")
 * - Generación de reporte PDF
 * 
 * Navegación: Se accede desde SalesManagement (icono undo).
 * Los datos se leen de localStorage (clave "saleToReturn").
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Undo2, Trash, Pencil } from "lucide-react";
import { SalesService } from "./services/SalesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReturnSalesPage() {
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    /** Lista de productos que el usuario ha seleccionado para devolver */
    const [productosParaDevolver, setProductosParaDevolver] = useState([]);

    /**
     * Estado del modal de devolución.
     * - showModal: si el modal está visible
     * - editingIndex: null = modo agregar, número = modo editar
     * - modalProduct: producto seleccionado
     * - modalData: datos del formulario (motivo, condición, etc.)
     *   - motivoOtro: campo de texto para motivo personalizado (solo cuando motivo = "Otro")
     */
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalData, setModalData] = useState({
        motivo: "Producto defectuoso",
        motivoOtro: "",
        condicion: "Buen estado",
        gestion: "Devolución dinero",
        estadoResolucion: "Pendiente",
        responsable: "Empresa"
    });

    /** Paginación de la tabla de productos de la venta (4 por página) */
    const [prodPage, setProdPage] = useState(1);
    const prodPerPage = 4;

    /** Paginación de la tabla de productos para devolución (4 por página) */
    const [devPage, setDevPage] = useState(1);
    const devPerPage = 4;

    useEffect(() => {
        const data = localStorage.getItem("saleToReturn");
        if (data) {
            setSale(JSON.parse(data));
        }
    }, []);

    if (!sale) return null;

    const productos = sale.productos || [];

    // Paginacion productos
    const totalProdPages = Math.ceil(productos.length / prodPerPage);
    const paginatedProds = productos.slice((prodPage - 1) * prodPerPage, prodPage * prodPerPage);

    // Paginacion devolucion
    const totalDevPages = Math.ceil(productosParaDevolver.length / devPerPage);
    const paginatedDevs = productosParaDevolver.slice((devPage - 1) * devPerPage, devPage * devPerPage);

    /**
     * Abre el modal en modo "agregar" para un producto de la venta.
     * Valida que el producto no esté ya en la lista de devolución.
     * Inicializa el formulario con valores por defecto.
     */
    const handleOpenAddModal = (producto) => {
        const yaExiste = productosParaDevolver.find(p => p.nombre === producto.nombre);
        if (yaExiste) {
            alert("Este producto ya está en la lista de devolución");
            return;
        }
        setModalProduct(producto);
        setEditingIndex(null);
        setModalData({
            motivo: "Producto defectuoso",
            motivoOtro: "",
            condicion: "Buen estado",
            gestion: "Devolución dinero",
            estadoResolucion: "Pendiente",
            responsable: "Empresa"
        });
        setShowModal(true);
    };

    /**
     * Abre el modal en modo "editar" para un producto ya en devolución.
     * Si el motivo guardado no es uno predefinido, lo detecta como "Otro"
     * y rellena el campo motivoOtro con el texto personalizado.
     */
    const handleOpenEditModal = (index) => {
        const realIndex = (devPage - 1) * devPerPage + index;
        const prod = productosParaDevolver[realIndex];
        setModalProduct(prod);
        setEditingIndex(realIndex);
        const isOtro = !["Producto defectuoso", "No satisfecho", "Producto equivocado"].includes(prod.motivo);
        setModalData({
            motivo: isOtro ? "Otro" : prod.motivo,
            motivoOtro: isOtro ? prod.motivo : "",
            condicion: prod.condicion,
            gestion: prod.gestion,
            estadoResolucion: prod.estadoResolucion,
            responsable: prod.responsable
        });
        setShowModal(true);
    };

    /**
     * Confirma la acción del modal (agregar o editar).
     * Si el motivo es "Otro", usa el texto personalizado de motivoOtro.
     * Elimina motivoOtro del objeto antes de guardar.
     * En modo agregar: añade el producto con subtotalDev calculado.
     * En modo editar: actualiza los datos del producto existente.
     */
    const handleConfirmModal = () => {
        const finalMotivo = modalData.motivo === "Otro" ? (modalData.motivoOtro || "Otro") : modalData.motivo;
        const dataToSave = { ...modalData, motivo: finalMotivo };
        delete dataToSave.motivoOtro;

        if (editingIndex !== null) {
            // Modo editar: actualizar producto existente
            const updated = [...productosParaDevolver];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...dataToSave
            };
            setProductosParaDevolver(updated);
        } else {
            // Modo agregar: añadir nuevo producto a la lista
            setProductosParaDevolver([...productosParaDevolver, {
                ...modalProduct,
                ...dataToSave,
                subtotalDev: modalProduct.precio * modalProduct.cantidad
            }]);
        }
        setShowModal(false);
        setModalProduct(null);
        setEditingIndex(null);
    };

    /** Elimina un producto de la lista de devolución (por índice paginado) */
    const handleRemoveFromReturn = (index) => {
        const realIndex = (devPage - 1) * devPerPage + index;
        setProductosParaDevolver(productosParaDevolver.filter((_, i) => i !== realIndex));
    };

    /** Total monetario de todos los productos seleccionados para devolución */
    const totalDevolucion = productosParaDevolver.reduce((sum, p) => sum + p.subtotalDev, 0);

    /**
     * Registra la devolución: cambia el estado de la venta a "Devuelto".
     * Valida que haya al menos un producto seleccionado.
     * Pide confirmación antes de ejecutar.
     */
    const handleRegistrarDevolucion = () => {
        if (productosParaDevolver.length === 0) {
            alert("Debe agregar al menos un producto para devolver");
            return;
        }

        const confirm = window.confirm("¿Está seguro de registrar esta devolución?");
        if (!confirm) return;

        SalesService.returnSale(sale.id);
        localStorage.removeItem("saleToReturn");
        alert("Devolución registrada correctamente");
        navigate("/dashboard/sales-management");
    };

    /** Cierra la vista de devolución y regresa a la lista de ventas */
    const handleClose = () => {
        localStorage.removeItem("saleToReturn");
        navigate("/dashboard/sales-management");
    };

    /**
     * Genera un reporte PDF de la devolución.
     * Incluye: información de la venta, tabla de productos originales,
     * tabla de productos para devolución (con motivo, condición, responsable),
     * y total de la devolución.
     * Se descarga como "devolucion_[numero].pdf".
     */
    const handleGenerateReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Devolución de venta", 14, 22);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`ID venta: ${sale.numeroDocumento}`, 14, 36);
        doc.text(`Fecha creación: ${sale.fecha}`, 14, 44);
        doc.text(`Subtotal: $${sale.subtotal?.toLocaleString()}`, 100, 36);
        doc.text(`IVA: $${sale.iva?.toLocaleString()}`, 140, 36);
        doc.text(`Total: $${sale.total?.toLocaleString()}`, 170, 36);

        // Tabla 1: Productos de la venta original
        const prodTable = autoTable(doc, {
            startY: 54,
            head: [["Producto", "Precio", "Cantidad", "Subtotal"]],
            body: productos.map(p => [
                p.nombre,
                `$${p.precio?.toLocaleString()}`,
                p.cantidad,
                `$${(p.precio * p.cantidad).toLocaleString()}`
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [234, 179, 8] }
        });

        // Tabla 2: Productos seleccionados para devolución (si hay alguno)
        if (productosParaDevolver.length > 0) {
            const finalY = prodTable.finalY + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Productos para devolución", 14, finalY);

            const devTable = autoTable(doc, {
                startY: finalY + 6,
                head: [["Producto", "Motivo", "Condición", "Responsable", "Precio", "Cantidad", "Subtotal"]],
                body: productosParaDevolver.map(p => [
                    p.nombre,
                    p.motivo,
                    p.condicion,
                    p.responsable,
                    `$${p.precio?.toLocaleString()}`,
                    p.cantidad,
                    `$${p.subtotalDev?.toLocaleString()}`
                ]),
                styles: { fontSize: 8 },
                headStyles: { fillColor: [234, 179, 8] }
            });

            doc.setFontSize(12);
            doc.text(`Total devolución: $${totalDevolucion.toLocaleString()}`, 14, devTable.finalY + 10);
        }

        doc.save(`devolucion_${sale.numeroDocumento}.pdf`);
    };

    /**
     * Componente paginador reutilizable.
     * Muestra flechas de navegación y números de página con elipsis.
     * Se usa tanto para la tabla de productos como la de devolución.
     */
    const Paginator = ({ currentPage, totalPages: tp, onPageChange }) => {
        if (tp <= 1) return null;
        const pages = [];
        if (tp <= 5) {
            for (let i = 1; i <= tp; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(tp - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < tp - 2) pages.push("...");
            pages.push(tp);
        }

        return (
            <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">
                    <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} className="p-2 rounded-lg hover:bg-gray-300 transition" disabled={currentPage === 1}>←</button>
                    {pages.map((p, i) => p === "..." ? (
                        <span key={`d-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded-md transition ${currentPage === p ? "bg-yellow-400 text-black font-medium shadow-sm" : "hover:bg-gray-300"}`}>{p}</button>
                    ))}
                    <button onClick={() => onPageChange(Math.min(tp, currentPage + 1))} className="p-2 rounded-lg hover:bg-gray-300 transition" disabled={currentPage === tp}>→</button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-5 w-full h-full shadow-inner overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Devolución de venta</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                        >
                            <FileText size={16} />
                            Generar reporte
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Información venta */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">Información venta</p>
                    <div className="bg-white rounded-xl border-l-4 border-yellow-400 px-5 py-4 flex items-center gap-8 shadow-sm">
                        <div>
                            <p className="text-xs text-gray-400">ID venta</p>
                            <p className="font-bold text-gray-800">{sale.numeroDocumento}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Fecha creación</p>
                            <p className="font-semibold text-gray-800">{sale.fecha}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Subtotal</p>
                            <p className="font-bold text-gray-800">${sale.subtotal?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">IVA</p>
                            <p className="font-bold text-gray-800">${sale.iva?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="font-bold text-gray-800">${sale.total?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Productos de la venta */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">Productos</p>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-4 py-2.5 font-semibold">Producto</th>
                                    <th className="px-4 py-2.5 font-semibold">Precio</th>
                                    <th className="px-4 py-2.5 font-semibold">Cantidad</th>
                                    <th className="px-4 py-2.5 font-semibold">Subtotal</th>
                                    <th className="px-4 py-2.5 font-semibold text-center w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProds.map((prod, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2.5">{prod.nombre}</td>
                                        <td className="px-4 py-2.5">{prod.precio?.toLocaleString()}</td>
                                        <td className="px-4 py-2.5">{prod.cantidad}</td>
                                        <td className="px-4 py-2.5">{(prod.precio * prod.cantidad).toLocaleString()}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <button
                                                onClick={() => handleOpenAddModal(prod)}
                                                className="text-yellow-600 hover:text-yellow-800 transition cursor-pointer"
                                                title="Agregar a devolución"
                                            >
                                                <Undo2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginator currentPage={prodPage} totalPages={totalProdPages} onPageChange={setProdPage} />
                </div>

                {/* Productos para devolución */}
                <div>
                    <p className="font-semibold text-gray-800 mb-2">Productos para devolución</p>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                    <th className="px-3 py-2.5 font-semibold">Producto</th>
                                    <th className="px-3 py-2.5 font-semibold">Motivo</th>
                                    <th className="px-3 py-2.5 font-semibold">Condición producto</th>
                                    <th className="px-3 py-2.5 font-semibold">Gestión</th>
                                    <th className="px-3 py-2.5 font-semibold">Estado resolución</th>
                                    <th className="px-3 py-2.5 font-semibold">Responsable</th>
                                    <th className="px-3 py-2.5 font-semibold">Precio</th>
                                    <th className="px-3 py-2.5 font-semibold">Cantidad</th>
                                    <th className="px-3 py-2.5 font-semibold">Subtotal</th>
                                    <th className="px-3 py-2.5 font-semibold text-center w-20"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDevs.length > 0 ? (
                                    paginatedDevs.map((prod, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-3 py-2.5 text-xs">{prod.nombre}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.motivo}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.condicion}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.gestion}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.estadoResolucion}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.responsable}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.precio?.toLocaleString()}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.cantidad}</td>
                                            <td className="px-3 py-2.5 text-xs">{prod.subtotalDev?.toLocaleString()}</td>
                                            <td className="px-3 py-2.5 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditModal(index)}
                                                        className="text-yellow-600 hover:text-yellow-800 transition cursor-pointer p-1"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveFromReturn(index)}
                                                        className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                                                        title="Eliminar"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-4 text-center text-gray-400 text-sm">
                                            Seleccione productos de la tabla superior para devolver
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Paginator currentPage={devPage} totalPages={totalDevPages} onPageChange={setDevPage} />
                </div>

                {/* Footer: Total y Registrar */}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-500">Total devolución: </span>
                            <span className="font-bold text-gray-800 text-lg">${totalDevolucion.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleRegistrarDevolucion}
                        className="px-6 py-2.5 bg-linear-to-r from-white to-yellow-300 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium text-sm"
                    >
                        Registrar Devolución
                    </button>
                </div>
            </div>

            {/* MODAL PARA AGREGAR/EDITAR PRODUCTO DE DEVOLUCIÓN */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-110">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingIndex !== null ? "Editar producto" : "Agregar a devolución"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nombre del producto */}
                        <p className="text-sm text-gray-500 mb-4">
                            Producto: <span className="font-semibold text-gray-800">{modalProduct?.nombre}</span>
                        </p>

                        <div className="flex flex-col gap-4">
                            {/* Motivo */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-yellow-500">Motivo *</label>
                                <select
                                    value={modalData.motivo}
                                    onChange={(e) => setModalData({ ...modalData, motivo: e.target.value, motivoOtro: e.target.value !== "Otro" ? "" : modalData.motivoOtro })}
                                    className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                >
                                    <option>Producto defectuoso</option>
                                    <option>No satisfecho</option>
                                    <option>Producto equivocado</option>
                                    <option>Otro</option>
                                </select>
                                {modalData.motivo === "Otro" && (
                                    <input
                                        type="text"
                                        value={modalData.motivoOtro}
                                        onChange={(e) => setModalData({ ...modalData, motivoOtro: e.target.value })}
                                        placeholder="Describa el motivo..."
                                        className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 mt-1.5"
                                    />
                                )}
                            </div>

                            {/* Condición del producto */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-yellow-500">Condición del producto *</label>
                                <select
                                    value={modalData.condicion}
                                    onChange={(e) => setModalData({ ...modalData, condicion: e.target.value })}
                                    className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                >
                                    <option>Buen estado</option>
                                    <option>Dañado</option>
                                    <option>Incompleto</option>
                                </select>
                            </div>

                            {/* Gestión */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-yellow-500">Gestión *</label>
                                <select
                                    value={modalData.gestion}
                                    onChange={(e) => setModalData({ ...modalData, gestion: e.target.value })}
                                    className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                >
                                    <option>Devolución dinero</option>
                                    <option>Otro/s producto/s</option>
                                    <option>Nota crédito</option>
                                </select>
                            </div>

                            {/* Estado resolución */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-yellow-500">Estado resolución *</label>
                                <select
                                    value={modalData.estadoResolucion}
                                    onChange={(e) => setModalData({ ...modalData, estadoResolucion: e.target.value })}
                                    className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                >
                                    <option>Pendiente</option>
                                    <option>Resuelto</option>
                                </select>
                            </div>

                            {/* Responsable */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-yellow-500">Responsable *</label>
                                <select
                                    value={modalData.responsable}
                                    onChange={(e) => setModalData({ ...modalData, responsable: e.target.value })}
                                    className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                                >
                                    <option>Empresa</option>
                                    <option>Cliente</option>
                                </select>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 justify-center mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmModal}
                                className="px-6 py-2 bg-linear-to-r from-white to-yellow-300 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium text-sm"
                            >
                                {editingIndex !== null ? "Actualizar" : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
