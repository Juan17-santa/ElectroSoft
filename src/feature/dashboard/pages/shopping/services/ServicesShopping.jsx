const SHOPPING_KEY = "compras";
const PRODUCTS_KEY = "products";
const PROVIDERS_KEY = "providers";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:4000/api"
).replace(/\/$/, "");

const formatCOP = (value) => "$" + Number(value || 0).toLocaleString("es-CO");
const roundToNextHundred = (value) => Math.ceil(Number(value || 0) / 100) * 100;

function readStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

function getMessageFromResponse(payload, fallback) {
    return payload?.error || payload?.message || fallback;
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(getMessageFromResponse(payload, "No se pudo completar la solicitud."));
    }

    return payload;
}

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
        tipoDoc: provider.tipoDoc ?? provider.documentType ?? "",
        documentType: provider.documentType ?? provider.tipoDoc ?? "",
        documento: provider.documento ?? provider.document ?? "",
        document: provider.document ?? provider.documento ?? "",
        nombreProveedor: provider.nombreProveedor ?? provider.providerName ?? "",
        providerName: provider.providerName ?? provider.nombreProveedor ?? "",
        nombreContacto: provider.nombreContacto ?? provider.contactName ?? "",
        contactName: provider.contactName ?? provider.nombreContacto ?? "",
        telefonoContacto: provider.telefonoContacto ?? provider.contactPhone ?? "",
        contactPhone: provider.contactPhone ?? provider.telefonoContacto ?? "",
        categoriasAsociadas: provider.categoriasAsociadas ?? provider.categoriesAssociated ?? [],
        categoriesAssociated: provider.categoriesAssociated ?? provider.categoriasAsociadas ?? [],
        estado: provider.estado ?? provider.status ?? true,
        status: provider.status ?? provider.estado ?? true,
    };
}

function normalizeEstado(estado) {
    if (estado === "ACTIVA") return "Activo";
    if (estado === "ANULADA") return "Anulada";
    return estado || "Activo";
}

