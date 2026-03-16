import { useState, useEffect, useRef } from "react";
import { Box, Hash, ChevronDown, XCircle } from "lucide-react";
import ValidationMessage from "./ValidationMessage";
import { Validations } from "../../../../utils/validations";
import PrimaryButton from "./PrimaryButton";
import Pagination from "./Pagination";

export default function AddProductModal({
    isOpen,
    onClose,
    onAdd,
    products,
    getAvailableStock,
    buttonText
}) {

    // ID DEL PRODUCTO SELECCIONADO DESDE EL COMBO
    const [selectedProductId, setSelectedProductId] = useState("");

    // CANTIDAD DE PRODUCTOS A AGREGAR
    const [quantity, setQuantity] = useState("");

    // MENSAJES DE ERROR PARA VALIDACIONES
    const [quantityError, setQuantityError] = useState("");
    const [productError, setProductError] = useState("");

    // TEXTO QUE EL USUARIO ESCRIBE EN EL INPUT DE BUSQUEDA
    const [searchTerm, setSearchTerm] = useState("");

    // CONTROL PARA ABRIR O CERRAR EL DROPDOWN DEL COMBO
    const [isOpenCombo, setIsOpenCombo] = useState(false);

    // PAGINACION
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // REFERENCIA DEL CONTENEDOR PARA DETECTAR CLICKS FUERA DEL COMPONENTE
    const comboRef = useRef(null);

    // FILTRA LOS PRODUCTOS SEGÚN EL TEXTO ESCRITO EN EL BUSCADOR
    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // HELPERS PARA CALCULAR STOCK
    // OBTENER EL PRODUCTO SELECCIONADO DESDE LA LISTA DE PRODUCTOS
    const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));

    const availableStock = selectedProduct
    ? getAvailableStock?.(selectedProduct)
    : 0;

    // ESTA FUNCIÓN SE EJECUTA CUANDO EL USUARIO PRESIONA LA "X"
    // LIMPIA EL TEXTO, EL PRODUCTO SELECCIONADO Y REABRE EL COMBO
    const handleClearSearch = () => {
        setSearchTerm("");
        setSelectedProductId("");
        setProductError("");
        setIsOpenCombo(true); // REABRIMOS EL COMBO PARA MOSTRAR TODOS LOS PRODUCTOS
    };

    // SI EL USUARIO HACE CLICK FUERA DEL BUSCADOR
    // CERRAMOS EL DROPDOWN PARA MEJOR UX
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (comboRef.current && !comboRef.current.contains(e.target)) {
                setIsOpenCombo(false);

                // SI EL USUARIO YA TENÍA UN PRODUCTO SELECCIONADO
                // RESTAURAMOS EL NOMBRE REAL DEL PRODUCTO
                // PARA EVITAR TEXTO INVALIDO
                setSearchTerm(selectedProduct?.nombre || "");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedProduct]);

    // MANEJAR EL CAMBIO DE TEXTO EN EL BUSCADOR
    // ESTA FUNCIÓN SOLO CONTROLA EL TEXTO Y FILTRADO
    // NO CONFIRMA SELECCIÓN DE PRODUCTO (ESO SOLO PASA AL HACER CLICK)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpenCombo(true);
        setCurrentPage(1); // Reset to first page on search

        // SI EL USUARIO MODIFICA EL TEXTO
        // INVALIDAMOS EL PRODUCTO SELECCIONADO
        // PARA EVITAR INCONSISTENCIAS
        if (!selectedProduct || value !== selectedProduct.nombre) {
            setSelectedProductId("");
            // MOSTRAMOS ERROR INMEDIATO
            setProductError("Seleccione un producto válido de la lista");
        } else {
            setProductError("");
        }
    };

    // SELECCIONAR PRODUCTO DEL DROPDOWN
    // ESTA ES LA ÚNICA FORMA VÁLIDA DE SELECCIONAR UN PRODUCTO
    const handleSelectProduct = (p) => {

        // GUARDAMOS EL ID REAL DEL PRODUCTO
        setSelectedProductId(p.id);

        // MOSTRAMOS EL NOMBRE EN EL INPUT
        setSearchTerm(p.nombre);

        // CERRAMOS EL DROPDOWN
        setIsOpenCombo(false);

        // LIMPIAMOS ERRORES PORQUE YA ES UNA SELECCIÓN VÁLIDA
        setProductError("");
    };

    // CADA VEZ QUE EL MODAL SE ABRE
    // LIMPIAMOS TODOS LOS ESTADOS
    useEffect(() => {
        if (isOpen) {
            setSelectedProductId("");
            setSearchTerm("");
            setQuantity("");
            setProductError("");
            setQuantityError("");
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    // VALIDAR CANTIDAD
    // - QUE NO ESTÉ VACÍA
    // - QUE SEA NUMÉRICA
    // - QUE NO EXCEDA EL STOCK DISPONIBLE
    const validateQuantity = (value, product) => {
        if (value === "") return "La cantidad es obligatoria";

        const qty = Number(value);
        if (isNaN(qty) || qty <= 0) return "Cantidad invalida";

        if (product && qty > availableStock) {
            return `Solo quedan ${availableStock} unidades disponibles`;
        }
        return "";
    };

    // FUNCION PARA AGREGAR PRODUCTOS
    // ESTA FUNCIÓN ES LA RESPONSABLE FINAL
    // DE VALIDAR Y ENVIAR EL PRODUCTO AL PADRE
    const handleAddProduct = () => {

        // BUSCAMOS EL PRODUCTO REAL EN EL STORE
        const productByStore = products.find(p => String(p.id) === String(selectedProductId));

        // VALIDAMOS QUE EL TEXTO DEL INPUT COINCIDA EXACTAMENTE
        // CON EL PRODUCTO SELECCIONADO
        if (!productByStore || searchTerm !== productByStore.nombre) {
            setProductError("Seleccione un producto válido de la lista");
            return;
        }

        // VALIDAMOS LA CANTIDAD
        const qError = validateQuantity(quantity, productByStore);

        if (qError) {
            setQuantityError(qError);
            return;
        }

        // ENVIAMOS AL COMPONENTE PADRE:
        // PRODUCTO + CANTIDAD
        onAdd(productByStore, Number(quantity));

        // LIMPIAMOS ESTADOS PARA PRÓXIMA APERTURA
        setSearchTerm("");
        setQuantity(1);
        setCurrentPage(1);

        // CERRAMOS EL MODAL
        onClose();
    };

    // SI EXISTE ALGÚN ERROR
    // EL BOTÓN DE AÑADIR SE DESHABILITA
    const isInvalid = !!productError || !!quantityError

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-3xl overflow-visible">
                <div className="p-10">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 relative">

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* SELECTOR DE PRODUCTOS CON BUSCADOR */}
                            <div className="flex flex-col gap-3 relative" ref={comboRef}>
                                <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                    <Box size={18} />
                                    <span>Productos *</span>
                                </div>

                                {/* INPUT BUSCADOR */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        value={searchTerm}
                                        onFocus={() => setIsOpenCombo(true)}
                                        onChange={handleSearchChange}
                                        className={`w-full bg-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all
                                            ${(productError || (selectedProductId && searchTerm !== selectedProduct?.nombre)) ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-yellow-400"}`
                                        }
                                    />
                                    {/* BOTÓN DE LA X */}
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-10 top-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                    <ChevronDown
                                        size={18}
                                        className={`absolute right-3 top-3.5 text-gray-400 transition-transform ${isOpenCombo ? "rotate-180" : ""}`}
                                    />
                                </div>

                                {/* DROPDOWN DE RESULTADOS */}
                                {isOpenCombo && (
                                    <div className="absolute top-full mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-100 z-50 p-2 flex flex-col gap-2">
                                        <div className="max-h-60 overflow-y-auto">
                                            {paginatedProducts.length > 0 ? (
                                                paginatedProducts.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleSelectProduct(p)}
                                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-yellow-50 text-sm transition flex justify-between items-center"
                                                    >
                                                        <span className="font-medium text-gray-700">{p.nombre}</span>
                                                        <span className="text-gray-400 text-xs">${parseFloat(p.precio || 0).toLocaleString()}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-400 text-sm italic">
                                                    No se encontraron productos
                                                </div>
                                            )}
                                        </div>
                                        
                                        {totalPages > 1 && (
                                            <div className="border-t border-gray-100 pt-2 flex justify-center">
                                                <Pagination 
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={setCurrentPage}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* MENSAJES DE VALIDACIÓN DINÁMICOS */}
                                <ValidationMessage error={productError} />

                                {/* EL MENSAJE DE EXITO SOLO APARECE SI HAY UN ID Y EL TEXTO DE BUSQUEDA COINCIDE EXACTAMENTE */}
                                <ValidationMessage
                                    success={!!selectedProductId && searchTerm === selectedProduct?.nombre}
                                    successMessage="Producto listo para añadir"
                                />

                                {/* STOCK VISIBLE SOLO SI EL PRODUCTO ES VALIDO */}
                                {selectedProductId && searchTerm === selectedProduct?.nombre && (
                                    <p className={`text-xs ${availableStock === 0 ? "text-red-500" : "text-gray-500"}`}>
                                        Stock disponible: {availableStock}
                                    </p>
                                )}
                            </div>

                            {/* INPUT DE CANTIDAD */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center text-yellow-500 gap-2 text-md font-medium">
                                    <Hash size={18} />
                                    <span>Cantidad *</span>
                                </div>
                                <input
                                    type="text"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || Validations.soloNumeros(val)) {
                                            setQuantity(val);
                                            setQuantityError(validateQuantity(val, selectedProduct));
                                        }
                                    }}
                                    placeholder="0"
                                    className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                />

                                {/* USO DEL COMPONENTE REUTILIZABLE PARA LOS ERRORES CON EL ICONO*/}
                                <ValidationMessage error={quantityError} />
                                {quantity !== "" && !quantityError && (
                                    <ValidationMessage
                                        success={true}
                                        successMessage="Cantidad válida"
                                    />
                                )}
                            </div>
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition shadow-md"
                            >
                                Cancelar
                            </button>

                            <PrimaryButton
                                onClick={handleAddProduct}
                                disabled={isInvalid}
                            >
                                {buttonText || "Añadir producto"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}