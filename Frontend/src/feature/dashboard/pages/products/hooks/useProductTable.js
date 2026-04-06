/*
useProductTable

Hook personalizado encargado de gestionar las acciones interactivas asociadas a la tabla 
de productos.

Este hook centraliza la lógica relacionada con operaciones como eliminación y cambio de estado,
manteniendo el componente de la tabla completamente libre de lógica de negocio.

Responsabilidades:
✔ Gestionar la lógica de eliminación de productos
✔ Gestionar la lógica de cambio de estado (activo / inactivo)
✔ Configurar y activar cuadros de confirmación
✔ Actualizar el estado global o local de productos
✔ Disparar alertas de éxito tras operaciones completadas

Dependencias:
- ServicesProducts → Para ejecutar operaciones de eliminación y actualización
- setProducts → Para actualizar la lista renderizada en la tabla
- setConfirmData → Para controlar el modal de confirmación
- showAlert → Para mostrar notificaciones visuales
*/

import { ServicesProducts } from "../services/ServicesProducts";
import { SalesService } from "../../SalesManagement/services/SalesService";
import { ServicesOrders } from "../../orders/services/ServicesOrders";

// HOOK PERSONALIZADO PARA MANEJAR LAS ACCIONES DE LA TABLA DE PRODUCTOS
export default function useProductTable({
    setProducts,
    setConfirmData,
    showAlert,
}) {

    // FUNCION PARA VERIFICAR SI UN PRODUCTO TIENE VENTAS O PEDIDOS ASOCIADOS
    const hasProductAssociations = (productName) => {
        try {
            // Obtener todas las ventas
            const sales = SalesService.get();
            const hasSales = sales.some(sale => 
                sale.productos && sale.productos.some(p => p.nombre === productName)
            );

            if (hasSales) return { hasAssociations: true, type: "venta" };

            // Obtener todas las órdenes
            const orders = ServicesOrders.get();
            const hasOrders = orders.some(order => 
                order.productos && order.productos.some(p => p.nombre === productName)
            );

            if (hasOrders) return { hasAssociations: true, type: "pedido" };

            return { hasAssociations: false };
        } catch (error) {
            console.error("Error verificando asociaciones:", error);
            return { hasAssociations: false };
        }
    };

    // FUNCION PARA ELIMINAR UN PRODUCTO
    const deleteProduct = (id) => {
        const productToDelete = ServicesProducts.getById(id);
        
        if (!productToDelete) {
            showAlert("error", "Producto no encontrado");
            return;
        }

        // Verificar si el producto tiene ventas o pedidos asociados
        const { hasAssociations, type } = hasProductAssociations(productToDelete.nombre);

        if (hasAssociations) {
            const typeText = type === "venta" ? "una venta" : "un pedido";
            showAlert(
                "error", 
                `No se puede eliminar este producto porque tiene ${typeText} asociada. Elimine o modifique las ${type === "venta" ? "ventas" : "órdenes"} relacionadas primero.`
            );
            return;
        }

        setConfirmData({
            type: "delete",
            title: "Eliminar producto",
            message: "¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServicesProducts.delete(id);

                setProducts(updated);
                setConfirmData(null);

                showAlert("success", "Producto eliminado con éxito");
            },
            oncancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UN PRODUCTO
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del producto",
            message: "¿Seguro que deseas cambiar el estado de este producto?",
            onConfirm: () => {
                const updated = ServicesProducts.toggleEstado(id);

                setProducts(updated);
                setConfirmData(null);

                showAlert(
                    "success",
                    "Estado del producto actualizado con éxito"
                );
            },
            oncancel: () => setConfirmData(null),
        });
    };

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        deleteProduct,
        toggleEstado,
    };
}
