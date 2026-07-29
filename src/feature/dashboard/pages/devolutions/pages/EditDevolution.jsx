import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/Alert";
import {
    SUBMOTIVOS,
    getGestionesPermitidas,
    getResponsableAuto,
} from "../helpers/devolutionsHelpers";
import { ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function fetchSales() {
    const response = await fetch(`${API_BASE}/sales`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || body.message || "No se pudieron cargar las ventas");
    return Array.isArray(body.data) ? body.data.map(normalizeSale) : [];
}

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
        })),
    };
}

// ─── Estado de campos "tocados" ───────────────────────────────────────────────
const     EMPTY_TOCADOS = {
    idVenta: false, motivo: false, submotivo: false, producto: false,
    cantidad: false, condicionProducto: false, gestion: false,
    responsable: false, garantiaProveedor: false, descripcion: false,
    observaciones: false, montoReembolso: false,
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
    if (!motivo) return null;
    if (!val) return { valido: false, mensaje: "Selecciona el submotivo correspondiente." };
    const opciones = SUBMOTIVOS[motivo] || [];
    if (!opciones.includes(val))
        return { valido: false, mensaje: "El submotivo no corresponde al motivo seleccionado." };
    return { valido: true, mensaje: "" };
}

function validarProducto(val, idVenta) {
    if (!idVenta) return null;
    if (!val) return { valido: false, mensaje: "Selecciona el producto a devolver." };
    return { valido: true, mensaje: "" };
}

