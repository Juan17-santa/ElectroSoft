import { useState, useEffect } from "react";
import { formatCOP } from "../helpers/shoppingHelpers";

/**
 * Hook centralizado para el módulo de compras.
 * Maneja: carga desde localStorage, guardado, anulación y búsqueda.
 */
export function useShopping() {
    const [compras, setCompras] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem("compras");
        if (stored) setCompras(JSON.parse(stored));
    }, []);

    // ─── Filtrado ──────────────────────────────────────────────────────────────
    const comprasFiltradas = compras.filter((c) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
            c.proveedor.toLowerCase().includes(term) ||
            c.numeroFactura.toLowerCase().includes(term) ||
            c.fechaCompra.toLowerCase().includes(term) ||
            c.estado.toLowerCase().includes(term)
        );
    });

    // ─── Acciones ──────────────────────────────────────────────────────────────

    /** Guarda una nueva compra en localStorage */
    const guardarCompra = ({ numeroFactura, fechaFactura, proveedor, total, productos }) => {
        const nuevaCompra = {
            id: Date.now(),
            numeroFactura,
            fechaCompra: fechaFactura,
            proveedor,
            total: formatCOP(Math.round(total)),
            estado: "Activo",
            productos,
        };

        const updated = [...compras, nuevaCompra];
        localStorage.setItem("compras", JSON.stringify(updated));
        setCompras(updated);
    };

    /** Cambia el estado de una compra a "Anulada" */
    const handleAnular = (id) => {
        const updated = compras.map((c) =>
            c.id === id ? { ...c, estado: "Anulada" } : c
        );
        setCompras(updated);
        localStorage.setItem("compras", JSON.stringify(updated));
    };

    /** Busca una compra por su id (útil para ShoppingDetails) */
    const getCompraById = (id) =>
        compras.find((c) => String(c.id) === String(id)) || null;

    return {
        compras,
        comprasFiltradas,
        searchTerm,
        setSearchTerm,
        guardarCompra,
        handleAnular,
        getCompraById,
    };
}