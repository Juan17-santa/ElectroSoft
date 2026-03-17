import { useEffect, useState } from "react";
import { ServicesOrders } from "../services/ServicesOrders";
import { ClientsService } from "../../Clients/services/ClientsService";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { SalesService } from "../../SalesManagement/services/SalesService";

// HOOK PERSONALIZADO PARA GESTIONAR LA LÓGICA DE LA TABLA DE PEDIDOS
export function useOrdersTable(searchTerm, currentPage, recordsPerPage) {

    // ESTADO PARA GUARDAR LA LISTA DE PEDIDOS
    const [orders, setOrders] = useState([]);

    // CARGAR PEDIDOS DEL LOCALSTORAGE Y CRUZAR DATOS 
    useEffect(() => {
        const storedOrders = ServicesOrders.get().sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        const storedClients = ClientsService.get();

        // JOIN PARA UNIR CLIENTS Y ORDERS
        const formattedOrders = storedOrders.map(order => {

            // BUSCAR EL CLIENTE RELACIONADO POR ID
            const client = storedClients.find(
                client => client.id === order.clienteId
            );

            // CÁLCULO DINÁMICO DEL SUBTOTAL BASADO EN EL ARRAY DE PRODUCTOS
            const subtotal = order.productos?.reduce((acc, product) => {
                return acc + (product.subtotal || 0);
            }, 0) || 0;

            // IMPUESTO DEL 19%
            const iva = subtotal * 0.19;

            const total = subtotal + iva;

            return {
                ...order,
                nombreCliente: client ? `${client.nombres} ${client.apellidos}` : "Cliente no encontrado",
                tipoDocumento: client?.tipoDocumento || "",
                subtotal,
                iva,
                total
            };
        });

        setOrders(formattedOrders);

    }, []);

    // FILTRADO
    const filteredOrders = orders.filter(order => {
        const query = searchTerm?.toLowerCase() || "";

        // CONVERSIÓN DE VALORES NUMÉRICOS Y FECHAS A STRING PARA LA BÚSQUEDA
        const totalStr = order.total?.toString() || "";

        const fechaCreacionStr = order.fechaCreacion
            ? new Date(order.fechaCreacion).toLocaleDateString('es-CO')
            : "";

        const fechaVencimientoStr = order.fechaVencimiento
            ? new Date(order.fechaVencimiento).toLocaleDateString('es-CO')
            : "";

        // RETORNA TRUE SI CUALQUIER CAMPO COINCIDE CON LA BÚSQUEDA
        return (
            order.nombreCliente?.toLowerCase().includes(query) ||
            order.tipoDocumento?.toLowerCase().includes(query) ||
            order.documento?.toLowerCase().includes(query) ||
            order.formaPago?.toLowerCase().includes(query) ||
            order.estado?.toLowerCase().includes(query) ||
            totalStr.includes(query) ||
            fechaCreacionStr.includes(query) ||
            fechaVencimientoStr.includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);

    // FUNCION PARA ANULAR PEDIDO Y DEVOLVER STOCK
    const cancelOrder = (orderToCancel, motivo, fechaAnulacion) => {

        // SI YA ESTA ANULADO NO HACER NADA
        if (orderToCancel.estado === "Anulado") {
            return;
        }

        const storedOrders = ServicesOrders.get();
        const storedProducts = ServicesProducts.get();

        // DEVOLVER STOCK
        const updatedProducts = storedProducts.map(product => {

            const productInOrder = orderToCancel.productos.find(
                p => p.id === product.id
            );

            if (productInOrder) {
                return {
                    ...product,
                    stock: product.stock + productInOrder.cantidad
                };
            }

            return product;
        });

        // ACTUALIZAR PRODUCTOS EN LOCALSTORAGE
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // ACTUALIZAR ESTADO DEL PEDIDO Y AGREGAR INFO DE CANCELACIÓN
        const updatedOrders = storedOrders.map(order =>
            order.id === orderToCancel.id
                ? {
                    ...order,
                    estado: "Anulado",
                    cancelInfo: {
                        motivo,
                        fechaAnulacion
                    }
                }
                : order
        );

        localStorage.setItem("orders", JSON.stringify(updatedOrders));

        // ACTUALIZAR EL ESTADO LOCAL PARA REFLEJAR CAMBIOS EN LA UI
        setOrders(prev =>
            prev.map(order =>
                order.id === orderToCancel.id
                    ? {
                        ...order,
                        estado: "Anulado",
                        cancelInfo: {
                            motivo,
                            fechaAnulacion
                        }
                    }
                    : order
            )
        );
    };

    // FUNCION PARA CONVERTIR PEDIDO EN VENTA PROCESADA
    const processOrderToSale = (order) => {
        const storedOrders = ServicesOrders.get();

        const saleData = {
            numeroDocumento: order.documento,
            tipoVenta: order.formaPago,
            fecha: new Date().toISOString().split('T')[0],
            estado: order.formaPago === "Contado" ? "Finalizado" : "Vigente",
            productos: order.productos.map(p => ({
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad
            }))
        };

        SalesService.create(saleData);

        // ── FIX BUG 1: SalesService ya descontó el stock otra vez, lo revertimos
        const storedProducts = ServicesProducts.get();
        const restoredProducts = storedProducts.map(product => {
            const productInOrder = order.productos.find(p => p.nombre === product.nombre);
            return productInOrder
                ? { ...product, stock: product.stock + productInOrder.cantidad }
                : product;
        });
        localStorage.setItem("products", JSON.stringify(restoredProducts));

        // FIX BUG 2: sumar el total al totalCompras del cliente ← ESTO FALTABA
        const storedClients = ClientsService.get();
        const updatedClients = storedClients.map(client =>
            client.id === order.clienteId
                ? { ...client, totalCompras: (Number(client.totalCompras) || 0) + order.total }
                : client
        );
        localStorage.setItem("clients", JSON.stringify(updatedClients));
        // ────────────────────────────────────────────────────────────────────────

        const updatedOrders = storedOrders.filter(o => o.id !== order.id);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    // RETORNO DE LAS PROPIEDADES Y FUNCIONES NECESARIAS PARA EL COMPONENTE
    return {
        data: currentRecords,
        totalPages,
        cancelOrder,
        processOrderToSale
    };
}