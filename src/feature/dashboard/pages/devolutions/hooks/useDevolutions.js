import { useState, useEffect, useCallback, useRef } from "react";
import { ServicesDevolutions } from "../services/ServicesDevolutions";

export const ITEMS_PER_PAGE = 6;
const SEARCH_DEBOUNCE_MS = 300;

export function useDevolutions() {
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Guarda anti-race: ignora respuestas de peticiones obsoletas.
    const requestIdRef = useRef(0);
    // Debounce de búsqueda.
    const searchTimerRef = useRef(null);

    const recargar = useCallback(async ({ page: p = 1, search: s = "" } = {}) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(null);
        try {
            const result = await ServicesDevolutions.getAll({
                page: p,
                limit: ITEMS_PER_PAGE,
                search: s,
            });
            if (requestId !== requestIdRef.current) return { groups: [], total: 0, totalPages: 1 };
            setGroups(result.groups);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            return result;
        } catch (err) {
            if (requestId !== requestIdRef.current) return { groups: [], total: 0, totalPages: 1 };
            const message = err.message || "No se pudieron cargar las devoluciones.";
            setError(message);
            setGroups([]);
            setTotal(0);
            setTotalPages(1);
            return { groups: [], total: 0, totalPages: 1 };
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        recargar({ page: 1, search: "" });
        return () => {
            requestIdRef.current += 1;
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [recargar]);

    const handleSearchChange = useCallback((term) => {
        setSearchTerm(term);
        setPage(1);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            recargar({ page: 1, search: term });
        }, SEARCH_DEBOUNCE_MS);
    }, [recargar]);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        recargar({ page: newPage, search: searchTerm });
    }, [recargar, searchTerm]);

    const guardarDevolucion = useCallback(async (data) => {
        setError(null);
        const nueva = await ServicesDevolutions.create(data);
        setPage(1);
        await recargar({ page: 1, search: searchTerm });
        return nueva;
    }, [recargar, searchTerm]);

    const editarDevolucion = useCallback(async (data) => {
        setError(null);
        const updated = await ServicesDevolutions.update(data.id, data);
        await recargar({ page, search: searchTerm });
        return updated;
    }, [recargar, page, searchTerm]);

    const anularDevolucion = useCallback(async (id) => {
        setError(null);
        const updated = await ServicesDevolutions.anular(id);
        await recargar({ page, search: searchTerm });
        return updated;
    }, [recargar, page, searchTerm]);

    const anularPorVenta = useCallback(async (idVenta) => {
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

        await recargar({ page, search: searchTerm });

        return anuladas;
    }, [recargar, page, searchTerm]);

    const getDevolucionById = useCallback((id) => ServicesDevolutions.getById(id), []);

    return {
        groups,
        searchTerm,
        setSearchTerm: handleSearchChange,
        page,
        total,
        totalPages,
        loading,
        error,
        guardarDevolucion,
        editarDevolucion,
        anularDevolucion,
        anularPorVenta,
        getDevolucionById,
        recargar,
        handlePageChange,
    };
}
