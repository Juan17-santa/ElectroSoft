import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesOrders } from "../services/ServicesOrders";

export function useOrdersForm({ onSuccess }) {

    // FECHA ACTUAL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // FUNCION PARA CALCULAR EL VENCIMIENTO DE LA FECHA
    const calculateVencimiento = (fecha) => {
        const date = new Date(fecha);
        date.setDate(date.getDate() + 15);
        return date.toISOString().split("T")[0];
    };

    // ESTADO PARA LOS DATOS DEL FORMULARIO
    const [formData, setFormData] = useState({
        documento: "",
        clienteId: null,
        clienteNombre: "",
        clienteTipoDocumento: "",
        fechaPedido: todayFormatted,
        formaPago: "",
        fechaVencimiento: calculateVencimiento(todayFormatted),
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0
    });

    // PRODUCTOS DISPONIBLES
    const [products, setProducts] = useState([]);

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // Dentro de tu useOrdersForm.js (o como se llame tu hook)
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    // Cálculos de paginación
    const totalPages = Math.ceil((formData.productos?.length || 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Los productos que realmente verá el usuario
    const currentProducts = (formData.productos || []).slice(indexOfFirstItem, indexOfLastItem);

    // Resetear página si queda vacía al borrar
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [formData.productos.length, totalPages]);

    // BUSCAR CLIENTE POR MEDIO DEL DOCUMENTO
    useEffect(() => {
        if (!formData.documento) return;

        const clientes = JSON.parse(localStorage.getItem("clients")) || [];

        const clienteEncontrado = clientes.find(
            c => c.documento === formData.documento && c.estado === true
        );

        if (clienteEncontrado) {
            setFormData(prev => ({
                ...prev,
                clienteId: clienteEncontrado.id,
                clienteNombre: `${clienteEncontrado.nombres} ${clienteEncontrado.apellidos}`,
                clienteTipoDocumento: clienteEncontrado.tipoDocumento
            }));

            setErrors(prev => ({ ...prev, documento: "" }));
        } else {
            setFormData(prev => ({
                ...prev,
                clienteId: null,
                clienteNombre: "",
                clienteTipoDocumento: ""
            }));
        }

    }, [formData.documento]);

    // CARGAR SOLO LOS PRODUCTOS QUE ESTEN ACTIVOS!!!
    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        const activos = storedProducts.filter(p => p.estado === true && p.stock > 0);
        setProducts(activos);
    }, []);

    // VALIDACION INDIVIDUAL
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "documento":
                if (!value) {
                    error = "El documento es obligatorio";
                } else if (!Validations.soloNumeros(value)) {
                    error = "Solo números permitidos";
                } else if (value.length < 8 || value.length > 12) {
                    error = "Debe tener entre 8 y 12 dígitos";
                } else if (!formData.clienteId) {
                    error = "Cliente no encontrado";
                }
                break;

            case "formaPago":
                if (!value) {
                    error = "La forma de pago es obligatoria";
                }
                break;

            default:
                break;
        }

        return error;
    };

    // HANDLE CHANGE CON VALIDACIÓN EN TIEMPO REAL
    const handleChange = (e) => {
        const { name, value } = e.target;

        // SI LA FECHA PEDIDO SE CAMBIA, LA FECHA DE VENCIMIENTO SE ACTUALIZA AUTOMATICAMENTE
        if (name === "fechaPedido") {
            setFormData(prev => ({
                ...prev,
                fechaPedido: value,
                fechaVencimiento: calculateVencimiento(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // FUNCION PARA AÑADIR PRODUCTOS
    const addProduct = (product, quantity) => {

        const productoExistente = formData.productos.find(
            p => p.id === product.id
        );

        // si el producto ya está en el pedido
        if (productoExistente) {

            const nuevaCantidad = productoExistente.cantidad + quantity;

            // validar stock total
            if (nuevaCantidad > product.stock) {
                setErrors(prev => ({
                    ...prev,
                    productos: `Solo hay ${product.stock} unidades disponibles`
                }));
                return;
            }

            const productosActualizados = formData.productos.map(p =>
                p.id === product.id
                    ? {
                        ...p,
                        cantidad: nuevaCantidad,
                        subtotal: nuevaCantidad * p.precio
                    }
                    : p
            );
        } else {

            if (quantity > product.stock) {
                setErrors(prev => ({
                    ...prev,
                    productos: `Solo hay ${product.stock} unidades disponibles`
                }));
                return;
            }

            const newProduct = {
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: quantity,
                subtotal: product.precio * quantity
            };

            const nuevosProductos = [...formData.productos, newProduct];

            const subtotal = nuevosProductos.reduce((acc, p) => acc + p.subtotal, 0);
            const iva = subtotal * 0.19;
            const total = subtotal + iva;

            setFormData(prev => ({
                ...prev,
                productos: nuevosProductos,
                subtotal,
                iva,
                total
            }));

            setErrors(prev => ({ ...prev, productos: "" }));

            // Si la tabla estaba vacía o en otra página, volvemos a la 1 para ver el nuevo item
            if (nuevosProductos.length > 0 && currentPage === 0) {
                setCurrentPage(1);
            }
        };
    }

    // VALIDAR TODO EL FORMULARIO
    const validateForm = () => {

        let newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (!formData.productos.length) {
            newErrors.productos = "Debe agregar al menos un producto";
        }

        if (!formData.formaPago) {
            newErrors.formaPago = "Debe seleccionar una forma de pago";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // FUNCION PARA GUARDAR
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // OBTENER PRODUCTOS DEL INVENTARIO
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];

        // ACTUALIZAR STOCK SEGÚN LOS PRODUCTOS DEL PEDIDO
        const updatedProducts = storedProducts.map(product => {

            const productoPedido = formData.productos.find(
                p => p.id === product.id
            );

            if (productoPedido) {
                return {
                    ...product,
                    stock: product.stock - productoPedido.cantidad
                };
            }

            return product;
        });

        // GUARDAR NUEVO STOCK
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // CREAR PEDIDO
        const nuevoPedido = ServicesOrders.create(formData);

        onSuccess(nuevoPedido);
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData,
        products,
        addProduct,
        currentPage,
        setCurrentPage,
        totalPages,
        currentProducts,
        indexOfFirstItem,
        itemsPerPage
    };
}