import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RolesService } from "../Roles/services/RolesService.js";
import { useRoleForm } from "../Roles/hooks/useRoleForm.jsx";
import RoleForm from "../Roles/components/RoleForm";
import { X } from "lucide-react";
import { useToast } from "../../../../context/ToastContext";

export default function CreateRoles() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const formHook = useRoleForm({
        onSubmit: async (formData) => {
            try {
                await RolesService.create({
                    nombre:      formData.nombre,
                    descripcion: formData.descripcion,
                    permisos:    formData.permisos,
                });
                showToast("success", "Rol creado correctamente.");
                setTimeout(() => navigate("/dashboard/roles"), 1500);
            } catch (error) {
                const message = error.response?.data?.message || "Error al crear el rol";
                formHook.setFormError(message);
            }
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-8 rounded-2xl min-h-full h-full font-sans shadow-inner flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between mb-0">
                    <h1 className="text-2xl font-bold text-gray-800">Nuevo rol</h1>
                    <button
                        onClick={() => navigate("/dashboard/roles")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col">
                    <RoleForm
                        {...formHook}
                        buttonText="Crear Rol"
                        onCancel={() => navigate("/dashboard/roles")}
                    />
                </div>
            </div>
        </>
    );
}