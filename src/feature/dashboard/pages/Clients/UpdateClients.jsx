import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";
import { useClientForm } from "./hooks/useClientForm";
import ClientForm from "./components/ClientForm";
import Alert from "../../components/ui/Alert";
import { X } from "lucide-react";

export default function UpdateClients() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [formError, setFormError] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("clientToEdit");
        if (data) setInitialData(JSON.parse(data));
    }, []);

    const formHook = useClientForm({
        initialData,
        onSubmit: async (formData) => {
            try {
                await ClientsService.update(formData);
                localStorage.removeItem("clientToEdit");
                setAlert({ type: "success", message: "Cliente actualizado correctamente." });
                setTimeout(() => navigate("/dashboard/clients"), 1500);
            } catch (error) {
                console.error(error);
                setFormError("Error al actualizar el cliente.");
            }
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Editar cliente</p>
                        <p className="text-sm text-gray-600">Actualice los campos requeridos del formulario</p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/clients")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {initialData ? (
                    <ClientForm
                        {...formHook}
                        formError={formError}
                        setFormError={setFormError}
                        onCancel={() => {
                            localStorage.removeItem("clientToEdit");
                            navigate("/dashboard/clients");
                        }}
                        buttonText="Guardar cambios"
                    />
                ) : (
                    <div className="text-gray-500">Cargando datos del cliente...</div>
                )}
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}