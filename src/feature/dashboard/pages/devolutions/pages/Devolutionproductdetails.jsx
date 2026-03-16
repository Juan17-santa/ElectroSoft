import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";

/**
 * DevolutionProductDetails
 * Formulario de solo lectura para ver el detalle de una devolución de producto.
 *
 * Recibe en location.state:
 *   - mode    → se propaga de vuelta a ReturnSalesPage para mantener el contexto
 *   - idVenta → para volver a la venta correcta en ReturnSalesPage
 *
 * Al pulsar "Volver" regresa a ReturnSalesPage con el mismo mode e idVenta,
 * preservando el botón del footer ("Cancelar" o "Volver a devoluciones").
 */
export default function DevolutionProductDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id }   = useParams();

    const [form, setForm] = useState(null);

    useEffect(() => {
        const found = ServicesDevolutions.getById(id);
        if (found) setForm(found);
    }, [id]);

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

    const handleVolver = () => {
        const idVenta = location.state?.idVenta ?? form.idVenta;
        const mode    = location.state?.mode    ?? "from-sales";
        navigate("/dashboard/sales-management/return", {
            state: { idVenta, mode },
        });
    };

    return (
        <DevolutionForm
            form={form}
            onChange={() => {}}
            onSubmit={() => {}}
            onCancel={handleVolver}
            readOnly={true}
            title="Detalle de devolución de producto"
        />
    );
}