function validarCantidad(val, producto, idVenta, ventasList, devolucionId, devolucionesVenta = []) {
    if (!val) return { valido: false, mensaje: "Ingresa la cantidad." };

    const cantidad = Number(val);
    if (isNaN(cantidad) || cantidad <= 0)
        return { valido: false, mensaje: "La cantidad debe ser mayor a 0." };

    if (producto && idVenta) {
        const venta = ventasList.find((v) => String(v.id) === String(idVenta));
        const productoEnVenta = venta?.productos?.find((p) => p.nombre === producto);
        if (productoEnVenta) {
            const yaDevueltoPorOtros = devolucionesVenta
                .filter(
                    (d) =>
                        String(d.id) !== String(devolucionId) &&
                        d.estadoResolucion !== "Anulada" &&
                        d.producto === producto,
                )
                .reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
            const disponible = productoEnVenta.cantidad - yaDevueltoPorOtros;
            if (cantidad > disponible)
                return {
                    valido: false,
                    mensaje: `Máximo disponible: ${disponible} unidad${disponible !== 1 ? "es" : ""}.`,
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
    if (motivo !== "GARANTIA") return null;
    if (val === null || val === undefined || val === "")
        return { valido: false, mensaje: "Indica si aplica garantía de proveedor." };
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
    if (maximo <= 0) {
        return { valido: false, mensaje: "Selecciona producto y cantidad para calcular el maximo." };
    }
    if (monto > maximo) {
        return { valido: false, mensaje: `El monto parcial no puede superar $${Number(maximo || 0).toLocaleString("en-US")}.` };
    }
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

function validarFecha(fechaDevolucion, idVenta, ventasList) {
    if (!fechaDevolucion) return { valido: false, mensaje: "Selecciona la fecha de devolución." };
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaDevolucion > hoy)
        return { valido: false, mensaje: "La fecha no puede ser futura." };
    const venta = ventasList.find((v) => String(v.id) === String(idVenta));
    if (venta?.fecha && fechaDevolucion < venta.fecha)
        return { valido: false, mensaje: "La fecha no puede ser anterior a la fecha de la venta." };
    return { valido: true, mensaje: "" };
}

function buscarEnLocalStorage(id) {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("pendingDevs_")) {
            const devs = JSON.parse(localStorage.getItem(key) || "[]");
            const found = devs.find((d) => String(d.id) === String(id));
            if (found) return found;
        }
    }
    return null;
}

export default function EditDevolution() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { editarDevolucion } = useDevolutions();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tocados, setTocados] = useState(EMPTY_TOCADOS);
    const [productosList, setProductosList] = useState([]);
    const [ventasList, setVentasList] = useState([]);
    const [devolucionesVenta, setDevolucionesVenta] = useState([]);
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);
    const initialFormRef = useRef(null);
    const isTemporal = String(id).startsWith("temp-");

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                if (isTemporal) {
                    // Buscar en localStorage (devolución aún no registrada)
                    const tempDev = buscarEnLocalStorage(id);
                    if (!active) return;

                    if (tempDev) {
                        const ventas = await fetchSales();
                        if (!active) return;
                        const ventasActivas = ventas.filter((v) => v.estado !== "Anulado");
                        setVentasList(ventasActivas);
                        const venta = ventasActivas.find((v) => String(v.id) === String(tempDev.idVenta));
                        if (venta?.productos) setProductosList(venta.productos);
                        const formData = { ...tempDev, fechaDevolucion: tempDev.fechaDevolucion ?? "" };
                        setForm(formData);
                        initialFormRef.current = { ...formData };
                    }
                } else {
                    const [ventas, found] = await Promise.all([
                        fetchSales(),
                        ServicesDevolutions.getById(id),
                    ]);

                    if (!active) return;

                    const ventasActivas = ventas.filter((v) => v.estado !== "Anulado");
                    setVentasList(ventasActivas);

                    if (found) {
                        const formData = { ...found, fechaDevolucion: found.fechaDevolucion ?? "" };
                        setForm(formData);
                        initialFormRef.current = { ...formData };
                        const venta = ventasActivas.find((v) => String(v.id) === String(found.idVenta));
                        setProductosList(venta?.productos ?? []);
                        const devoluciones = await ServicesDevolutions.getBySaleId(found.idVenta);
                        if (active) setDevolucionesVenta(devoluciones);
                    }
                }
            } catch (err) {
                if (active) setAlert({ type: "error", message: err.message });
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, [id, isTemporal]);

    const handleChange = (field, value) => {
        let autoTouched = {};

        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === "motivo") {
                next.submotivo = "";
                next.gestion = "";
                next.condicionProducto = "";
                next.garantiaProveedor = null;

                if (value === "LOGISTICA" || value === "CLIENTE") {
                    next.responsable = "EMPRESA";
                    autoTouched.responsable = true;
                } else {
                    next.responsable = "";
                }
            }

            if (field === "submotivo") {
                next.gestion = "";
            }

            if (field === "garantiaProveedor" && prev.motivo === "GARANTIA") {
                next.responsable = getResponsableAuto("GARANTIA", value);
                autoTouched.responsable = true;
            }

            return next;
        });

        setTocados((prev) => ({ ...prev, [field]: true, ...autoTouched }));
    };

    const tocarCampo = (campo) =>
        setTocados((prev) => ({ ...prev, [campo]: true }));

    const tocarTodo = () =>
        setTocados(Object.fromEntries(Object.keys(EMPTY_TOCADOS).map((k) => [k, true])));

    const estadoCampo = (campo) => {
        if (!form || !tocados[campo]) return null;
        switch (campo) {
            case "idVenta": return validarIdVenta(form.idVenta);
            case "motivo": return validarMotivo(form.motivo);
            case "submotivo": return validarSubmotivo(form.submotivo, form.motivo);
            case "producto": return validarProducto(form.producto, form.idVenta);
            case "cantidad": return validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList, id, devolucionesVenta);
            case "condicionProducto": return validarCondicion(form.condicionProducto, form.motivo);
            case "gestion": return validarGestion(form.gestion, form.motivo, form.submotivo);
            case "montoReembolso": return validarMontoReembolso(form, ventasList);
            case "responsable": return validarResponsable(form.responsable, form.motivo, form.garantiaProveedor);
            case "garantiaProveedor": return validarGarantia(form.garantiaProveedor, form.motivo);
            case "descripcion": return validarDescripcion(form.descripcion);
            case "observaciones": return validarObservaciones(form.observaciones);
            default: return null;
        }
    };

    const formularioEsValido = () => {
        const validaciones = [
            validarCantidad(form.cantidad, form.producto, form.idVenta, ventasList, id, devolucionesVenta),
            validarCondicion(form.condicionProducto, form.motivo),
            validarGestion(form.gestion, form.motivo, form.submotivo),
            validarMontoReembolso(form, ventasList),
            validarResponsable(form.responsable, form.motivo, form.garantiaProveedor),
            validarGarantia(form.garantiaProveedor, form.motivo),
            validarDescripcion(form.descripcion),
            validarObservaciones(form.observaciones),
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
            onConfirm: async () => {
                try {
                    if (isTemporal) {
                        // Guardar en localStorage
                        const key = `pendingDevs_${form.idVenta}`;
                        const devsStr = localStorage.getItem(key);
                        if (devsStr) {
                            const devs = JSON.parse(devsStr);
                            const idx = devs.findIndex((d) => String(d.id) === String(id));
                            if (idx !== -1) {
                                devs[idx] = form;
                                localStorage.setItem(key, JSON.stringify(devs));
                            }
                        }
                    } else {
                        await editarDevolucion(form);
                    }
                    setConfirmData(null);
                    setAlert({ type: "success", message: "Devolución actualizada correctamente." });
                    const idVenta = location.state?.idVenta ?? form.idVenta;
                    const mode = location.state?.mode ?? "from-sales";
                    setTimeout(() => {
                        if (idVenta) {
                            navigate("/dashboard/sales-management/return", { state: { idVenta, mode } });
                        } else {
                            navigate("/dashboard/devolutions");
                        }
                    }, 1500);
                } catch (err) {
                    setConfirmData(null);
                    setAlert({ type: "error", message: err.message });
                }
            },
        });
    };

    const handleCancel = () => {
        const initialForm = initialFormRef.current;
        const hasChanges = form && initialForm
            ? Object.keys(form).some((key) => form[key] !== initialForm[key])
            : false;

        if (!hasChanges) {
            const idVenta = location.state?.idVenta ?? form?.idVenta;
            const mode = location.state?.mode ?? "from-sales";
            if (idVenta) {
                navigate("/dashboard/sales-management/return", { state: { idVenta, mode } });
            } else {
                navigate("/dashboard/devolutions");
            }
            return;
        }

        const idVenta = location.state?.idVenta ?? form?.idVenta;
        const mode = location.state?.mode ?? "from-sales";
        setConfirmData({
            type: "warning",
            title: "¿Cancelar edición?",
            message: "Los cambios no guardados se perderán. ¿Estás seguro?",
            onConfirm: () => {
                if (idVenta) {
                    navigate("/dashboard/sales-management/return", { state: { idVenta, mode } });
                } else {
                    navigate("/dashboard/devolutions");
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
                <svg className="animate-spin h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                <p className="text-gray-500 text-sm font-medium">Cargando devolución...</p>
            </div>
        );
    }

    if (form === null) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col w-full h-full gap-4 items-center justify-center shadow-inner min-h-40">
                <p className="text-gray-500 text-sm">No se encontró la devolución solicitada.</p>
                <button
                    onClick={() => navigate("/dashboard/devolutions")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-600 shadow-sm transition cursor-pointer"
                >
                    <ArrowLeft size={16} />
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
                submitText="Guardar Cambios"
                productosList={productosList}
                ventasList={ventasList}
                estadoCampo={estadoCampo}
                onFieldBlur={tocarCampo}
                readOnlyFields={["idVenta", "motivo", "submotivo", "producto"]}
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