import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServicesDevolutions } from "../services/ServicesDevolutions";
import DevolutionForm from "../components/DevolutionForm";

/**
 * DevolutionProductDetails
 * Formulario de solo lectura con el detalle completo de una devolución de producto.
 * Se accede desde el botón "Ver detalle" en la tabla de productos de ReturnSalesPage.
 * Al volver, regresa a la Devolución de venta (ReturnSalesPage) para el idVenta correspondiente.
 */
export default function DevolutionProductDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

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

    // Regresa a la vista Devolución de venta del idVenta correspondiente
    const handleVolver = () => {
        navigate("/dashboard/sales-management/return", {
            state: { idVenta: form.idVenta },
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
