import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal   from "../../../components/ui/ConfirmModal";
import Alert          from "../../../components/ui/Alert";
import { ServicesProducts } from "../../products/services/ServicesProducts";

export default function EditDevolution() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { editarDevolucion } = useDevolutions();

    const [form, setForm]                   = useState(null);
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

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.idVenta || !form.motivo || !form.producto || !form.responsable) {
            setAlert({ type: "error", message: "Completa los campos obligatorios marcados con *" });
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