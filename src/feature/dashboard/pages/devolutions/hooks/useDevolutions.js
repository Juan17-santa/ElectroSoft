import { useState, useEffect } from "react";
import { ServicesDevolutions } from "../services/ServicesDevolutions";

export function useDevolutions() {
    const [devolutions, setDevolutions] = useState([]);
    const [searchTerm, setSearchTerm]   = useState("");

    const recargar = () => {
        setDevolutions(ServicesDevolutions.get());
    };

    useEffect(() => {
        recargar();
    }, []);

    const devolucionesFiltradas = devolutions.filter((d) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
            String(d.id              ?? "").toLowerCase().includes(term) ||
            String(d.idVenta         ?? "").toLowerCase().includes(term) ||
            String(d.motivo          ?? "").toLowerCase().includes(term) ||
            String(d.producto        ?? "").toLowerCase().includes(term) ||
            String(d.responsable     ?? "").toLowerCase().includes(term) ||
            String(d.estadoResolucion ?? "").toLowerCase().includes(term) ||
            String(d.fecha           ?? "").toLowerCase().includes(term)
        );
    });

    const guardarDevolucion = (data) => {
        const nueva = ServicesDevolutions.create(data);
        setDevolutions((prev) => [...prev, nueva]);
        return nueva;
    };

    const editarDevolucion = (data) => {
        ServicesDevolutions.update(data);
        const hoy   = new Date().toISOString().split("T")[0];
        const ahora = new Date().toISOString();
        setDevolutions((prev) =>
            prev.map((d) =>
                String(d.id) === String(data.id)
                    ? { ...d, ...data, fechaEstado: hoy, actualizadoEn: ahora }
                    : d
            )
        );
    };

    const eliminarDevolucion = (id) => {
        ServicesDevolutions.delete(id);
        setDevolutions((prev) => prev.filter((d) => String(d.id) !== String(id)));
    };

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

    /** Anula todas las devoluciones de una venta */
    const anularPorVenta = (idVenta) => {
        ServicesDevolutions.anularByIdVenta(idVenta);
        setDevolutions((prev) =>
            prev.map((d) =>
                String(d.idVenta) === String(idVenta)
                    ? { ...d, estadoResolucion: "Anulada" }
                    : d
            )
        );
    };

    const getDevolucionById = (id) =>
        devolutions.find((d) => String(d.id) === String(id)) || null;

    return {
        devolutions,
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        guardarDevolucion,
        editarDevolucion,
        eliminarDevolucion,
        anularDevolucion,
        anularPorVenta,
        getDevolucionById,
        recargar,
    };
}