import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDevolutions } from "../hooks/useDevolutions";
import DevolutionForm from "../components/DevolutionForm";
import ConfirmModal   from "../../../components/ui/ConfirmModal";
import Alert          from "../../../components/ui/Alert";
import { ServicesProducts } from "../../products/services/ServicesProducts";

export default function EditDevolution() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getDevolucionById, editarDevolucion } = useDevolutions();

    const [form, setForm]                   = useState(null);
    const [productosList, setProductosList] = useState([]);
    const [confirmData, setConfirmData]     = useState(null);
    const [alert, setAlert]                 = useState(null);

    useEffect(() => {
        setProductosList(ServicesProducts.get().filter((p) => p.estado !== false));
        const found = getDevolucionById(id);
        if (found) {
            // fechaISO se usa internamente en el Calendar, pero la devolución
            // guarda "fecha" en formato DD/MM/YYYY; al editar se puede dejar vacío
            // y solo se actualizará si el usuario elige una nueva fecha.
            setForm({ ...found, fechaISO: "" });
        }
    }, [id]);

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.motivo || !form.producto || !form.responsable) {
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

    // No encontrada
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