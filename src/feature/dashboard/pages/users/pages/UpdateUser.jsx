import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";
import api from "../../../../../utils/api.js";

export default function UpdateUser() {
    const navigate = useNavigate();
    const location = useLocation();
    const userToEdit = location.state?.user;

    const [roles, setRoles] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
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
                setDataLoaded(true); // ← marcar como cargado
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        loadData();
    }, []);

    const {
        formData,
        errors,
        alert,
        setAlert,
        loading,
        handleChange,
        validateForm,
        updateUser,
    } = useUserForm({ userToEdit: userToEdit || {}, navigate });

    useEffect(() => {
        if (!userToEdit) {
            navigate("/dashboard/users");
        }
    }, [userToEdit, navigate]);

    if (!userToEdit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const success = await updateUser();
        if (success) {
            setTimeout(() => navigate("/dashboard/users"), 2000);
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">Editar usuario</p>
                        <p className="text-sm text-gray-600">Modifique los campos necesarios</p>
                    </div>
                    <button onClick={() => navigate("/dashboard/users")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {!dataLoaded ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Cargando datos...</p>
                    </div>
                ) : (

                    <UserForm
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        onCancel={() => navigate("/dashboard/users")}
                        buttonText={loading ? "Guardando..." : "Guardar cambios"}
                        roles={roles}
                        documentTypes={documentTypes}
                    />
                )}
            </div>

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}
        </>
    );
}