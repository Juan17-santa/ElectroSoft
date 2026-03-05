import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import UserForm from "../components/UserForm";
import { useUserForm } from "../hooks/useUserForm";

export default function CreateUser() {

    const navigate = useNavigate();

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
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                <div className="flex justify-between">
                    <div>
                        <p className="text-xl font-semibold">Crear usuario</p>
                        <p className="text-sm text-gray-600">
                            Complete todos los campos
                        </p>
                    </div>

                    <button onClick={() => navigate("/dashboard/users")}>
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