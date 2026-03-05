import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal   from "../../../components/ui/ConfirmModal";
import Alert          from "../../../components/ui/Alert";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import {
    SUBMOTIVOS,
    getGestionesPermitidas,
    getResponsableAuto,
} from "../helpers/devolutionsHelpers";

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

export default function EditDevolution() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { editarDevolucion } = useDevolutions();

    const [form, setForm]                   = useState(null);
    const [tocados, setTocados]             = useState(EMPTY_TOCADOS);
    const [productosList, setProductosList] = useState([]);
    const [ventasList, setVentasList]       = useState([]);
    const [confirmData, setConfirmData]     = useState(null);
    const [alert, setAlert]                 = useState(null);

    useEffect(() => {
        setProductosList(ServicesProducts.get().filter((p) => p.estado !== false));

        const ventas = JSON.parse(localStorage.getItem("sales") || "[]");
        setVentasList(ventas.filter((v) => v.estado !== "Anulado"));

        // ⚠️ Lee directamente de ServicesDevolutions para no depender del estado
        // del hook (que puede aún no haberse cargado al montar la página).
        const found = ServicesDevolutions.getById(id);
        if (found) setForm({ ...found, fechaISO: "" });
    }, [id]);

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
        if (!form || !tocados[campo]) return null;
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
        // En modo edición, solo validamos los campos EDITABLES
        const validaciones = [
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

    const handleSubmit = () => {
        tocarTodo();

        if (!formularioEsValido()) {
            setAlert({ type: "error", message: "Revisa los campos marcados en rojo antes de continuar." });
            return;
        }

        setConfirmData({
            type: "info",
            title: "Guardar cambios",
            message: "¿Deseas guardar los cambios realizados en esta devolución?",
            onConfirm: () => {
                editarDevolucion(form);
                setConfirmData(null);
                setAlert({ type: "success", message: "Devolución actualizada correctamente." });
                setTimeout(() => navigate("/dashboard/devolutions"), 1500);
            },
        });
    };

    const handleCancel = () => {
        setConfirmData({
            type: "warning",
            title: "¿Cancelar edición?",
            message: "Los cambios no guardados se perderán. ¿Estás seguro?",
            onConfirm: () => navigate("/dashboard/devolutions"),
        });
    };

    if (form === null) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-4 items-center justify-center shadow-inner min-h-40">
                <p className="text-gray-500 text-sm">No se encontró la devolución solicitada.</p>
                <button
                    onClick={() => navigate("/dashboard/devolutions")}
                    className="bg-linear-to-r from-white to-yellow-300 px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <>
            <DevolutionForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                title="Editar Devolución"
                submitText="Guardar"
                productosList={productosList}
                ventasList={ventasList}
                estadoCampo={estadoCampo}
                onFieldBlur={tocarCampo}
                readOnlyFields={["idVenta", "motivo", "submotivo", "producto", "cantidad"]}
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