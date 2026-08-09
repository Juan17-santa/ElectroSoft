import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";
import api from "../../../../../utils/api.js";

export default function CreateUser() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    // Cargar roles y tipos de documento desde el backend
    useEffect(() => {
        const loadData = async () => {
            try {
                const [rolesRes, docTypesRes] = await Promise.all([
                    api.get("/roles/list"),
                    api.get("/documentTypes"),
                ]);
                // Mapear al formato que espera el select
                setRoles(rolesRes.data.data.map(r => ({
                    _id: r._id,
                    nombre: r.name,
                })));

                setDocumentTypes(docTypesRes.data.data.map(d => ({
                    _id: d._id,
                    nombre: d.name,
                    abbreviation: d.abbreviation,
                })));
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        loadData();
    }, []);

    const {
        formData,
        errors,
        loading,
        handleChange,
        validateForm,
        createUser,
    } = useUserForm({ navigate });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const success = await createUser();
        if (success) {
            setTimeout(() => navigate("/dashboard/users"), 2000);
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">Nuevo usuario</p>
                        <p className="text-xs sm:text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>
                    <button onClick={() => navigate("/dashboard/users")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                
                <UserForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/users")}
                    buttonText={loading ? "Creando..." : "Crear usuario"}
                    roles={roles}
                    documentTypes={documentTypes}
                />
            </div>
        </>
    );
}