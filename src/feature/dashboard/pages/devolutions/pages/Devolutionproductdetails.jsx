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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        ServicesDevolutions.getById(id)
            .then((found) => {
                if (active && found) setForm(found);
            })
            .catch(() => {
                if (active) setForm(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

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
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col w-full h-full gap-4 items-center justify-center shadow-inner min-h-40">
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
