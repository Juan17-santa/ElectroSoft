import { useState, useEffect } from "react";
import { X } from "lucide-react";
import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";
import api from "../../../../../utils/api.js";

export default function UpdateUser({ isOpen, onClose, onSuccess, userToEdit }) {
    const [roles, setRoles] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            try {
                const [rolesRes, docTypesRes] = await Promise.all([
                    api.get("/roles/list"),
                    api.get("/documentTypes"),
                ]);
                setRoles(rolesRes.data.data.map(r => ({
                    _id: r._id,
                    nombre: r.name,
                })));
                setDocumentTypes(docTypesRes.data.data.map(d => ({
                    _id: d._id,
                    nombre: d.name,
                    abbreviation: d.abbreviation,
                })));
                setDataLoaded(true);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        loadData();
    }, [isOpen]);

    const {
        formData,
        errors,
        loading,
        handleChange,
        validateForm,
        updateUser,
    } = useUserForm({ userToEdit: userToEdit || {} });

    if (!isOpen || !userToEdit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const success = await updateUser();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4 sm:p-6">
            <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex flex-col gap-6 w-full max-w-4xl max-h-[90vh] shadow-xl overflow-y-auto relative animate-scale-in border border-gray-200">

                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">Editar usuario</p>
                        <p className="text-sm text-gray-600">Modifique los campos necesarios</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {!dataLoaded ? (
                    <div className="animate-pulse flex flex-col gap-10 mt-6 px-4 md:px-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/3" />
                                    <div className="h-12 bg-gray-300 rounded-xl w-full" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-auto">
                            <div className="h-10 bg-gray-300 rounded-xl w-28" />
                            <div className="h-10 bg-gray-300 rounded-xl w-36" />
                        </div>
                    </div>
                ) : (
                    <UserForm
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        onCancel={onClose}
                        buttonText={loading ? "Guardando..." : "Guardar cambios"}
                        roles={roles}
                        documentTypes={documentTypes}
                    />
                )}
            </div>
        </div>
    );
}