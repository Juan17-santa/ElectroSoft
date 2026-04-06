import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesOrders } from "../services/ServicesOrders";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DEL FORMULARIO DE PEDIDOS
export function useOrdersForm({ onSuccess }) {

    // FECHA ACTUAL
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // FUNCION PARA CALCULAR EL VENCIMIENTO DE LA FECHA (15 DESPUES)
    const calculateVencimiento = (fecha) => {
        const date = new Date(fecha);
        date.setDate(date.getDate() + 15);
        return date.toISOString().split("T")[0];
    };

    // ESTADO INICIAL DEL FORMULARIO DE PEDIDOS
    const [formData, setFormData] = useState({
        documento: "",
        clienteId: null,
        clienteNombre: "",
        clienteTipoDocumento: "",
        clienteTotalCompras: 0,
        fechaPedido: todayFormatted,
        formaPago: "",
        fechaVencimiento: calculateVencimiento(todayFormatted),
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0
    });

    // ESTADO PARA LOS PRODUCTOS DISPONIBLES
    const [products, setProducts] = useState([]);

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    // CÁLCULO DINÁMICO DE OPCIONES DE PAGO SEGÚN HISTORIAL DEL CLIENTE
    const totalCompras = Number(formData.clienteTotalCompras) || 0;

    // SI EL CLIENTE TIENE COMPRAS > 1M, SE HABILITA EL CRÉDITO
    const paymentOptions =
        totalCompras > 1000000
            ? [
                { value: "Contado", label: "Contado" },
                { value: "Credito", label: "Credito" }
            ]
            : [
                { value: "Contado", label: "Contado" }
            ];

    // SI EL CLIENTE NO APLICA A CRÉDITO, RESETEAR A CONTADO
    useEffect(() => {
        if (
            formData.clienteTotalCompras <= 1000000 &&
            formData.formaPago === "Credito"
        ) {
            setFormData(prev => ({
                ...prev,
                formaPago: "Contado"
            }));
        }

    }, [formData.clienteTotalCompras]);

    // PAGINADOR PARA LA LISTA DE PRODUCTOS AGREGADOS
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    // CÁLCULOS LÓGICOS DE PAGINACIÓN
    const totalPages = Math.ceil((formData.productos?.length || 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // SUB-LISTA DE PRODUCTOS A MOSTRAR EN LA PÁGINA ACTUAL
    const currentProducts = (formData.productos || []).slice(indexOfFirstItem, indexOfLastItem);

    // CORREGIR PÁGINA ACTUAL SI SE ELIMINAN ELEMENTOS
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [formData.productos, totalPages]);

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
                clienteTipoDocumento: clienteEncontrado.tipoDocumento,
                clienteTotalCompras: Number(clienteEncontrado.totalCompras) || 0
            }));

            setErrors(prev => ({ ...prev, documento: "" }));
        } else {
            // SI NO EXISTE, RESETEAR CAMPOS RELACIONADOS AL CLIENTE
            setFormData(prev => ({
                ...prev,
                clienteId: null,
                clienteNombre: "",
                clienteTipoDocumento: "",
                clienteTotalCompras: 0,
                formaPago: ""
            }));
        }

    }, [formData.documento]);

    // CARGAR SÓLO PRODUCTOS ACTIVOS Y CON STOCK AL INICIAR
    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        const activos = storedProducts.filter(p => p.estado === true && p.stock > 0);
        setProducts(activos);
    }, []);

    // FUNCIÓN DE VALIDACIÓN PARA CAMPOS INDIVIDUALES
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

    // MANEJADOR DE CAMBIOS CON ACTUALIZACIÓN DE FECHAS Y VALIDACIÓN
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
    const addProduct = (productosNuevos) => {
        // Normalizar: si llega un objeto solo, convertir a array
        const lista = Array.isArray(productosNuevos)
            ? productosNuevos
            : [productosNuevos];

        setFormData(prev => {
            let productos = [...prev.productos];

            lista.forEach(({ cantidad, ...product }) => {
                const existente = productos.find(p => p.id === product.id);
                if (existente) {
                    productos = productos.map(p =>
                        p.id === product.id
                            ? { ...p, cantidad: p.cantidad + cantidad, subtotal: (p.cantidad + cantidad) * p.precio }
                            : p
                    );
                } else {
                    productos.push({
                        id: product.id,
                        nombre: product.nombre,
                        precio: product.precio,
                        cantidad,
                        subtotal: product.precio * cantidad
                    });
                }
            });

            const total = productos.reduce((acc, p) => acc + p.subtotal, 0);
            const iva = total * 0.19;
            const subtotal = total - iva;

            return { ...prev, productos, subtotal, iva, total };
        });

        setErrors(prev => ({ ...prev, productos: "" }));
    };

    // VALIDAR TODO EL FORMULARIO
    const validateForm = () => {

        let newErrors = {};

        // RECORRER TODOS LOS CAMPOS Y EJECUTAR LA VALIDACIÓN INDIVIDUAL
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        // VALIDAR QUE HAYA AL MENOS UN PRODUCTO
        if (!formData.productos.length) {
            newErrors.productos = "Debe agregar al menos un producto";
        }

        // VALIDAR SELECCIÓN DE PAGO
        if (!formData.formaPago) {
            newErrors.formaPago = "Debe seleccionar una forma de pago";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // PROCESAMIENTO DEL ENVÍO DEL FORMULARIO
    const handleSubmit = (e) => {
        e.preventDefault();

        // DETENER LA EJECUCIÓN SI EL FORMULARIO NO ES VÁLIDO
        if (!validateForm()) return;

        // OBTENER ESTADO ACTUAL DE PRODUCTOS PARA ACTUALIZAR STOCK
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

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
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
        itemsPerPage,
        paymentOptions
    };
}