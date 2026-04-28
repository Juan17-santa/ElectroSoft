import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";
import { RolesService } from "../../Roles/services/RolesService"; 

export default function CreateUser() {

    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);

    // Carga los roles del localStorage al montar el componente
    useEffect(() => {
        setRoles(RolesService.get());
    }, []);

    const {
        formData,
        errors,
        alert,
        setAlert,
        handleChange,
        validateForm,
        createUser
    } = useUserForm({ navigate });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const success = createUser();

        if (success) {
            setTimeout(() => {
                navigate("/dashboard/users");
            }, 2000);
        }
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">

                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg sm:text-xl font-semibold mb-1">
                            Nuevo usuario
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>

                    {/* BOTÓN X */}
                    <button
                        onClick={() => navigate("/dashboard/users")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <UserForm
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/users")}
                    buttonText="Crear usuario"
                    roles={roles}
                />
            </div>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
}