import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
const EMPTY_FORM = {
    idVenta:            "",
    motivo:             "",
    submotivo:          "",
    producto:           "",
    cantidad:           "",
    condicionProducto:  "",
    gestion:            "",
    responsable:        "",
    garantiaProveedor:  null,   // null = no aplica; true/false solo si motivo = GARANTIA
    descripcion:        "",
    observaciones:      "",
    fechaISO:           "",
    fecha:              "",
    estadoResolucion:   "CREADA",
};

// ─── Estado de campos "tocados" ───────────────────────────────────────────────
const EMPTY_TOCADOS = {
    idVenta: false, motivo: false, submotivo: false, producto: false,
    cantidad: false, condicionProducto: false, gestion: false,
    responsable: false, garantiaProveedor: false, descripcion: false,
    observaciones: false, fecha: false,
};

// ─── Funciones de validación (retornan { valido, mensaje } o null) ────────────

function validarIdVenta(val) {
    if (!val) return { valido: false, mensaje: "Selecciona una venta." };
    return { valido: true, mensaje: "" };
}

function validarMotivo(val) {
    if (!val) return { valido: false, mensaje: "Selecciona el motivo." };
    return { valido: true, mensaje: "" };
}

function validarSubmotivo(val, motivo) {
    if (!motivo) return null;                      // aún no se puede validar
    if (!val) return { valido: false, mensaje: "Selecciona el submotivo correspondiente." };
    const opciones = SUBMOTIVOS[motivo] || [];
    if (!opciones.includes(val))
        return { valido: false, mensaje: "El submotivo no corresponde al motivo seleccionado." };
    return { valido: true, mensaje: "" };
}

function validarProducto(val, idVenta) {
    if (!idVenta) return null;                     // esperar a que elijan venta
    if (!val) return { valido: false, mensaje: "Selecciona el producto a devolver." };
    return { valido: true, mensaje: "" };
}

function validarCantidad(val, producto, idVenta, ventasList) {
    if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };
    
    const cantidad = Number(val);
    if (isNaN(cantidad) || cantidad <= 0) 
        return { valido: false, mensaje: "La cantidad debe ser mayor a 0." };
    
    // Validar que no supere la cantidad disponible en la venta
    if (producto && idVenta) {
        const venta = ventasList.find((v) => String(v.id) === String(idVenta));
        const productoEnVenta = venta?.productos?.find((p) => p.nombre === producto);
        
        if (productoEnVenta && cantidad > productoEnVenta.cantidad) {
            return { 
                valido: false, 
                mensaje: `No puedes devolver ${cantidad} unidades. Disponibles: ${productoEnVenta.cantidad}`
            };
        }
    }
    
    return { valido: true, mensaje: "" };
}

function validarCondicion(val, motivo) {
    if (!val) return { valido: false, mensaje: "Selecciona la condición del producto." };
    if (motivo === "GARANTIA" && val === "BUEN_ESTADO")
        return { valido: false, mensaje: "No se puede seleccionar BUEN ESTADO cuando el motivo es GARANTÍA." };
    if (motivo === "CLIENTE" && val !== "BUEN_ESTADO")
        return { valido: false, mensaje: "Para devoluciones de cliente, el producto debe estar en BUEN ESTADO." };
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
    if ((motivo === "LOGISTICA" || motivo === "CLIENTE") && val !== "EMPRESA")
        return { valido: false, mensaje: "Para este motivo, el responsable debe ser EMPRESA." };
    if (motivo === "GARANTIA" && garantiaProveedor === true && val !== "PROVEEDOR")
        return { valido: false, mensaje: "Con garantía de proveedor confirmada, el responsable debe ser PROVEEDOR." };
    if (motivo === "GARANTIA" && garantiaProveedor === false && val !== "EMPRESA")
        return { valido: false, mensaje: "Sin garantía de proveedor, el responsable debe ser EMPRESA." };
    return { valido: true, mensaje: "" };
}

function validarGarantia(val, motivo) {
    if (motivo !== "GARANTIA") return null;         // no aplica
    if (val === null || val === undefined || val === "")
        return { valido: false, mensaje: "Indica si aplica garantía de proveedor." };
    return { valido: true, mensaje: "" };
}

function validarDescripcion(val) {
    if (!val || !val.trim())
        return { valido: false, mensaje: "La descripción es obligatoria." };
    if (val.trim().length < 10)
        return { valido: false, mensaje: "Mínimo 10 caracteres en la descripción." };
    return { valido: true, mensaje: "" };
}

function validarObservaciones(val) {
    if (!val || !val.trim())
        return { valido: false, mensaje: "Las observaciones son obligatorias." };
    return { valido: true, mensaje: "" };
}

