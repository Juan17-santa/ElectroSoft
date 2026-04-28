import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";
import { useClientForm } from "./hooks/useClientForm";
import ClientForm from "./components/ClientForm";
import Alert from "../../components/ui/Alert";
import { X } from "lucide-react";

export default function CreateClients() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [formError, setFormError] = useState(null);

    const formHook = useClientForm({
        onSubmit: (formData) => {
            try {
                ClientsService.create(formData);
                setAlert({ type: "success", message: "Cliente creado correctamente." });
                formHook.resetForm();
                setTimeout(() => navigate("/dashboard/clients"), 1500);
            } catch (error) {
                console.error(error);
                setFormError("Error al crear el cliente.");
            }
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Nuevo cliente</p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/clients")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <ClientForm 
                    {...formHook}
                    formError={formError}
                    setFormError={setFormError}
                    onCancel={() => navigate("/dashboard/clients")}
                    buttonText="Crear cliente"
                />
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}