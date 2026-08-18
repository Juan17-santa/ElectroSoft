import api from "../../../../../utils/api.js";

const formatCOP = (value) => "$" + Number(value || 0).toLocaleString("es-CO");
const roundToNextHundred = (value) => Math.ceil(Number(value || 0) / 100) * 100;

function getId(entity) {
    return String(entity?._id ?? entity?.id ?? "");
}

function normalizeProduct(product = {}) {
    const id = getId(product);
    const price = Number(product.price ?? product.precio ?? 0);
    return {
        ...product,
        id,
        _id: product._id ?? id,
        nombre: product.nombre ?? product.name ?? "",
        name: product.name ?? product.nombre ?? "",
        categoriaId: product.categoriaId ?? product.categoryId?._id ?? product.categoryId ?? "",
        precio: price,
        price,
        stock: Number(product.stock ?? 0),
        tipoStock: product.tipoStock ?? product.typeStock ?? "unidad",
        typeStock: product.typeStock ?? product.tipoStock ?? "unidad",
        serial: product.serial ?? "",
        garantia: product.garantia ?? product.warranty ?? "",
        warranty: product.warranty ?? product.garantia ?? "",
        caracteristicas: product.caracteristicas ?? product.characteristics ?? [],
        characteristics: product.characteristics ?? product.caracteristicas ?? [],
        estado: product.estado ?? product.status ?? true,
        status: product.status ?? product.estado ?? true,
        costoPromedio: Number(product.costoPromedio ?? product.averageCost ?? price),
    };
}

function normalizeProvider(provider = {}) {
    const id = getId(provider);
    return {
        ...provider,
        id,
        _id: provider._id ?? id,
        providerType: provider.providerType ?? "NATURAL",
        documentType: provider.documentType ?? "",
        documento: provider.document ?? provider.documento ?? "",
        document: provider.document ?? provider.documento ?? "",
        nombreProveedor: provider.providerName ?? provider.nombreProveedor ?? "",
        providerName: provider.providerName ?? provider.nombreProveedor ?? "",
        providerPhone: provider.providerPhone ?? "",
        providerEmail: provider.providerEmail ?? "",
        address: provider.address ?? "",
        contactName: provider.contactName ?? "",
        contactEmail: provider.contactEmail ?? "",
        contactPhone: provider.contactPhone ?? "",
        categoriasAsociadas: provider.categoriesAssociated ?? provider.categoriasAsociadas ?? [],
        categoriesAssociated: provider.categoriesAssociated ?? provider.categoriasAsociadas ?? [],
        estado: provider.status ?? provider.estado ?? true,
        status: provider.status ?? provider.estado ?? true,
    };
}

function normalizeEstado(estado) {
    if (estado === "ACTIVA") return "Completada";
    if (estado === "ANULADA") return "Anulada";
    return estado || "Completada";
}

function normalizeBackendEstado(estado) {
    if (estado === "Completada") return "ACTIVA";
    if (estado === "Anulada") return "ANULADA";
    return estado;
}

function normalizeCategory(category = {}) {
    const id = getId(category);
    return {
        ...category,
        id,
        _id: category._id ?? id,
        nombre: category.nombre ?? category.name ?? "",
        name: category.name ?? category.nombre ?? "",
        descripcion: category.descripcion ?? category.description ?? "",
        estado: category.estado ?? category.status ?? true,
        status: category.status ?? category.estado ?? true,
    };
}

function normalizeDocumentType(documentType = {}) {
    const id = getId(documentType);
    return {
        ...documentType,
        id,
        _id: documentType._id ?? id,
        nombre: documentType.nombre ?? documentType.name ?? "",
        name: documentType.name ?? documentType.nombre ?? "",
        abbreviation: documentType.abbreviation ?? documentType.abreviatura ?? "",
    };
}

