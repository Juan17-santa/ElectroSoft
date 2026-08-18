import { useState } from "react";
import { ClientsService } from "./services/ClientsService";
import { useClientForm } from "./hooks/useClientForm";
import ClientForm from "./components/ClientForm";
import { X } from "lucide-react";
import { useToast } from "../../../../context/ToastContext";

export default function CreateClients({ isOpen, onClose, onSuccess }) {
    const { showToast } = useToast();
    const [formError, setFormError] = useState(null);

    const formHook = useClientForm({
        onSubmit: async (formData) => {
            try {
                await ClientsService.create(formData);
                showToast("success", "Cliente creado correctamente.");
                onSuccess();
                formHook.resetForm();
                onClose();
            } catch (error) {
                setFormError(
                    error.response?.data?.error ||
                    "Error al crear el cliente."
                );
                throw error;
            }
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4 sm:p-6">
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 w-full max-w-4xl max-h-[90vh] shadow-xl overflow-y-auto relative animate-scale-in border border-gray-200">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Nuevo cliente</p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <ClientForm
                    {...formHook}
                    formError={formError}
                    setFormError={setFormError}
                    onCancel={onClose}
                    buttonText="Crear cliente"
                />
            </div>
        </div>
    );
}