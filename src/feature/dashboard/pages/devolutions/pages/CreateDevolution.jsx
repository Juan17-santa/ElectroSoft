import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal   from "../../../components/ui/ConfirmModal";
import Alert          from "../../../components/ui/Alert";
import { ServicesProducts } from "../../products/services/ServicesProducts";

const EMPTY_FORM = {
    idVenta:            "",
    motivo:             "",
    producto:           "",
    cantidad:           "",
    condicionProducto:  "",
    gestion:            "",
    responsable:        "",
    garantiaProveedor:  false,
    descripcion:        "",
    observaciones:      "",
    fechaISO:           "",
    fecha:              "",
    estadoResolucion:   "",
};

export default function CreateDevolution() {
    const navigate = useNavigate();
    const { guardarDevolucion } = useDevolutions();

    const [form, setForm]                   = useState(EMPTY_FORM);
    const [productosList, setProductosList] = useState([]);
    const [confirmData, setConfirmData]     = useState(null);
    const [alert, setAlert]                 = useState(null);

    useEffect(() => {
        setProductosList(ServicesProducts.get().filter((p) => p.estado !== false));
    }, []);

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.motivo || !form.producto || !form.responsable) {
            setAlert({ type: "error", message: "Completa los campos obligatorios marcados con *" });
            return;
        }
        setConfirmData({
            type: "info",
            title: "Crear devolución",
            message: "¿Deseas registrar esta nueva devolución?",
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