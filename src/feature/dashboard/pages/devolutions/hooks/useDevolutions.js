import { useState, useEffect } from "react";
import { ServicesDevolutions } from "../services/ServicesDevolutions";

export function useDevolutions() {
    const [devolutions, setDevolutions] = useState([]);
    const [searchTerm, setSearchTerm]   = useState("");

    useEffect(() => {
        setDevolutions(ServicesDevolutions.get());
    }, []);

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

    const guardarDevolucion = (data) => {
        const nueva = ServicesDevolutions.create(data);
        setDevolutions((prev) => [...prev, nueva]);
        return nueva;
    };

    const editarDevolucion = (data) => {
        ServicesDevolutions.update(data);
        setDevolutions((prev) =>
            prev.map((d) => String(d.id) === String(data.id) ? { ...d, ...data } : d)
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
        getDevolucionById,
    };
}