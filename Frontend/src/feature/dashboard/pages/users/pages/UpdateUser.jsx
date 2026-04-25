import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";

import Alert from "../../../components/ui/Alert";

import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";

export default function UpdateUser() {

    const navigate = useNavigate();
    const location = useLocation();

    const userToEdit = location.state?.user;

    
    const {
        formData,
        errors,
        alert,
        setAlert,
        handleChange,
        validateForm,
        updateUser
    } = useUserForm({ userToEdit, navigate });

    // Si no hay usuario, redirigir
    if (!userToEdit) {
        navigate("/dashboard/users");
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const success = updateUser();

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
                        <p className="text-xl font-semibold mb-2">
                            Editar usuario
                        </p>
                        <p className="text-sm text-gray-600">
                            Modifique los campos necesarios
                        </p>
                    </div>
                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/users")}
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
                    buttonText="Guardar cambios"
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