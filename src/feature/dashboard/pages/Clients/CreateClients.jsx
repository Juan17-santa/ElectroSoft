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
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nuevo <span className="text-yellow-400">cliente</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                </div>

                <ClientForm 
                    {...formHook}
                    formError={formError}
                    setFormError={setFormError}
                    onCancel={() => navigate("/dashboard/clients")}
                    buttonText="Registrar cliente"
                />
            </div>

            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        </>
    );
}