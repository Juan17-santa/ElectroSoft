import { useState, useEffect, useCallback } from "react";
import { ServicesDevolutions } from "../services/ServicesDevolutions";

export function useDevolutions(ventasMap = null) {
    const [devolutions, setDevolutions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const recargar = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await ServicesDevolutions.getAll();
            setDevolutions(data);
            return data;
        } catch (err) {
            setError(err.message);
            setDevolutions([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        recargar();
    }, [recargar]);

    const devolucionesFiltradas = devolutions.filter((d) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        
        let formattedDate = "";
        if (d.fechaDevolucion && /^\d{4}-\d{2}-\d{2}/.test(d.fechaDevolucion)) {
            const [y, m, day] = d.fechaDevolucion.split("-");
            formattedDate = `${day}/${m}/${y}`;
        }

        let formattedEstadoDate = "";
        if (d.fechaEstado && /^\d{4}-\d{2}-\d{2}/.test(d.fechaEstado)) {
            const [y, m, day] = d.fechaEstado.split("-");
            formattedEstadoDate = `${day}-${m}-${y}`;
        }

        const numeroVenta = d.idVenta && ventasMap ? String(ventasMap[d.idVenta] ?? "") : "";

        return (
            String(d.id ?? "").toLowerCase().includes(term) ||
            String(d.idVenta ?? "").toLowerCase().includes(term) ||
            numeroVenta.toLowerCase().includes(term) ||
            String(d.motivo ?? "").toLowerCase().includes(term) ||
            String(d.producto ?? "").toLowerCase().includes(term) ||
            String(d.responsable ?? "").toLowerCase().includes(term) ||
            String(d.estadoResolucion ?? "").toLowerCase().includes(term) ||
            String(d.fechaDevolucion ?? "").toLowerCase().includes(term) ||
            formattedDate.includes(term) ||
            formattedEstadoDate.includes(term)
        );
    });

    const guardarDevolucion = async (data) => {
        setError(null);
        const nueva = await ServicesDevolutions.create(data);
        await recargar();
        return nueva;
    };

    const editarDevolucion = async (data) => {
        setError(null);
        const updated = await ServicesDevolutions.update(data.id, data);
        setDevolutions((prev) =>
            prev.map((d) => (String(d.id) === String(updated.id) ? updated : d)),
        );
        return updated;
    };

    const anularDevolucion = async (id) => {
        setError(null);
        const updated = await ServicesDevolutions.anular(id);
        setDevolutions((prev) =>
            prev.map((d) => (String(d.id) === String(id) ? updated : d)),
        );
        return updated;
    };

    const anularPorVenta = async (idVenta) => {
        setError(null);
        const devolucionesVenta = await ServicesDevolutions.getBySaleId(idVenta);
        const anulables = devolucionesVenta.filter((d) => d.estadoResolucion !== "Anulada");

        // Si alguna devolución quedó en estado final, la tanda completa no se puede anular (R2)
        const conEstadoFinal = anulables.some((d) =>
            ["RESUELTO", "RECHAZADA"].includes(d.estadoResolucion),
        );
        if (conEstadoFinal) {
            throw new Error(
                "No se puede anular la tanda: hay devoluciones en estado final (RESUELTO o RECHAZADA).",
            );
        }

        const anuladas = await Promise.all(
            anulables.map((d) => ServicesDevolutions.anular(d.id)),
        );

        setDevolutions((prev) =>
            prev.map((d) => {
                const updated = anuladas.find((item) => String(item.id) === String(d.id));
                return updated || d;
            }),
        );

        return anuladas;
    };

    const getDevolucionById = async (id) => ServicesDevolutions.getById(id);

    return {
        devolutions,
        devolucionesFiltradas,
        searchTerm,
        setSearchTerm,
        loading,
        error,
        guardarDevolucion,
        editarDevolucion,
        anularDevolucion,
        anularPorVenta,
        getDevolucionById,
        recargar,
    };
}