function normalizeShopping(shopping = {}, catalogs = {}) {
    const products = catalogs.products || [];
    const providers = catalogs.providers || [];

    // El backend devuelve providerId (inglés) poblado con { _id, providerName }.
    // El frontend trabaja con proveedorId (español).
    const proveedorId = String(
        shopping.providerId?._id ?? shopping.providerId
        ?? shopping.proveedorId?._id ?? shopping.proveedorId ?? ""
    );
    const provider = providers.find((item) => String(item.id) === proveedorId);
    const providerNombre = shopping.providerId?.providerName
        ?? shopping.proveedor
        ?? provider?.nombreProveedor
        ?? "Proveedor no encontrado";
    const totalNumber = Number(shopping.total ?? 0);

    // El backend devuelve products[] (inglés), pero el frontend trabaja con productos[] (español)
    const rawProducts = shopping.products || shopping.productos || [];

    const productos = rawProducts.map((item) => {
        const productId = String(
            item.productId?._id ?? item.productId
            ?? item.productoId?._id ?? item.productoId ?? item.id ?? ""
        );
        const product = products.find((stored) => String(stored.id) === productId);
        const nombreProducto = item.nombre
            ?? item.productId?.name
            ?? product?.nombre
            ?? "Producto no encontrado";
        const precioInventario = product?.precio ?? item.productId?.price;
        const precioCompra = Number(item.purchasePrice ?? item.precioCompra ?? item.costeProducto ?? 0);
        const precioVenta = Number(item.appliedPrice ?? item.salePrice ?? item.precioVenta ?? precioInventario ?? 0);
        const cantidad = Number(item.quantity ?? item.cantidad ?? 0);

        return {
            ...item,
            id: productId,
            productoId: productId,
            nombre: nombreProducto,
            cantidad,
            precio: Number(precioInventario ?? precioVenta),
            costeProducto: precioCompra,
            precioCompra,
            precioVenta,
            subtotal: cantidad * precioCompra,
            usarPrecioSugerido: item.useSuggestedPrice === true || item.usarPrecioSugerido === true,
            sobreescribirConSugerido: item.useSuggestedPrice === true || item.usarPrecioSugerido === true,
        };
    });

    // El backend devuelve invoiceNumber (inglés), purchaseDate, createdAt, cancelledAt
    // El frontend trabaja internamente con numeroFactura, fechaCompra, fechaCreacion, anuladaEn
    const invoiceNumber = shopping.invoiceNumber ?? shopping.numeroFactura ?? "";
    const purchaseDate = shopping.purchaseDate ?? shopping.fechaCompra ?? "";
    const createdAt = shopping.createdAt ?? shopping.fechaCreacion ?? new Date(0).toISOString();
    const cancelledAt = shopping.cancelledAt ?? shopping.anuladaEn ?? null;

    return {
        ...shopping,
        id: getId(shopping),
        _id: shopping._id ?? getId(shopping),
        numeroFactura: String(invoiceNumber),
        fechaCompra: purchaseDate,
        proveedorId,
        proveedor: providerNombre,
        iva: formatCOP(Math.round(totalNumber * 0.19)),
        subtotal: formatCOP(Math.round(totalNumber) - Math.round(totalNumber * 0.19)),
        total: formatCOP(Math.round(totalNumber)),
        totalNumerico: totalNumber,
        estado: normalizeEstado(shopping.estado),
        estadoBackend: normalizeBackendEstado(shopping.estado),
        productos,
        fechaCreacion: createdAt,
        anuladaEn: cancelledAt,
        infoAnulacion: shopping.infoAnulacion ?? (
            cancelledAt
                ? { motivo: "Anulada desde backend", fechaAnulacion: cancelledAt }
                : null
        ),
        impactApplied: shopping.impactApplied === true,
    };
}

function toShoppingPayload({ numeroFactura, fechaFactura, proveedorId, productos }) {
    return {
        invoiceNumber: String(numeroFactura || "").trim(),
        purchaseDate: fechaFactura,
        providerId: proveedorId,
        products: productos.map((product) => {
            const entry = {
                productId: product.productoId ?? product.id,
                quantity: Number(product.cantidad),
                purchasePrice: Number(product.precioCompra ?? product.costeProducto),
                // salePrice siempre debe ser el precio original ingresado por el usuario,
                // ya que el Backend lo usa en la fórmula de costo promedio ponderado (WAC).
                salePrice: Number(product.precioVentaOriginal ?? product.precioVenta),
                // appliedPrice es el precio que efectivamente se aplica al inventario
                // (WAC si se eligió promedio, o el ingresado si se eligió sugerido).
                appliedPrice: product.appliedPrice != null
                    ? Number(product.appliedPrice)
                    : (product.precioVenta != null ? Number(product.precioVenta) : null),
                useSuggestedPrice: product.usarPrecioSugerido === true || product.sobreescribirConSugerido === true,
            };
            if (product.isNew && product.newProduct) {
                entry.newProduct = product.newProduct;
            }
            return entry;
        }),
    };
}

