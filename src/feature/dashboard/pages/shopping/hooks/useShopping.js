import { useCallback, useEffect, useMemo, useState } from "react";
import { ServicesShopping } from "../services/ServicesShopping";

function matchesSearch(compra, term) {
    if (!term) return true;
    return (
        String(compra.proveedor || "").toLowerCase().includes(term) ||
        String(compra.numeroFactura || "").toLowerCase().includes(term) ||
        String(compra.fechaCompra || "").toLowerCase().includes(term) ||
        String(compra.estado || "").toLowerCase().includes(term)
    );
}

function getRemainingHours(fechaCreacion) {
    const createdAt = new Date(fechaCreacion);
    if (Number.isNaN(createdAt.getTime())) return 0;
    const elapsed = (new Date() - createdAt) / (1000 * 60 * 60);
    return Math.max(0, 48 - Math.floor(elapsed));
}

export function useShopping() {
    const [compras, setCompras] = useState(() => ServicesShopping.get());
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [error, setError] = useState("");
    const [cancelStatusById, setCancelStatusById] = useState({});

    const cargarCompras = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const comprasApi = await ServicesShopping.fetchAll();
            setCompras(comprasApi);
            return comprasApi;
        } catch (err) {
            const message = err.message || "No se pudieron cargar las compras.";
            setError(message);
            return ServicesShopping.get();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarCompras();
    }, [cargarCompras]);

    const comprasFiltradas = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return compras.filter((compra) => matchesSearch(compra, term));
    }, [compras, searchTerm]);

    const guardarCompra = useCallback(async (compra) => {
        setSaving(true);
        setError("");
        try {
            const compraCreada = await ServicesShopping.createRemote(compra);
            const comprasActualizadas = await ServicesShopping.fetchAll();
            setCompras(comprasActualizadas);
            return compraCreada;
        } catch (err) {
            const message = err.message || "No se pudo registrar la compra.";
            setError(message);
            throw new Error(message);
        } finally {
            setSaving(false);
        }
    }, []);

    const validarAnulacion = useCallback((compra) => {
        const cached = cancelStatusById[String(compra.id)];
        if (cached) {
            return {
                ...cached,
                horasRestantes: cached.puedeAnularse ? getRemainingHours(compra.fechaCreacion) : 0,
            };
        }

        if (compra.estado !== "Activo") {
            return {
                puedeAnularse: false,
                razon: "Solo se pueden anular compras activas.",
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
        if (!compra?.id || compra.estado !== "Activo") return null;

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
    }, []);

    useEffect(() => {
        compras
            .filter((compra) => compra.estado === "Activo" && !cancelStatusById[String(compra.id)])
            .forEach((compra) => {
                cargarEstadoAnulacion(compra);
            });
    }, [compras, cancelStatusById, cargarEstadoAnulacion]);

    const handleAnular = useCallback(async (id) => {
        setCanceling(true);
        setError("");
        try {
            const compraAnulada = await ServicesShopping.cancelRemote(id);
            const comprasActualizadas = await ServicesShopping.fetchAll();
            setCompras(comprasActualizadas);
            setCancelStatusById((prev) => ({
                ...prev,
                [String(id)]: {
                    puedeAnularse: false,
                    razon: "La compra ya fue anulada.",
                },
            }));
            return { compra: compraAnulada, advertencias: [] };
        } catch (err) {
            const message = err.message || "No se pudo anular la compra.";
            setError(message);
            throw new Error(message);
        } finally {
            setCanceling(false);
        }
    }, []);

    const getCompraById = useCallback((id) =>
        compras.find((compra) => String(compra.id) === String(id)) || null,
    [compras]);

    return {
        compras,
        comprasFiltradas,
        searchTerm,
        setSearchTerm,
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
    };
}
