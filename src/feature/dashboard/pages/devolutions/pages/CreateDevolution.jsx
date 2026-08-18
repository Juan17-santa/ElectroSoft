import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal          from "../../../components/ui/ConfirmModal";
import { useToast }          from "../../../../../context/ToastContext";
import {
    SUBMOTIVOS,
    getGestionesPermitidas,
    getResponsableAuto,
    calcularReembolsoTotal,
} from "../helpers/devolutionsHelpers";

import { fetchSales } from "../services/fetchSales";

function normalizeSale(sale) {
    return {
        ...sale,
        id: sale._id || sale.id,
        estado: sale.estado === "ANULADA" ? "Anulado" : sale.estado,
        fecha: sale.fecha || sale.fechaVenta || sale.fechaCreacion?.slice?.(0, 10),
        numeroDocumento: sale.numeroDocumento || sale.numeroFactura || sale.clienteId?.documentNumber,
        cliente:
            sale.cliente ||
            [sale.clienteId?.firstName, sale.clienteId?.lastName].filter(Boolean).join(" "),
        productos: (sale.productos || []).map((producto) => ({
            ...producto,
            id: producto.id || producto.productoId?._id || producto.productoId || producto.producto?._id,
            productoId: producto.productoId?._id || producto.productoId || producto.id || producto.producto?._id,
            nombre: producto.nombre || producto.productoId?.name || producto.producto?.name || producto.name,
            precio: producto.precio || producto.precioUnitario || producto.productoId?.price || producto.producto?.price || 0,
            garantia: producto.garantia || producto.productoId?.warranty || 0,
        })),
    };
}

// ─── Estado vacío del formulario ──────────────────────────────────────────────
const EMPTY_FORM = (() => {
    const hoy   = new Date().toISOString().split("T")[0];
    return {
        idVenta:            "",
        motivo:             "",
        submotivo:          "",
        producto:           "",
        cantidad:           "",
        condicionProducto:  "",
        regresarAlInventario: true,
        gestion:            "",
        responsable:        "",
        garantiaProveedor:  null,
        montoReembolso:     "",
        descripcion:        "",
        observaciones:      "",
        fechaDevolucion:    hoy,
        estadoResolucion:   "CREADA",
    };
})();

const EMPTY_TOCADOS = {
    idVenta: false, motivo: false, submotivo: false, producto: false,
    cantidad: false, condicionProducto: false, gestion: false,
    montoReembolso: false, responsable: false, garantiaProveedor: false, descripcion: false,
    observaciones: false,
};

