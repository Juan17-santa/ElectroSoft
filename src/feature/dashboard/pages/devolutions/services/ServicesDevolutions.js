const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEVOLUTIONS_URL = `${API_BASE}/devolutions`;

function getToken() {
    const directToken =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

    if (directToken) return directToken;

    try {
        const authUser = JSON.parse(localStorage.getItem("auth_user") || "null");
        return authUser?.token || authUser?.accessToken || null;
    } catch {
        return null;
    }
}

function getHeaders() {
    const token = getToken();
    if (!token) {
        throw new Error("Tu sesión no tiene token de acceso. Inicia sesión nuevamente para cargar devoluciones.");
    }

    return {
        "Content-Type": "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
}

async function request(path = "", options = {}) {
    const response = await fetch(`${DEVOLUTIONS_URL}${path}`, {
        ...options,
        headers: {
            ...getHeaders(),
            ...(options.headers || {}),
        },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(body.error || body.message || "No se pudo completar la solicitud");
    }

    return body.data ?? body;
}

function toDateOnly(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return new Date(value).toISOString().split("T")[0];
}

function getFirstProduct(devolution) {
    return devolution.productos?.[0] ?? {};
}

function normalizeDevolution(devolution) {
    if (!devolution) return null;

    const product = getFirstProduct(devolution);
    const createdAt = devolution.fechaCreacion || devolution.creadoEn || "";
    const updatedAt = devolution.actualizadoEn || createdAt;

    return {
        ...devolution,
        id: devolution._id || devolution.id,
        idVenta: devolution.saleId || devolution.idVenta || "",
        saleId: devolution.saleId || devolution.idVenta || "",
        productoId: product.productoId || devolution.productoId || "",
        producto: product.nombre || devolution.producto || "",
        cantidad: product.cantidad ?? devolution.cantidad ?? "",
        motivo: product.motivo || devolution.motivo || "",
        submotivo: product.submotivo || devolution.submotivo || "",
        condicionProducto: product.condicionProducto || devolution.condicionProducto || "",
        gestion: product.gestion || devolution.gestion || "",
        responsable: product.responsable || devolution.responsable || "",
        garantiaProveedor:
            product.garantiaProveedor ?? devolution.garantiaProveedor ?? null,
        montoReembolso:
            product.montoReembolso ?? devolution.montoReembolso ?? null,
        descripcion: product.descripcion || devolution.descripcion || "",
        observaciones: product.observaciones || devolution.observaciones || "",
        fechaDevolucion: toDateOnly(devolution.fechaDevolucion),
        fechaEstado: toDateOnly(updatedAt || devolution.fechaDevolucion),
        estadoResolucion:
            devolution.estadoResolucion ||
            (devolution.anulada ? "Anulada" : "CREADA"),
        historialEstados: devolution.historialEstados || [],
        creadoEn: createdAt,
        actualizadoEn: updatedAt,
    };
}

function toApiPayload(data) {
    const producto = data.productos?.[0] || data;

    return {
        saleId: data.saleId || data.idVenta,
        fechaDevolucion: data.fechaDevolucion,
        estadoResolucion: data.estadoResolucion || "CREADA",
        productos: [
            {
                productoId: producto.productoId,
                nombre: producto.nombre || producto.producto,
                cantidad: Number(producto.cantidad),
                motivo: producto.motivo,
                submotivo: producto.submotivo || "",
                condicionProducto: producto.condicionProducto || "",
                gestion: producto.gestion || "",
                responsable: producto.responsable || "",
                garantiaProveedor:
                    producto.garantiaProveedor === undefined
                        ? null
                        : producto.garantiaProveedor,
                descripcion: producto.descripcion || "",
                observaciones: producto.observaciones || "",
                montoReembolso:
                    producto.montoReembolso === undefined
                        ? null
                        : Number(producto.montoReembolso),
            },
        ],
    };
}

export const ServicesDevolutions = {
    async getAll() {
        const devolutions = await request("");
        return (Array.isArray(devolutions) ? devolutions : []).map(normalizeDevolution);

    },

    async getById(id) {
        return normalizeDevolution(await request(`/${id}`));
    },

    async getBySaleId(saleId) {
        const devolutions = await request(`/sale/${saleId}`);
        return (Array.isArray(devolutions) ? devolutions : []).map(normalizeDevolution);
    },

    async create(data) {
        return normalizeDevolution(
            await request("", {
                method: "POST",
                body: JSON.stringify(toApiPayload(data)),
            }),
        );
    },

    async createBatch(saleId, devoluciones) {
        const result = await request("/batch", {
            method: "POST",
            body: JSON.stringify({ saleId, devoluciones: devoluciones.map(toApiPayload) }),
        });
        return (Array.isArray(result) ? result : []).map(normalizeDevolution);
    },

    async update(id, data) {
        const { idVenta, saleId, productos, productoId, producto, fechaCreacion, creadoEn, ...editable } =
            data;

        return normalizeDevolution(
            await request(`/${id}`, {
                method: "PATCH",
                body: JSON.stringify(editable),
            }),
        );
    },

    async anular(id) {
        return normalizeDevolution(
            await request(`/${id}/anular`, {
                method: "PATCH",
                body: JSON.stringify({}),
            }),
        );
    },

    async delete(id) {
        return this.anular(id);
    },
};
