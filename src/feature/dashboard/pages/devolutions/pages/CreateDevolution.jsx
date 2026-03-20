import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal   from "../../../components/ui/ConfirmModal";
import Alert          from "../../../components/ui/Alert";
import {
    SUBMOTIVOS,
    getGestionesPermitidas,
    getResponsableAuto,
} from "../helpers/devolutionsHelpers";

// ─── Estado vacío del formulario ──────────────────────────────────────────────
const EMPTY_FORM = (() => {
    const hoy   = new Date().toISOString().split("T")[0];
    // Fecha formateada DD/MM/YYYY para mostrar
    const [a, m, d] = hoy.split("-");
    const fechaFormateada = `${d}/${m}/${a}`;
    return {
        idVenta:            "",
        motivo:             "",
        submotivo:          "",
        producto:           "",
        cantidad:           "",
        condicionProducto:  "",
        gestion:            "",
        responsable:        "",
        garantiaProveedor:  null,
        descripcion:        "",
        observaciones:      "",
        fechaISO:           hoy,
        fecha:              fechaFormateada,
        estadoResolucion:   "CREADA",
    };
})();

const EMPTY_TOCADOS = {
    idVenta: false, motivo: false, submotivo: false, producto: false,
    cantidad: false, condicionProducto: false, gestion: false,
    responsable: false, garantiaProveedor: false, descripcion: false,
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
function validarCantidad(val, producto, idVenta, ventasList) {
    if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
    const cantidad = Number(val);
    if (isNaN(cantidad) || cantidad <= 0) return { valido: false, mensaje: "La cantidad debe ser mayor a 0." };
    if (producto && idVenta) {
        const venta = ventasList.find((v) => String(v.id) === String(idVenta));
        const productoEnVenta = venta?.productos?.find((p) => p.nombre === producto);
        if (productoEnVenta) {
            const yaDevuelto = ServicesDevolutions.getCantidadDevuelta(idVenta, producto);
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
function validarFecha(fechaISO, idVenta, ventasList) {
    if (!fechaISO) return { valido: false, mensaje: "Selecciona la fecha de devolución." };
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaISO > hoy) return { valido: false, mensaje: "La fecha no puede ser futura." };
    const venta = ventasList.find((v) => String(v.id) === String(idVenta));
    if (venta?.fecha && fechaISO < venta.fecha) return { valido: false, mensaje: "La fecha no puede ser anterior a la fecha de la venta." };
    return { valido: true, mensaje: "" };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CreateDevolution() {
    const navigate    = useNavigate();
    const location    = useLocation();
    const { guardarDevolucion } = useDevolutions();

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
    const [tocados, setTocados]             = useState(EMPTY_TOCADOS);
    const [ventasList, setVentasList]       = useState([]);
    const [productosList, setProductosList] = useState([]);
    const [sinProductos, setSinProductos]   = useState(false);
    const [confirmData, setConfirmData]     = useState(null);
    const [alert, setAlert]                 = useState(null);

    useEffect(() => {
        const ventas = JSON.parse(localStorage.getItem("sales") || "[]");
        setVentasList(ventas.filter((v) => v.estado !== "Anulado"));
    }, []);

    useEffect(() => {
        if (!form.idVenta) { setProductosList([]); setSinProductos(false); return; }
        const ventas  = JSON.parse(localStorage.getItem("sales") || "[]");
        const venta   = ventas.find((v) => String(v.id) === String(form.idVenta));
        if (!venta?.productos) { setProductosList([]); setSinProductos(false); return; }

        // Solo mostrar productos con cantidad aún disponible para devolver
        const conDisponible = venta.productos.filter((p) => {
            const devuelto = ServicesDevolutions.getCantidadDevuelta(form.idVenta, p.nombre);
            return devuelto < p.cantidad;
        });
        setProductosList(conDisponible);
        setSinProductos(conDisponible.length === 0);

        if (form.producto && !conDisponible.find((p) => p.nombre === form.producto))
            setForm((prev) => ({ ...prev, producto: "" }));
    }, [form.idVenta]);

    const handleChange = (field, value) => {
        let autoTouched = {};
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "motivo") {
                next.submotivo = ""; next.gestion = ""; next.condicionProducto = ""; next.garantiaProveedor = null;
                if (value === "LOGISTICA" || value === "CLIENTE") { next.responsable = "EMPRESA"; autoTouched.responsable = true; }
                else next.responsable = "";
            }
            if (field === "submotivo") next.gestion = "";
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
            case "cantidad":          return validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList);
            case "condicionProducto": return validarCondicion(form.condicionProducto, form.motivo);
            case "gestion":           return validarGestion(form.gestion, form.motivo, form.submotivo);
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
            validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList),
            validarCondicion(form.condicionProducto, form.motivo),
            validarGestion(form.gestion, form.motivo, form.submotivo),
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
            setAlert({ type: "error", message: "Revisa los campos marcados en rojo antes de continuar." });
            return;
        }
        setConfirmData({
            type: "info",
            title: "Crear devolución",
            message: `¿Deseas registrar la devolución del producto "${form.producto}"?`,
            onConfirm: () => {
                guardarDevolucion(form);
                setConfirmData(null);
                setAlert({ type: "success", message: "Devolución creada correctamente." });
                    setTimeout(() => {
                    if (fromReturn) {
                        navigate("/dashboard/sales-management/return", {
                            state: { idVenta: form.idVenta, mode: modeOrigen },
                        });
                    } else {
                        navigate("/dashboard/devolutions");
                    }
                }, 1200);
            },
        });
    };

    const handleCancel = () => {
        setConfirmData({
            type: "warning",
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

    return (
        <>
            <DevolutionForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                title="Crear nueva Devolución"
                submitText="Guardar"
                productosList={productosList}
                ventasList={ventasList}
                estadoCampo={estadoCampo}
                onFieldBlur={tocarCampo}
                sinProductos={sinProductos}
                readOnlyFields={readOnlyFields}
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
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}
        </>
    );
}