import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";
import { ServicesOrders } from "../services/ServicesOrders";
import { ClientsService } from "../../Clients/services/ClientsService";
import { ServicesProducts } from "../../products/services/ServicesProducts";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DEL FORMULARIO DE PEDIDOS
export function useOrdersForm({ onSuccess, onShowAlert }) {

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

        clienteCupoActivo: false,
        clienteCupoTotal: 0,

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
    const [clients, setClients] = useState([]);

    // ESTADO PARA LOS ERRORES DE VALIDACIÓN
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    // DOCUMENTO CON RETARDO PARA EVITAR PETICIONES EN CADA TECLA
    const [documentoBusqueda, setDocumentoBusqueda] = useState("");

    // OPCIONES DE PAGO DISPONIBLES
    const paymentOptions = [
        { value: "Contado", label: "Contado" },
        { value: "Credito", label: "Credito" }
    ];

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

    // BUSCAR CLIENTE POR MEDIO DEL DOCUMENTO EN TIEMPO REAL
    useEffect(() => {
        if (!formData.documento) {
            setFormData(prev => ({
                ...prev,
                clienteId: null,
                clienteNombre: "",
                clienteTipoDocumento: "",
                formaPago: "",
                clienteCupoActivo: false,
                clienteCupoTotal: 0,
            }));
            return;
        }

        const found = clients.find(c =>
            c.documento === formData.documento ||
            `${c.nombres} ${c.apellidos}`.toLowerCase() === formData.documento.toLowerCase()
        );
        if (found && found.estado) {
            setFormData(prev => ({
                ...prev,
                clienteId: found.id,
                clienteNombre: `${found.nombres} ${found.apellidos}`,
                clienteTipoDocumento: found.tipoDocumento,
                clienteCupoActivo: found.cupoActivo,
                clienteCupoTotal: found.cupoTotal || 0,
            }));
            setErrors(prev => ({ ...prev, documento: "" }));
        } else if (formData.documento.length >= 8) {
            const timer = setTimeout(async () => {
                try {
                    const clienteEncontrado = await ClientsService.getByDocument(formData.documento);
                    if (clienteEncontrado?.estado) {
                        setFormData(prev => ({
                            ...prev,
                            clienteId: clienteEncontrado.id,
                            clienteNombre: `${clienteEncontrado.nombres} ${clienteEncontrado.apellidos}`,
                            clienteTipoDocumento: clienteEncontrado.tipoDocumento,
                            clienteCupoActivo: clienteEncontrado.cupoActivo,
                            clienteCupoTotal: clienteEncontrado.cupoTotal || 0,
                        }));
                        setErrors(prev => ({ ...prev, documento: "" }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            clienteId: null,
                            clienteNombre: "",
                            clienteTipoDocumento: "",
                            formaPago: "",
                            clienteCupoActivo: false,
                            clienteCupoTotal: 0,
                        }));
                    }
                } catch (error) {
                    setFormData(prev => ({
                        ...prev,
                        clienteId: null,
                        clienteNombre: "",
                        clienteTipoDocumento: "",
                        formaPago: "",
                        clienteCupoActivo: false,
                        clienteCupoTotal: 0,
                    }));
                }
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setFormData(prev => ({
                ...prev,
                clienteId: null,
                clienteNombre: "",
                clienteTipoDocumento: "",
                formaPago: "",
                clienteCupoActivo: false,
                clienteCupoTotal: 0,
            }));
        }
    }, [formData.documento, clients]);

    // CARGAR SÓLO PRODUCTOS ACTIVOS Y CON STOCK AL INICIAR
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const allProducts = await ServicesProducts.get();

                const activos = allProducts.filter(
                    p => p.estado === true && p.stock > 0
                );

                setProducts(activos);
            } catch (error) {
                console.error("Error cargando productos:", error);
            }
        };

        loadProducts();
        ClientsService.get().then(setClients).catch(console.error);
    }, []);

    // FUNCIÓN DE VALIDACIÓN PARA CAMPOS INDIVIDUALES
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "documento":
                if (!value || !value.trim()) {
                    error = "El documento o cliente es obligatorio";
                } else if (!formData.clienteId) {
                    error = "Seleccione un cliente de la lista o verifique la cédula";
                }
                break;

            case "formaPago":
                if (!value) {
                    error = "La forma de pago es obligatoria";
                } else if (value === "Credito") {
                    if (!formData.clienteCupoActivo) {
                        error = "Este cliente no tiene cupo de crédito asignado. Asígnale uno desde el módulo de Clientes para poder fiarle.";
                    } else if (formData.clienteCupoTotal <= 0) {
                        error = "El cliente no tiene cupo disponible.";
                    } else if (formData.total > 0 && formData.total < 10000) {
                        error = "El total es inferior a $10.000. No se permiten pedidos a crédito por montos tan bajos; cóbralo de Contado.";
                    } else if (formData.total > formData.clienteCupoTotal) {
                        const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);
                        error = `El total del pedido (${formatCOP(formData.total)}) supera el cupo de crédito del cliente (${formatCOP(formData.clienteCupoTotal)}).`;
                    }
                }
                break;

            default:
                break;
        }

        return error;
    };

    // VALIDACIÓN ESPECIAL PARA CREDITO CUANDO CAMBIAN LOS CAMPOS RELACIONADOS
    useEffect(() => {
        if (formData.formaPago === "Credito") {
            const error = validateField("formaPago", "Credito");

            setErrors(prev => ({
                ...prev,
                formaPago: error
            }));
        }
    }, [
        formData.formaPago,
        formData.total,
        formData.clienteCupoActivo,
        formData.clienteCupoTotal
    ]);

    // MANEJADOR DE CAMBIOS CON ACTUALIZACIÓN DE FECHAS Y VALIDACIÓN
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "documento") {
            newValue = value.slice(0, 50);
        }

        if (name === "fechaPedido") {
            setFormData(prev => ({
                ...prev,
                fechaPedido: newValue,
                fechaVencimiento: calculateVencimiento(newValue)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }

        const error = validateField(name, newValue);

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

    const handleQuantityChange = (productId, newQuantity) => {
        const productInfo = products.find(p => (p.id || p._id) === productId);
        const maxStock = productInfo ? (productInfo.stock || 999999) : 999999;

        if (newQuantity === "") {
            setFormData(prev => {
                const up = prev.productos.map(p => p.id === productId ? { ...p, cantidad: "", subtotal: 0 } : p);
                const total = up.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
                const iva = total * 0.19;
                const subtotal = total - iva;
                return { ...prev, productos: up, subtotal, iva, total };
            });
            return;
        }

        let validQuantity = parseInt(newQuantity, 10);
        if (isNaN(validQuantity)) return;

        if (validQuantity > maxStock) {
            validQuantity = maxStock;
            if (onShowAlert) {
                onShowAlert(`La cantidad máxima disponible para ${productInfo?.nombre || 'este producto'} es ${maxStock}`);
            }
        }

        setFormData(prev => {
            const up = prev.productos.map(p => p.id === productId ? {
                ...p,
                cantidad: validQuantity,
                subtotal: validQuantity * p.precio
            } : p);
            const total = up.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
            const iva = total * 0.19;
            const subtotal = total - iva;
            return { ...prev, productos: up, subtotal, iva, total };
        });
    };

    const handleQuantityBlur = (productId) => {
        setFormData(prev => {
            const up = prev.productos.map(p => {
                if (p.id === productId) {
                    const num = parseInt(p.cantidad, 10);
                    if (isNaN(num) || num < 1) {
                        return { ...p, cantidad: 1, subtotal: 1 * p.precio };
                    }
                }
                return p;
            });
            const total = up.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
            const iva = total * 0.19;
            const subtotal = total - iva;
            return { ...prev, productos: up, subtotal, iva, total };
        });
    };

    // FUNCION PARA QUE CAMBIEN LOS VALORES SUBTOTAL, IVA Y TOTAL AL ELIMINAR UN PRODUCTO DE LA TABLA
    useEffect(() => {
        const total = formData.productos.reduce((acc, p) => acc + p.subtotal, 0);
        const iva = total * 0.19;
        const subtotal = total - iva;

        setFormData(prev => ({
            ...prev,
            subtotal,
            iva,
            total
        }));
    }, [formData.productos]);

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


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // PROCESAMIENTO DEL ENVÍO DEL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        // DETENER LA EJECUCIÓN SI EL FORMULARIO NO ES VÁLIDO
        if (!validateForm()) return;

        try {
            setLoading(true);

            // PREPARAR LOS DATOS EN EL FORMATO QUE ESPERA EL BACKEND
            const orderData = {
                documentNumber: formData.documento,
                client: formData.clienteId,
                orderDate: formData.fechaPedido,
                paymentMethod: formData.formaPago,

                products: formData.productos.map(product => ({
                    product: product.id,
                    quantity: product.cantidad
                }))
            };

            // ENVIAR LOS DATOS AL SERVICIO PARA CREAR EL PEDIDO
            const nuevoPedido = await ServicesOrders.createOrder(orderData);

            onSuccess(nuevoPedido);

        } catch (error) {
            console.error(error);
            setErrors(prev => ({ ...prev, submit: error.message || "Error al crear el pedido" }));
        }
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData,
        products,
        clients,
        addProduct,
        handleQuantityChange,
        handleQuantityBlur,
        currentPage,
        setCurrentPage,
        totalPages,
        currentProducts,
        indexOfFirstItem,
        itemsPerPage,
        paymentOptions,
        loading
    };
}