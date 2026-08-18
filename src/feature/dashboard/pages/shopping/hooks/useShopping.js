import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ServicesShopping } from "../services/ServicesShopping";

export const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function getRemainingHours(fechaCreacion) {
    const createdAt = new Date(fechaCreacion);
    if (Number.isNaN(createdAt.getTime())) return 0;
    const elapsed = (new Date() - createdAt) / (1000 * 60 * 60);
    return Math.max(0, 48 - Math.floor(elapsed));
}

export function useShopping() {
    const [compras, setCompras] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [error, setError] = useState("");
    const [cancelStatusById, setCancelStatusById] = useState({});

    // Guarda anti-race: ignora respuestas de peticiones obsoletas.
    const requestIdRef = useRef(0);
    // Debounce de búsqueda.
    const searchTimerRef = useRef(null);

    const cargarCompras = useCallback(async ({ page: p = 1, search: s = "" } = {}) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError("");
        try {
            const result = await ServicesShopping.fetchAll({
                page: p,
                limit: ITEMS_PER_PAGE,
                search: s,
            });
            if (requestId !== requestIdRef.current) return [];
            setCompras(result.data);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
            return result.data;
        } catch (err) {
            if (requestId !== requestIdRef.current) return [];
            const message = err.message || "No se pudieron cargar las compras.";
            setError(message);
            return [];
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarCompras({ page: 1, search: "" });
        return () => {
            requestIdRef.current += 1;
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [cargarCompras]);

    const handleSearchChange = useCallback((term) => {
        setSearchTerm(term);
        setPage(1);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            cargarCompras({ page: 1, search: term });
        }, SEARCH_DEBOUNCE_MS);
    }, [cargarCompras]);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        cargarCompras({ page: newPage, search: searchTerm });
    }, [cargarCompras, searchTerm]);

    const guardarCompra = useCallback(async (compra) => {
        setSaving(true);
        setError("");
        try {
            const compraCreada = await ServicesShopping.createRemote(compra);
            setPage(1);
            await cargarCompras({ page: 1, search: searchTerm });
            return compraCreada;
        } catch (err) {
            const message = err.message || "No se pudo registrar la compra.";
            setError(message);
            throw new Error(message);
        } finally {
            setSaving(false);
        }
    }, [cargarCompras, searchTerm]);

    const validarAnulacion = useCallback((compra) => {
        const cached = cancelStatusById[String(compra.id)];
        if (cached) {
            return {
                ...cached,
                horasRestantes: cached.puedeAnularse ? getRemainingHours(compra.fechaCreacion) : 0,
            };
        }

        if (compra.estado !== "Completada") {
            return {
                puedeAnularse: false,
                razon: "Solo se pueden anular compras completadas.",
                horasRestantes: 0,
            };
        }

        return {
            puedeAnularse: true,
            razon: "",
            horasRestantes: getRemainingHours(compra.fechaCreacion),
        };
    }, [cancelStatusById]);

    const cargarEstadoAnulacion = useCallback(async (compra) => {
        if (!compra?.id || compra.estado !== "Completada") return null;
        if (cancelStatusById[String(compra.id)]) return cancelStatusById[String(compra.id)];

        try {
            const status = await ServicesShopping.getCancellationStatus(compra.id);
            setCancelStatusById((prev) => ({
                ...prev,
                [String(compra.id)]: status,
            }));
            return status;
        } catch (err) {
            const status = {
                puedeAnularse: false,
                razon: err.message || "No se pudo validar la anulacion.",
            };
            setCancelStatusById((prev) => ({
                ...prev,
                [String(compra.id)]: status,
            }));
            return status;
        }
    }, [cancelStatusById]);

    // Consulta el estado de anulación solo de las compras de la página visible.
    // El cache por id evita re-peticiones al volver a una misma página.
    useEffect(() => {
        compras
            .filter((compra) => compra.estado === "Completada" && !cancelStatusById[String(compra.id)])
            .forEach((compra) => {
                cargarEstadoAnulacion(compra);
            });
    }, [compras, cancelStatusById, cargarEstadoAnulacion]);

    const handleAnular = useCallback(async (id, motivo = null) => {
        setCanceling(true);
        setError("");
        try {
            const compraAnulada = await ServicesShopping.cancelRemote(id, motivo);
            setCancelStatusById((prev) => ({
                ...prev,
                [String(id)]: {
                    puedeAnularse: false,
                    razon: "La compra ya fue anulada.",
                },
            }));
            await cargarCompras({ page: page, search: searchTerm });
            return { compra: compraAnulada, advertencias: [] };
        } catch (err) {
            const message = err.message || "No se pudo anular la compra.";
            setError(message);
            throw new Error(message);
        } finally {
            setCanceling(false);
        }
    }, [cargarCompras, page, searchTerm]);

    const getCompraById = useCallback((id) =>
        compras.find((compra) => String(compra.id) === String(id)) || null,
    [compras]);

    const pagination = useMemo(
        () => ({ page, total, totalPages, itemsPerPage: ITEMS_PER_PAGE }),
        [page, total, totalPages],
    );

    return {
        compras,
        searchTerm,
        setSearchTerm: handleSearchChange,
        page,
        total,
        totalPages,
        pagination,
        loading,
        saving,
        canceling,
        error,
        clearError: () => setError(""),
        cargarCompras,
        guardarCompra,
        handleAnular,
        getCompraById,
        validarAnulacion,
        cargarEstadoAnulacion,
        handlePageChange,
    };
}
