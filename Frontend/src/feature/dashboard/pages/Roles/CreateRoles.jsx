import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "./services/RolesService";
import { useRoleForm } from "./hooks/useRoleForm";
import RoleForm from "./components/RoleForm";
import Alert from "../../components/ui/Alert";

export default function CreateRoles() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);

    const formHook = useRoleForm({
        onSubmit: (formData) => {
            try {
                RolesService.create({
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    estado: formData.estado,
                    permisos: formData.permisos
                });

                setAlert({ type: "success", message: "Rol creado correctamente!" });
                setTimeout(() => navigate("/dashboard/roles"), 1500);
            } catch (error) {
                console.error(error);
                formHook.setFormError("Ocurrió un error al crear el rol.");
            }
        }
    });

    return (
        <>
            <div className="bg-gray-50 p-8 rounded-3xl min-h-full h-full font-sans shadow-inner flex flex-col gap-4">
                <div className="mb-0">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Crear nuevo <span className="text-yellow-500">rol</span>
                    </h1>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex-1 flex flex-col">
                    <RoleForm
                        {...formHook}
                        buttonText="Registrar Rol"
                        onCancel={() => navigate("/dashboard/roles")}
                    />
                </div>
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