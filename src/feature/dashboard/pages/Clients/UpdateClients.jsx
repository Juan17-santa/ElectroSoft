import { useState, useEffect } from "react";
import { ClientsService } from "./services/ClientsService";
import { useClientForm } from "./hooks/useClientForm";
import ClientForm from "./components/ClientForm";
import { X } from "lucide-react";
import { useToast } from "../../../../context/ToastContext";

export default function UpdateClients({ isOpen, onClose, onSuccess, initialClient }) {
    const { showToast } = useToast();
    const [formError, setFormError] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (isOpen && initialClient) {
            setInitialData({
                ...initialClient,
                tipoDocumento: initialClient.documentTypeId || initialClient.tipoDocumento
            });
        } else {
            setInitialData(null);
        }
    }, [isOpen, initialClient]);

    const formHook = useClientForm({
        initialData,
        onSubmit: async (formData) => {
            try {
                await ClientsService.update(formData);
                showToast("success", "Cliente actualizado correctamente.");
                onSuccess();
                formHook.resetForm();
                onClose();
            } catch (error) {
                console.error(error);
                setFormError("Error al actualizar el cliente.");
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
                        <p className="text-xl font-semibold mb-4">Editar cliente</p>
                        <p className="text-sm text-gray-600">Actualice los campos requeridos del formulario</p>
                    </div>
                    <button
                        onClick={onClose}
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
                        onCancel={onClose}
                        buttonText="Guardar cambios"
                    />
                ) : (
                    <div className="text-gray-500 text-center py-10">Cargando datos del cliente...</div>
                )}
            </div>
        </div>
    );
}