function normalizeBackendEstado(estado) {
    if (estado === "Activo") return "ACTIVA";
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
    const products = catalogs.products || readStorage(PRODUCTS_KEY).map(normalizeProduct);
    const providers = catalogs.providers || readStorage(PROVIDERS_KEY).map(normalizeProvider);

    // El backend devuelve providerId (inglés), pero el frontend trabaja con proveedorId (español)
    const proveedorId = String(
        shopping.providerId?._id ?? shopping.providerId
        ?? shopping.proveedorId?._id ?? shopping.proveedorId ?? ""
    );
    const provider = providers.find((item) => String(item.id) === proveedorId);
    const totalNumber = Number(shopping.total ?? 0);

    // El backend devuelve products[] (inglés), pero el frontend trabaja con productos[] (español)
    const rawProducts = shopping.products || shopping.productos || [];

    const productos = rawProducts.map((item) => {
        const productId = String(
            item.productId?._id ?? item.productId
            ?? item.productoId?._id ?? item.productoId ?? item.id ?? ""
        );
        const product = products.find((stored) => String(stored.id) === productId);
        const precioCompra = Number(item.purchasePrice ?? item.precioCompra ?? item.costeProducto ?? 0);
        const precioVenta = Number(item.salePrice ?? item.precioVenta ?? product?.precio ?? 0);
        const cantidad = Number(item.quantity ?? item.cantidad ?? 0);

        return {
            ...item,
            id: productId,
            productoId: productId,
            nombre: item.nombre ?? product?.nombre ?? "Producto no encontrado",
            cantidad,
            precio: Number(product?.precio ?? precioVenta),
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
        proveedor: shopping.proveedor ?? provider?.nombreProveedor ?? "Proveedor no encontrado",
        iva: formatCOP(Math.round(totalNumber * 0.19)),
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
        products: productos.map((product) => ({
            productId: product.productoId ?? product.id,
            quantity: Number(product.cantidad),
            purchasePrice: Number(product.precioCompra ?? product.costeProducto),
            // salePrice siempre debe ser el precio original ingresado por el usuario,
            // ya que el Backend lo usa en la fórmula de costo promedio ponderado (WAC).
            salePrice: Number(product.precioVentaOriginal ?? product.precioVenta),
            useSuggestedPrice: product.usarPrecioSugerido === true || product.sobreescribirConSugerido === true,
        })),
    };
}

export const ServicesShopping = {
    getApiBaseUrl() {
        return API_BASE_URL;
    },

    get() {
        return readStorage(SHOPPING_KEY);
    },

    getById(id) {
        return this.get().find((shopping) => String(shopping.id) === String(id)) || null;
    },

    saveAll(compras) {
        return saveStorage(SHOPPING_KEY, compras);
    },

    create(nuevaCompra) {
        const compras = this.get();
        const updated = [...compras, nuevaCompra];
        this.saveAll(updated);
        return nuevaCompra;
    },

    update(compraActualizada) {
        const compras = this.get();
        const updated = compras.map((shopping) =>
            String(shopping.id) === String(compraActualizada.id)
                ? { ...shopping, ...compraActualizada }
                : shopping
        );
        this.saveAll(updated);
        return compraActualizada;
    },

    async fetchProducts() {
        const payload = await request("/products");
        const products = (payload?.data || []).map(normalizeProduct);
        saveStorage(PRODUCTS_KEY, products);
        return products;
    },

    async fetchProviders() {
        const payload = await request("/providers");
        const providers = (payload?.data || []).map(normalizeProvider);
        saveStorage(PROVIDERS_KEY, providers);
        return providers;
    },

    async fetchCategories() {
        const payload = await request("/productCategory");
        return (payload?.data || []).map(normalizeCategory);
    },

    async fetchDocumentTypes() {
        const payload = await request("/documentTypes");
        return (payload?.data || []).map(normalizeDocumentType);
    },

    async fetchCatalogs() {
        const [products, providers] = await Promise.all([
            this.fetchProducts(),
            this.fetchProviders(),
        ]);
        return { products, providers };
    },

    async fetchAll() {
        const catalogs = await this.fetchCatalogs();
        const payload = await request("/shopping");
        const compras = (payload?.data || []).map((shopping) => normalizeShopping(shopping, catalogs));
        this.saveAll(compras);
        return compras;
    },

    async fetchById(id) {
        const catalogs = await this.fetchCatalogs();
        const payload = await request(`/shopping/${id}`);
        const compra = normalizeShopping(payload?.data, catalogs);
        this.update(compra);
        return compra;
    },

    async createRemote(compra) {
        const payload = await request("/shopping", {
            method: "POST",
            body: JSON.stringify(toShoppingPayload(compra)),
        });
        const catalogs = await this.fetchCatalogs();
        await this.fetchProducts();
        const compraNormalizada = normalizeShopping(payload?.data, catalogs);
        this.create(compraNormalizada);
        return compraNormalizada;
    },

    async createProduct(producto) {
        const payload = await request("/products", {
            method: "POST",
            body: JSON.stringify({
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
            }),
        });
        const product = normalizeProduct(payload?.data);
        await this.fetchProducts();
        return product;
    },

    async createProvider(provider) {
        const payload = await request("/providers", {
            method: "POST",
            body: JSON.stringify({
                documentType: provider.tipoDoc,
                document: provider.documento,
                providerName: provider.nombreProveedor,
                contactName: provider.nombreContacto,
                contactPhone: provider.telefonoContacto,
                categoriesAssociated: provider.categoriasAsociadas || [],
            }),
        });
        const createdProvider = normalizeProvider(payload?.data);
        await this.fetchProviders();
        return createdProvider;
    },

    async cancelRemote(id) {
        const payload = await request(`/shopping/${id}/cancel`, { method: "PATCH" });
        const catalogs = await this.fetchCatalogs();
        await this.fetchProducts();
        const compraNormalizada = normalizeShopping(payload?.data, catalogs);
        this.update(compraNormalizada);
        return compraNormalizada;
    },

    async getCancellationStatus(id) {
        const payload = await request(`/shopping/${id}/cancellation-status`);
        return {
            puedeAnularse: payload?.puedeAnularse === true,
            razon: payload?.razon || "",
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
