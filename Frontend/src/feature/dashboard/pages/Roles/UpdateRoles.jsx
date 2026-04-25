import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "./services/RolesService";
import { useRoleForm } from "./hooks/useRoleForm";
import RoleForm from "./components/RoleForm";
import Alert from "../../components/ui/Alert";
import { X } from "lucide-react";

export default function UpdateRoles() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("roleToEdit");
        if (data) {
            setInitialData(JSON.parse(data));
        }
    }, []);

    const formHook = useRoleForm({
        initialData,
        onSubmit: (formData) => {
            try {
                RolesService.update({
                    id: formData.id,
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    estado: formData.estado,
                    fechaCreacion: formData.fechaCreacion,
                    permisos: formData.permisos
                });

                setAlert({ type: "success", message: "Rol actualizado correctamente" });
                localStorage.removeItem("roleToEdit");
                setTimeout(() => navigate("/dashboard/roles"), 1500);
            } catch (error) {
                console.error(error);
                formHook.setFormError("Ocurrió un error al actualizar el rol.");
            }
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-8 rounded-2xl min-h-full h-full font-sans shadow-inner flex flex-col gap-4">
                <div className="flex justify-between mb-0">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Editar rol
                    </h1>
                    <button
                        onClick={() => navigate("/dashboard/roles")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex-1 flex flex-col">
                    {initialData ? (
                        <RoleForm
                            {...formHook}
                            buttonText="Guardar cambios"
                            onCancel={() => {
                                localStorage.removeItem("roleToEdit");
                                navigate("/dashboard/roles");
                            }}
                            isUpdate={true}
                        />
                    ) : (
                        <div className="text-gray-500 py-10 text-center">Cargando datos del rol...</div>
                    )}
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