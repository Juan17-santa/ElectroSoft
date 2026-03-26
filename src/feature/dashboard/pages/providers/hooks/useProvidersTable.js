import { ServicesProviders } from "../services/ServicesProviders";
import { ServicesShopping } from "../../shopping/services/ServicesShopping";
import { useState, useEffect } from "react";

// HOOK PERSONALIZADO PARA GESTONAR LA LOGICA DE LA TABLA DE PROVEEDORES
export default function useProvidersTable({
    setConfirmData,
    showAlert,
    searchTerm,
    currentPage,
    recordsPerPage
}) {

    // ESTADO PARA OBTENER LOS PROVEEDORES
    const [providers, setProviders] = useState([]);

    // AL CARGAR COMPONENTE CARGAR LOS PROVEEDORES
    useEffect(() => {
        const storedProviders = ServicesProviders.get()
        setProviders(storedProviders);
    }, [])

    // FUNCION PARA ELIMINAR UN PROVEEDOR
    const deleteProvider = (id) => {

        const providerToDelete = providers.find(p => p.id === id);

        if (!providerToDelete) {
            showAlert("error", "Proveedor no encontrado");
            return;
        }

        // OBTENER TODAS LAS COMPRAS
        const compras = ServicesShopping.get();

        // BUSCAR CUALQUIER COMPRA (SIN IMPORTAR ESTADO)
        const comprasAsociadas = compras.filter(compra =>
            String(compra.proveedorId) === String(id)
        );

        // BLOQUEAR SI EXISTE AL MENOS UNA
        if (comprasAsociadas.length > 0) {
            showAlert(
                "error",
                `No se puede eliminar: Este proveedor tiene ${comprasAsociadas.length} compra(s) asociada(s).`
            );
            return;
        }

        // CONFIRMAR ELIMINACIÓN
        setConfirmData({
            type: "delete",
            title: "Eliminar proveedor",
            message:
                "¿Seguro que deseas eliminar este proveedor? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updated = ServicesProviders.delete(id);

                setProviders(updated);
                setConfirmData(null);

                showAlert("success", "Proveedor eliminado con éxito");
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FUNCION PARA CAMBIAR EL ESTADO DE UN PROVEEDOR
    const toggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del proveedor",
            message:
                "¿Seguro que deseas cambiar el estado de este proveedor?",
            onConfirm: () => {
                const updated = ServicesProviders.toggleEstado(id);

                setProviders(updated);
                setConfirmData(null);

                showAlert(
                    "success",
                    "Estado del proveedor actualizado con éxito"
                );
            },
            onCancel: () => setConfirmData(null),
        });
    };

    // FILTRADO DEL BUSCADOR
    const filteredProviders = providers.filter(pro => {
        const query = searchTerm.toLowerCase();
        const telefono = pro.telefonoContacto ? String(pro.telefonoContacto) : "";

        return (
            pro.nombreProveedor?.toLowerCase().includes(query) ||
            pro.tipoDoc?.toLowerCase().includes(query) ||
            pro.documento?.toLowerCase().includes(query) ||
            pro.nombreContacto?.toLowerCase().includes(query) ||
            telefono.includes(query) ||
            (pro.estado ? "activo" : "inactivo").includes(query)
        );
    });

    // LOGICA DE PAGINACION
    const totalPages = Math.ceil(filteredProviders.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filteredProviders.slice(firstIndex, lastIndex);

    // RETORNAMOS LAS FUNCIONES PARA USAR EN LA TABLA
    return {
        data: currentRecords,
        totalPages,
        deleteProvider,
        toggleEstado,
    };
}