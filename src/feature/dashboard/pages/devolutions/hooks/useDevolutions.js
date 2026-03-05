import { useState, useEffect } from "react";
import { ServicesDevolutions } from "../services/ServicesDevolutions";

/**
 * Hook centralizado para el módulo de devoluciones.
 * Maneja: carga desde localStorage, guardado, edición, anulación y búsqueda.
 */
export function useDevolutions() {
    const [devolutions, setDevolutions] = useState([]);
    const [searchTerm, setSearchTerm]   = useState("");

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        setDevolutions(ServicesDevolutions.get());
    }, []);

    // ─── Filtrado ──────────────────────────────────────────────────────────────
    const devolucionesFiltradas = devolutions.filter((d) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
            String(d.id).toLowerCase().includes(term)                ||
            (d.idVenta           || "").toLowerCase().includes(term) ||
            (d.motivo            || "").toLowerCase().includes(term) ||
            (d.producto          || "").toLowerCase().includes(term) ||
            (d.responsable       || "").toLowerCase().includes(term) ||
            (d.estadoResolucion  || "").toLowerCase().includes(term) ||
            (d.fecha             || "").toLowerCase().includes(term)
        );
    });

    // ─── Acciones ──────────────────────────────────────────────────────────────

    /** Guarda una nueva devolución */
    const guardarDevolucion = (data) => {
        const nueva = ServicesDevolutions.create(data);
        setDevolutions((prev) => [...prev, nueva]);
        return nueva;
    };

    /** Actualiza una devolución existente */
    const editarDevolucion = (data) => {
        ServicesDevolutions.update(data);
        setDevolutions((prev) =>
            prev.map((d) => String(d.id) === String(data.id) ? { ...d, ...data } : d)
        );
    };

    /** Cambia el estadoResolucion a "Anulada" */
    const anularDevolucion = (id) => {
        ServicesDevolutions.anular(id);
        setDevolutions((prev) =>
            prev.map((d) =>
                String(d.id) === String(id)
                    ? { ...d, estadoResolucion: "Anulada" }
                    : d
            )
        );
    };

    /** Busca una devolución por id */
    const getDevolucionById = (id) =>
        devolutions.find((d) => String(d.id) === String(id)) || null;

    return {
        devolutions,
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        guardarDevolucion,
        editarDevolucion,
        anularDevolucion,
        getDevolucionById,
    };
}