export const ServicesShopping = {
    async fetchProducts() {
        const payload = (await api.get("/products")).data;
        return (payload?.data || []).map(normalizeProduct);
    },

    async fetchProviders() {
        const payload = (await api.get("/providers")).data;
        return (payload?.data || []).map(normalizeProvider);
    },

    async fetchCategories() {
        const payload = (await api.get("/productCategory")).data;
        return (payload?.data || []).map(normalizeCategory);
    },

    async fetchDocumentTypes() {
        const payload = (await api.get("/documentTypes")).data;
        return (payload?.data || []).map(normalizeDocumentType);
    },

    async fetchCatalogs() {
        const [products, providers] = await Promise.all([
            this.fetchProducts(),
            this.fetchProviders(),
        ]);
        return { products, providers };
    },

    async fetchAll({ page = 1, limit = 15, search = "" } = {}) {
        const params = {};
        params.page = String(page);
        params.limit = String(limit);
        if (search) params.search = String(search).trim();

        const payload = (await api.get("/shopping", { params })).data;
        const data = (payload?.data || []).map((shopping) => normalizeShopping(shopping));
        return {
            data,
            pagination: payload?.pagination || { page, limit, total: data.length, totalPages: 1 },
        };
    },

    async fetchById(id) {
        const payload = (await api.get(`/shopping/${id}`)).data;
        return normalizeShopping(payload?.data);
    },

    async createRemote(compra) {
        const payload = (await api.post("/shopping", toShoppingPayload(compra))).data;
        return normalizeShopping(payload?.data);
    },

    async createProduct(producto) {
        const payload = (await api.post("/products", {
            name: producto.nombre,
            categoryId: producto.categoriaId,
            price: Number(producto.precio),
            stock: Number(producto.stock),
            typeStock: producto.tipoStock || "unidad",
            serial: producto.serial,
            warranty: producto.garantia,
            characteristics: (producto.caracteristicas || []).map((item) => ({
                name: item.nombre ?? item.name,
                unit: item.medida ?? item.unit ?? "-",
                value: item.valor ?? item.value ?? "",
                visible: item.visible !== false,
            })),
        })).data;
        return normalizeProduct(payload?.data);
    },

    async createProvider(provider) {
        const payload = (await api.post("/providers", {
            providerType: provider.providerType,
            documentType: provider.documentType,
            document: provider.document,
            providerName: provider.providerName,
            providerPhone: provider.providerPhone,
            providerEmail: provider.providerEmail,
            address: provider.address,
            contactName: provider.contactName || undefined,
            contactEmail: provider.contactEmail || undefined,
            contactPhone: provider.contactPhone || undefined,
            categoriesAssociated: provider.categoriesAssociated || [],
        })).data;
        return normalizeProvider(payload?.data);
    },

    async cancelRemote(id, motivo = null) {
        const body = motivo ? { motivo } : {};
        const payload = (await api.patch(`/shopping/${id}/cancel`, body)).data;
        return normalizeShopping(payload?.data);
    },

    async getCancellationStatus(id) {
        const payload = (await api.get(`/shopping/${id}/cancellation-status`)).data;
        return {
            puedeAnularse: payload?.puedeAnularse === true,
            razon: payload?.razon || "",
        };
    },

    /**
     * Verifica si un número de factura ya existe en una compra activa.
     * Retorna true si ya existe, false si está libre.
     */
    async checkInvoiceExists(numeroFactura) {
        try {
            const number = String(numeroFactura || "").trim();
            if (!number) return false;
            const payload = (await api.get(`/shopping/invoice-exists/${encodeURIComponent(number)}`)).data;
            return payload?.exists === true;
        } catch {
            return false;
        }
    },

    /**
     * Verifica si un campo único de proveedor (documento/email) ya está registrado.
     * Retorna { exists, field, message } o null si hubo error.
     */
    async checkProviderUnique(data) {
        try {
            const payload = (await api.post("/providers/check-unique", data)).data;
            return payload || { exists: false };
        } catch {
            return null;
        }
    },

    /**
     * Exporta las compras por rango de fecha de factura (purchaseDate) de forma
     * paginada (el backend filtra; el cliente descarga por lotes).
     * Retorna { data, pagination }.
     */
    async exportReport({ from, to, search = "", page = 1, limit = 5000 } = {}) {
        const params = { page: String(page), limit: String(limit) };
        if (from) params.from = from;
        if (to) params.to = to;
        if (search) params.search = String(search).trim();

        const payload = (await api.get("/shopping/export", { params })).data;
        const data = payload?.data ?? [];
        return {
            data: (Array.isArray(data) ? data : []).map((shopping) => normalizeShopping(shopping)),
            pagination: payload?.pagination || { page, limit, total: 0, totalPages: 1 },
        };
    },

    calculateWac({ stockAnterior, precioAnterior, cantidad, precioVenta }) {
        const stockPrevio = Number(stockAnterior) || 0;
        const cantidadEntrada = Number(cantidad) || 0;
        const stockNuevo = stockPrevio + cantidadEntrada;
        if (stockNuevo <= 0) return 0;
        const exacto = stockPrevio > 0
            ? ((stockPrevio * Number(precioAnterior || 0)) + (cantidadEntrada * Number(precioVenta || 0))) / stockNuevo
            : Number(precioVenta || 0);
        return roundToNextHundred(exacto);
    },

    normalizeProduct,
    normalizeProvider,
    normalizeCategory,
    normalizeDocumentType,
    normalizeShopping,
};
