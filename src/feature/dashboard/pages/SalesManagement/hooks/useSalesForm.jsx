import { useState, useEffect } from "react";
import { ServicesProducts } from "../../../products/services/ServicesProducts";
import { ClientsService } from "../../../Clients/services/ClientsService";
import { Validations } from "../../../../../utils/validations";

export function useSalesForm({ onSubmit }) {
    const defaultData = {
        numeroDocumento: "",
        tipoVenta: "Contado",
        diasPlazo: "",
        fecha: (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        })(),
        estado: "Finalizado"
    };

    const [formData, setFormData] = useState(defaultData);
    const [tocado, setTocado] = useState({ numeroDocumento: false, fecha: false, tipoVenta: false, diasPlazo: false });
    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    const [productos, setProductos] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [clienteNombre, setClienteNombre] = useState("");
    const [productosError, setProductosError] = useState("");

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            estado: prev.tipoVenta === "Contado" ? "Finalizado" : "Vigente"
        }));
    }, [formData.tipoVenta]);

    useEffect(() => {
        setAvailableProducts(ServicesProducts.get().filter(p => p.estado));
        ClientsService.get().then(setClients).catch(console.error);
    }, []);

    const validarDocumentoCliente = (documento) => {
        const vBasica = Validations.validarNumeroVenta(documento);
        if (!vBasica.valido) return { ...vBasica, cliente: null };

        if (documento && clients.length > 0) {
            const cliente = clients.find(c => c.documento === documento);
            if (!cliente) return { valido: false, mensaje: "El cliente no existe.", cliente: null };
            return { ...vBasica, cliente };
        }
        return { ...vBasica, cliente: null };
    };

    const resultadoDoc = validarDocumentoCliente(formData.numeroDocumento);
    const totalComprasCliente = Number(resultadoDoc.cliente?.totalCompras) || 0;

    useEffect(() => {
        if (totalComprasCliente <= 1000000 && formData.tipoVenta === "Credito") {
            setFormData(prev => ({ ...prev, tipoVenta: "Contado" }));
        }
    }, [totalComprasCliente]);

    useEffect(() => {
        if (!formData.numeroDocumento) {
            setClienteNombre("");
            return;
        }
        const found = clients.find(c => c.documento === formData.numeroDocumento);
        setClienteNombre(found ? `${found.nombres} ${found.apellidos}` : "");
    }, [formData.numeroDocumento, clients]);

    const opcionesTipoVenta = totalComprasCliente > 1000000
        ? [
            { value: "Contado", label: "Contado" },
            { value: "Credito", label: "Crédito" }
        ]
        : [
            { value: "Contado", label: "Contado" }
        ];

    const getAvailableStock = (product) => {
        const productInSale = productos.find(p => p.nombre === product.nombre);
        const usedStock = productInSale ? productInSale.cantidad : 0;
        return (product.stock || 0) - usedStock;
    };

    const handleSaveProduct = (selectedProduct, quantity) => {
        setProductos(prev => {
            const index = prev.findIndex(p => p.nombre === selectedProduct.nombre);
            if (index >= 0) {
                const sumQty = prev[index].cantidad + quantity;
                if (sumQty > (selectedProduct.stock || 0)) {
                    setProductosError(`Stock insuficiente para ${selectedProduct.nombre}.`);
                    return prev;
                }
                const newArr = [...prev];
                newArr[index] = { ...newArr[index], cantidad: sumQty };
                setProductosError("");
                return newArr;
            }
            setProductosError("");
            return [...prev, {
                id: Date.now(),
                idProducto: selectedProduct.id,
                nombre: selectedProduct.nombre,
                cantidad: quantity,
                precio: selectedProduct.precio
            }];
        });
    };

    const handleProductChange = (index, field, value) => {
        const newProductos = [...productos];
        const val = field === "cantidad" ? parseInt(value, 10) || 1 : value;

        if (field === "cantidad") {
            const productRef = availableProducts.find(ap => ap.nombre === newProductos[index].nombre);
            if (productRef && val > productRef.stock) {
                setProductosError(`Stock insuf. para ${productRef.nombre}. Máx: ${productRef.stock}`);
                return;
            } else {
                setProductosError("");
            }
        }

        newProductos[index][field] = val;
        setProductos(newProductos);
    };

    const handleRemoveProduct = (index) => {
        setProductos(productos.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "numeroDocumento") value = value.replace(/\D/g, "").slice(0, 10);
        if (name === "diasPlazo") {
            value = value.replace(/\D/g, "");
            if (value !== "" && Number(value) > 60) value = "60";
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        tocar(name);
    };

    const calcularTotales = () => {
        const total = productos.reduce((sum, p) => sum + p.cantidad * p.precio, 0);
        const iva = total * 0.19;
        const subtotal = total - iva;
        return { subtotal, iva, total };
    };

    const { subtotal, iva, total } = calcularTotales();

    const handleForm = (e) => {
        e.preventDefault();
        setTocado({ numeroDocumento: true, fecha: true, tipoVenta: true, diasPlazo: true });

        const vDoc = validarDocumentoCliente(formData.numeroDocumento);
        const vFech = Validations.campoRequerido(formData.fecha) ? { valido: true } : { valido: false };
        const isDiasPlazoValido = formData.tipoVenta === "Contado" || (formData.diasPlazo && Number(formData.diasPlazo) >= 0 && Number(formData.diasPlazo) <= 60);

        if (!vDoc.valido || !vFech.valido || !formData.tipoVenta || !isDiasPlazoValido) return;

        if (productos.length === 0) {
            setProductosError("Debe agregar al menos un producto.");
            return;
        }

        const datosVenta = {
            ...formData,
            diasPlazo: formData.tipoVenta === "Credito" ? Number(formData.diasPlazo) : null,
            cliente: clienteNombre,
            productos,
            subtotal,
            iva,
            total,
            montoPagado: formData.tipoVenta === "Contado" ? total : 0,
            montoPorPagar: formData.tipoVenta === "Contado" ? 0 : total
        };

        productos.forEach(p => {
            const currentProd = availableProducts.find(ap => ap.nombre === p.nombre);
            if (currentProd) {
                ServicesProducts.update({ ...currentProd, stock: currentProd.stock - p.cantidad });
            }
        });

        onSubmit(datosVenta, total);
    };

    const resetForm = () => {
        setFormData(defaultData);
        setProductos([]);
        setTocado({ numeroDocumento: false, fecha: false, tipoVenta: false });
        setClienteNombre("");
        setProductosError("");
    };

    return {
        formData, tocado, handleChange, handleSelectChange, handleForm, resetForm,
        productos, handleSaveProduct, handleRemoveProduct, handleProductChange,
        clienteNombre, opcionesTipoVenta, getAvailableStock, availableProducts,
        subtotal, iva, total, productosError, setProductosError, estadoNumDoc: resultadoDoc,
        validarDocumentoCliente
    };
}