// ─── Validaciones ─────────────────────────────────────────────────────────────
function validarMotivo(val) {
    if (!val) return { valido: false, mensaje: "Selecciona el motivo." };
    return { valido: true, mensaje: "" };
}
function validarSubmotivo(val, motivo) {
    if (!motivo) return null;
    if (!val) return { valido: false, mensaje: "Selecciona el submotivo correspondiente." };
    const opciones = SUBMOTIVOS[motivo] || [];
    if (!opciones.includes(val)) return { valido: false, mensaje: "El submotivo no corresponde al motivo." };
    return { valido: true, mensaje: "" };
}
function validarProducto(val, idVenta) {
    if (!idVenta) return null;
    if (!val) return { valido: false, mensaje: "Selecciona el producto a devolver." };
    return { valido: true, mensaje: "" };
}
function validarCantidad(val, producto, idVenta, ventasList, devolucionesVenta = []) {
    if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
    const cantidad = Number(val);
    if (isNaN(cantidad) || cantidad <= 0) return { valido: false, mensaje: "La cantidad debe ser mayor a 0." };
    if (producto && idVenta) {
        const venta = ventasList.find((v) => String(v.id) === String(idVenta));
        const productoEnVenta = venta?.productos?.find((p) => p.nombre === producto);
        if (productoEnVenta) {
            const yaDevuelto = devolucionesVenta
                .filter((d) => d.estadoResolucion !== "Anulada" && d.productoId === productoEnVenta.productoId)
                .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
            const disponible = productoEnVenta.cantidad - yaDevuelto;
            if (cantidad > disponible)
                return { valido: false, mensaje: `Disponible para devolver: ${disponible} unidad${disponible !== 1 ? "es" : ""}.` };
        }
    }
    return { valido: true, mensaje: "" };
}
function validarCondicion(val, motivo) {
    if (!val) return { valido: false, mensaje: "Selecciona la condición del producto." };
    if (motivo === "GARANTIA" && val === "BUEN_ESTADO") return { valido: false, mensaje: "No se puede BUEN ESTADO con motivo GARANTÍA." };
    if (motivo === "CLIENTE" && val !== "BUEN_ESTADO") return { valido: false, mensaje: "Para devoluciones de cliente el producto debe estar en BUEN ESTADO." };
    return { valido: true, mensaje: "" };
}
function validarGestion(val, motivo, submotivo) {
    if (!val) return { valido: false, mensaje: "Selecciona la gestión." };
    if (motivo) {
        const permitidas = getGestionesPermitidas(motivo, submotivo);
        if (permitidas.length > 0 && !permitidas.includes(val))
            return { valido: false, mensaje: "Gestión no permitida para el motivo/submotivo elegido." };
    }
    return { valido: true, mensaje: "" };
}
function getMontoMaximoReembolso(form, ventasList) {
    const venta = ventasList.find((v) => String(v.id) === String(form.idVenta));
    const producto = venta?.productos?.find((p) => p.nombre === form.producto);
    return Number(form.cantidad || 0) * Number(producto?.precio || 0);
}
function validarMontoReembolso(form, ventasList) {
    if (form.gestion !== "REEMBOLSO_PARCIAL") return null;
    const monto = Number(form.montoReembolso);
    const maximo = getMontoMaximoReembolso(form, ventasList);
    if (!Number.isFinite(monto) || monto <= 0) {
        return { valido: false, mensaje: "Ingresa el monto parcial a reembolsar." };
    }
    if (monto < 100) {
        return { valido: false, mensaje: "El monto mínimo a reembolsar es $100." };
    }
    if (monto > 999999999) {
        return { valido: false, mensaje: "El monto no puede superar los 9 dígitos." };
    }
    if (maximo <= 0) {
        return { valido: false, mensaje: "Selecciona producto y cantidad para calcular el maximo." };
    }
    if (monto > maximo) {
        return { valido: false, mensaje: `El monto parcial no puede superar ${formatCOP(maximo)}.` };
    }
    return { valido: true, mensaje: "" };
}
function formatCOP(value) {
    return `$${Number(value || 0).toLocaleString("en-US")}`;
}
function validarResponsable(val, motivo, garantiaProveedor) {
    if (!val) return { valido: false, mensaje: "Selecciona el responsable." };
    if ((motivo === "LOGISTICA" || motivo === "CLIENTE") && val !== "EMPRESA") return { valido: false, mensaje: "Para este motivo el responsable debe ser EMPRESA." };
    if (motivo === "GARANTIA" && garantiaProveedor === true && val !== "PROVEEDOR") return { valido: false, mensaje: "Con garantía de proveedor el responsable debe ser PROVEEDOR." };
    if (motivo === "GARANTIA" && garantiaProveedor === false && val !== "EMPRESA") return { valido: false, mensaje: "Sin garantía de proveedor el responsable debe ser EMPRESA." };
    return { valido: true, mensaje: "" };
}
function validarGarantia(val, motivo) {
    if (motivo !== "GARANTIA") return null;
    if (val === null || val === undefined || val === "") return { valido: false, mensaje: "Indica si aplica garantía de proveedor." };
    return { valido: true, mensaje: "" };
}
function validarDescripcion(val) {
    if (!val || !val.trim()) return { valido: false, mensaje: "La descripción es obligatoria." };
    if (val.trim().length < 10) return { valido: false, mensaje: "Mínimo 10 caracteres en la descripción." };
    return { valido: true, mensaje: "" };
}
function validarObservaciones(val) {
    if (!val || !val.trim()) return { valido: false, mensaje: "Las observaciones son obligatorias." };
    return { valido: true, mensaje: "" };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CreateDevolution() {
    const navigate    = useNavigate();
    const location    = useLocation();
    const { guardarDevolucion } = useDevolutions();
    const { showToast } = useToast();

    // Si venimos desde ReturnSalesPage, tenemos idVenta y producto pre-cargados
    const idVentaPreCargado  = location.state?.idVenta        ?? null;
    const productoPreCargado = location.state?.productoNombre ?? null;
    const modeOrigen         = location.state?.mode           ?? "from-sales";
    const fromReturn         = !!idVentaPreCargado;

    const [form, setForm]                   = useState({
        ...EMPTY_FORM,
        idVenta: idVentaPreCargado  ?? "",
        producto: productoPreCargado ?? "",
    });
    const initialFormRef = useRef({ ...EMPTY_FORM, idVenta: idVentaPreCargado ?? "", producto: productoPreCargado ?? "" });
    const [tocados, setTocados]             = useState(EMPTY_TOCADOS);
    const [ventasList, setVentasList]       = useState([]);
    const [productosList, setProductosList] = useState([]);
    const [devolucionesVenta, setDevolucionesVenta] = useState([]);
    const [sinProductos, setSinProductos]   = useState(false);
    const [confirmData, setConfirmData]     = useState(null);
    const [garantiaVencidaMap, setGarantiaVencidaMap] = useState({});
    const [stockDisponible, setStockDisponible] = useState(null);

    useEffect(() => {
        let active = true;

        fetchSales()
            .then((ventas) => ventas.map(normalizeSale))
            .then((ventas) => {
                if (active) setVentasList(ventas.filter((v) => v.estado !== "Anulado"));
            })
            .catch((err) => {
                if (active) showToast("error", err.message);
            });

        return () => {
            active = false;
        };
    }, [showToast]);

    useEffect(() => {
        if (!form.idVenta) { setProductosList([]); setSinProductos(false); return; }
        const venta   = ventasList.find((v) => String(v.id) === String(form.idVenta));
        if (!venta?.productos) { setProductosList([]); setSinProductos(false); return; }

        // Calcular estado de garantía para cada producto
        const map = {};
        venta.productos.forEach((p) => {
            const meses = parseInt(p.garantia) || 0;
            if (meses > 0) {
                const fechaVenta = new Date(venta.fechaCreacion || venta.fecha);
                const fechaVencimiento = new Date(fechaVenta);
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);
                map[p.nombre] = new Date() > fechaVencimiento;
            } else {
                map[p.nombre] = false;
            }
        });
        setGarantiaVencidaMap(map);

        // Solo mostrar productos con cantidad aún disponible para devolver
        ServicesDevolutions.getBySaleId(form.idVenta)
            .then((devoluciones) => {
                const localDevsStr = localStorage.getItem(`pendingDevs_${form.idVenta}`);
                const localDevs = localDevsStr ? JSON.parse(localDevsStr) : [];
                const todasLasDevoluciones = [...devoluciones, ...localDevs];
                setDevolucionesVenta(todasLasDevoluciones);
        const conDisponible = venta.productos.filter((p) => {
            const devuelto = todasLasDevoluciones
                .filter((d) => d.estadoResolucion !== "Anulada" && d.productoId === p.productoId)
                .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
            return devuelto < p.cantidad;
        });
        setProductosList(conDisponible);
        setSinProductos(conDisponible.length === 0);

        if (form.producto && !conDisponible.find((p) => p.nombre === form.producto))
            setForm((prev) => ({ ...prev, producto: "" }));
            })
            .catch((err) => showToast("error", err.message));
    }, [form.idVenta, ventasList, form.producto, showToast]);

    const { idVenta: idVentaForm, producto: productoForm, gestion: gestionForm } = form;

    useEffect(() => {
        let active = true;
        const consultarStock = async () => {
            if (gestionForm !== "MISMO_PRODUCTO" || !productoForm || !idVentaForm) {
                setStockDisponible(null);
                return;
            }
            const venta = ventasList.find((v) => String(v.id) === String(idVentaForm));
            const producto = venta?.productos?.find((p) => p.nombre === productoForm);
            const productoId = producto?.productoId || producto?.id;
            if (!productoId) { setStockDisponible(null); return; }
            try {
                const prod = await ServicesProducts.getById(productoId);
                if (active) setStockDisponible(Number(prod?.stock) || 0);
            } catch {
                if (active) setStockDisponible(null);
            }
        };
        consultarStock();
        return () => { active = false; };
    }, [idVentaForm, productoForm, gestionForm, ventasList]);

    const handleChange = (field, value) => {
        let autoTouched = {};
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "motivo") {
                next.submotivo = ""; next.gestion = ""; next.condicionProducto = ""; next.garantiaProveedor = null; next.montoReembolso = "";
                if (value === "LOGISTICA" || value === "CLIENTE") { next.responsable = "EMPRESA"; autoTouched.responsable = true; }
                else next.responsable = "";
            }
            if (field === "submotivo") { next.gestion = ""; next.montoReembolso = ""; }
            if (field === "gestion" && value !== "REEMBOLSO_PARCIAL") next.montoReembolso = "";
            if (field === "garantiaProveedor" && prev.motivo === "GARANTIA") {
                next.responsable = getResponsableAuto("GARANTIA", value);
                autoTouched.responsable = true;
            }
            return next;
        });
        setTocados((prev) => ({ ...prev, [field]: true, ...autoTouched }));
    };

    const tocarCampo = (campo) => setTocados((prev) => ({ ...prev, [campo]: true }));
    const tocarTodo  = () => setTocados(Object.fromEntries(Object.keys(EMPTY_TOCADOS).map((k) => [k, true])));

    const estadoCampo = (campo) => {
        if (!tocados[campo]) return null;
        switch (campo) {
            case "motivo":            return validarMotivo(form.motivo);
            case "submotivo":         return validarSubmotivo(form.submotivo, form.motivo);
            case "producto":          return validarProducto(form.producto, form.idVenta);
            case "cantidad":          return validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList, devolucionesVenta);
            case "condicionProducto": return validarCondicion(form.condicionProducto, form.motivo);
            case "gestion":           return validarGestion(form.gestion, form.motivo, form.submotivo);
            case "montoReembolso":    return validarMontoReembolso(form, ventasList);
            case "responsable":       return validarResponsable(form.responsable, form.motivo, form.garantiaProveedor);
            case "garantiaProveedor": return validarGarantia(form.garantiaProveedor, form.motivo);
            case "descripcion":       return validarDescripcion(form.descripcion);
            case "observaciones":     return validarObservaciones(form.observaciones);
            default:                  return null;
        }
    };

    const formularioEsValido = () => {
        const validaciones = [
            validarMotivo(form.motivo),
            validarSubmotivo(form.submotivo, form.motivo),
            validarProducto(form.producto, form.idVenta),
            validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList, devolucionesVenta),
            validarCondicion(form.condicionProducto, form.motivo),
            validarGestion(form.gestion, form.motivo, form.submotivo),
            validarMontoReembolso(form, ventasList),
            validarResponsable(form.responsable, form.motivo, form.garantiaProveedor),
            validarGarantia(form.garantiaProveedor, form.motivo),
            validarDescripcion(form.descripcion),
            validarObservaciones(form.observaciones),
        ];
        return validaciones.filter((v) => v !== null).every((v) => v.valido);
    };

    const handleSubmit = () => {
        tocarTodo();
        if (!formularioEsValido()) {
            showToast("error", "Revisa los campos marcados en rojo antes de continuar.");
            return;
        }
        setConfirmData({
            type: "info",
            title: "Agregar devolución",
            message: `¿Deseas registrar la devolución del producto "${form.producto}"?`,
            onConfirm: async () => {
                try {
                    const venta = ventasList.find((v) => String(v.id) === String(form.idVenta));
                    const producto = venta?.productos?.find((p) => p.nombre === form.producto);
                    const devolucionData = {
                        ...form,
                        productoId: producto?.productoId || producto?.id,
                        montoReembolso:
                            form.gestion === "REEMBOLSO_TOTAL"
                                ? calcularReembolsoTotal(form.cantidad, producto?.precio)
                                : form.montoReembolso,
                    };

                    if (fromReturn) {
                        // Guardar en localStorage temporalmente
                        const key = `pendingDevs_${form.idVenta}`;
                        const currentPendingStr = localStorage.getItem(key);
                        const currentPending = currentPendingStr ? JSON.parse(currentPendingStr) : [];
                        currentPending.push({
                            ...devolucionData,
                            id: `temp-${Date.now()}` // ID temporal
                        });
                        localStorage.setItem(key, JSON.stringify(currentPending));
                    } else {
                        // Creación normal (backend)
                        await guardarDevolucion(devolucionData);
                    }
                setConfirmData(null);
                showToast("success", fromReturn ? "Devolución agregada a la lista." : "Devolución creada correctamente.");
                    setTimeout(() => {
                    if (fromReturn) {
                        navigate("/dashboard/sales-management/return", {
                            state: { idVenta: form.idVenta, mode: modeOrigen },
                        });
                    } else {
                        navigate("/dashboard/devolutions");
                    }
                }, 1200);
                } catch (err) {
                    setConfirmData(null);
                    showToast("error", err.message);
                }
            },
        });
    };

    const handleCancel = () => {
        const initialForm = initialFormRef.current;
        const hasChanges = Object.keys(form).some(
            (key) => form[key] !== initialForm[key]
        );

        if (!hasChanges) {
            if (fromReturn) {
                navigate("/dashboard/sales-management/return", {
                    state: { idVenta: form.idVenta, mode: modeOrigen },
                });
            } else {
                navigate("/dashboard/devolutions");
            }
            return;
        }

        setConfirmData({
            type: "info",
            title: "¿Cancelar?",
            message: "Si cancelas ahora perderás los datos ingresados. ¿Estás seguro?",
            onConfirm: () => {
                if (fromReturn) {
                    navigate("/dashboard/sales-management/return", {
                        state: { idVenta: form.idVenta, mode: modeOrigen },
                    });
                } else {
                    navigate("/dashboard/devolutions");
                }
            },
        });
    };

    // Campos read-only cuando venimos con datos pre-cargados
    const readOnlyFields = [
        ...(fromReturn         ? ["idVenta"]  : []),
        ...(productoPreCargado ? ["producto"] : []),
    ];

    const ventaSeleccionada = ventasList.find((v) => String(v.id) === String(form.idVenta));
    const saldoPendiente = Number(ventaSeleccionada?.montoPorPagar ?? 0) > 0;

    return (
        <>
            <DevolutionForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                title="Nueva Devolución"
                submitText="Agregar devolución"
                productosList={productosList}
                ventasList={ventasList}
                estadoCampo={estadoCampo}
                onFieldBlur={tocarCampo}
                sinProductos={sinProductos}
                readOnlyFields={readOnlyFields}
                garantiaVencidaMap={garantiaVencidaMap}
                stockDisponible={stockDisponible}
                saldoPendiente={saldoPendiente}
            />

            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
        </>
    );
}