function validarFecha(fechaISO, idVenta, ventasList) {
    if (!fechaISO) return { valido: false, mensaje: "Selecciona la fecha de devolución." };
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaISO > hoy)
        return { valido: false, mensaje: "La fecha no puede ser futura." };
    const venta = ventasList.find((v) => String(v.id) === String(idVenta));
    if (venta?.fecha && fechaISO < venta.fecha)
        return { valido: false, mensaje: "La fecha no puede ser anterior a la fecha de la venta." };
    return { valido: true, mensaje: "" };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CreateDevolution() {
    const navigate = useNavigate();
    const { guardarDevolucion } = useDevolutions();

    const [form, setForm]                   = useState(EMPTY_FORM);
    const [tocados, setTocados]             = useState(EMPTY_TOCADOS);
    const [ventasList, setVentasList]       = useState([]);
    const [productosList, setProductosList] = useState([]);
    const [sinProductos, setSinProductos]   = useState(false);
    const [confirmData, setConfirmData]     = useState(null);
    const [alert, setAlert]                 = useState(null);

    // Carga ventas activas al montar
    useEffect(() => {
        const ventas = JSON.parse(localStorage.getItem("sales") || "[]");
        setVentasList(ventas.filter((v) => v.estado !== "Anulado"));
    }, []);

    // Cuando cambia la venta: cargar productos disponibles
    useEffect(() => {
        if (!form.idVenta) {
            setProductosList([]);
            setSinProductos(false);
            return;
        }
        const ventas  = JSON.parse(localStorage.getItem("sales") || "[]");
        const venta   = ventas.find((v) => String(v.id) === String(form.idVenta));
        if (!venta?.productos) { setProductosList([]); setSinProductos(false); return; }

        const yaDevueltos  = ServicesDevolutions.getProductosDevueltosByVenta(form.idVenta);
        const disponibles  = venta.productos.filter((p) => !yaDevueltos.includes(p.nombre));

        setProductosList(disponibles);
        setSinProductos(disponibles.length === 0);

        // Si el producto seleccionado ya no está disponible, limpiar
        if (form.producto && !disponibles.find((p) => p.nombre === form.producto)) {
            setForm((prev) => ({ ...prev, producto: "" }));
        }
    }, [form.idVenta]);

    // ─── handleChange con reglas de negocio auto-aplicadas ───────────────────
    const handleChange = (field, value) => {
        let autoTouched = {};

        setForm((prev) => {
            const next = { ...prev, [field]: value };

            // ── Reglas cuando cambia el MOTIVO ──
            if (field === "motivo") {
                next.submotivo        = "";
                next.gestion          = "";
                next.condicionProducto = "";
                next.garantiaProveedor = null;

                // LOGISTICA y CLIENTE → responsable siempre EMPRESA
                if (value === "LOGISTICA" || value === "CLIENTE") {
                    next.responsable = "EMPRESA";
                    autoTouched.responsable = true;
                } else {
                    next.responsable = "";
                }
            }

            // ── Reglas cuando cambia el SUBMOTIVO ──
            if (field === "submotivo") {
                next.gestion = ""; // limpiar gestión al cambiar submotivo
            }

            // ── Auto-set responsable cuando cambia garantiaProveedor (solo GARANTIA) ──
            if (field === "garantiaProveedor" && prev.motivo === "GARANTIA") {
                next.responsable = getResponsableAuto("GARANTIA", value);
                autoTouched.responsable = true;
            }

            return next;
        });

        setTocados((prev) => ({ ...prev, [field]: true, ...autoTouched }));
    };

    // Marcar campo como tocado al salir (onBlur)
    const tocarCampo = (campo) =>
        setTocados((prev) => ({ ...prev, [campo]: true }));

    // Marcar TODOS los campos como tocados (al intentar guardar con errores)
    const tocarTodo = () =>
        setTocados(Object.fromEntries(Object.keys(EMPTY_TOCADOS).map((k) => [k, true])));

    // ─── estadoCampo: retorna el estado de validación si el campo fue tocado ─
    const estadoCampo = (campo) => {
        if (!tocados[campo]) return null;
        switch (campo) {
            case "idVenta":           return validarIdVenta(form.idVenta);
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
            case "fecha":             return validarFecha(form.fechaISO, form.idVenta, ventasList);
            default:                  return null;
        }
    };

    // ─── Verificar si el formulario es válido en su totalidad ────────────────
    const formularioEsValido = () => {
        const validaciones = [
            validarIdVenta(form.idVenta),
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
            validarFecha(form.fechaISO, form.idVenta, ventasList),
        ];
        return validaciones
            .filter((v) => v !== null)
            .every((v) => v.valido);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        tocarTodo();

        if (!formularioEsValido()) {
            setAlert({ type: "error", message: "Revisa los campos marcados en rojo antes de continuar." });
            return;
        }

        // Verificación final: el producto no debe ya tener devolución
        const yaDevueltos = ServicesDevolutions.getProductosDevueltosByVenta(form.idVenta);
        if (yaDevueltos.includes(form.producto)) {
            setAlert({ type: "error", message: `El producto "${form.producto}" ya tiene una devolución registrada para esta venta.` });
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
                setTimeout(() => navigate("/dashboard/devolutions"), 1500);
            },
        });
    };

    const handleCancel = () => {
        setConfirmData({
            type: "warning",
            title: "¿Cancelar?",
            message: "Si cancelas ahora perderás los datos ingresados. ¿Estás seguro?",
            onConfirm: () => navigate("/dashboard/devolutions"),
        });
    };

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
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}