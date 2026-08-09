import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RolesService } from "../Roles/services/RolesService";
import { useRoleForm } from "../Roles/hooks/useRoleForm";
import RoleForm from "../Roles/components/RoleForm";
import { X } from "lucide-react";
import { useToast } from "../../../../context/ToastContext";

export default function UpdateRoles() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { showToast } = useToast();
    const [initialData, setInitialData] = useState(null);
    const [dataLoaded, setDataLoaded]   = useState(false); // ← controla el skeleton

    useEffect(() => {
        if (location.state?.role) {
            setInitialData(location.state.role);
            setDataLoaded(true); // los datos vienen del state, no hay fetch async
        } else {
            navigate("/dashboard/roles");
        }
    }, []);

    const formHook = useRoleForm({
        initialData,
        onSubmit: async (formData) => {
            try {
                await RolesService.update({
                    id:          formData.id,
                    nombre:      formData.nombre,
                    descripcion: formData.descripcion,
                    permisos:    formData.permisos,
                });
                showToast("success", "Rol actualizado correctamente.");
                setTimeout(() => navigate("/dashboard/roles"), 1500);
            } catch (error) {
                const message = error.response?.data?.message || "Error al actualizar el rol";
                formHook.setFormError(message);
            }
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-8 rounded-2xl min-h-full h-full font-sans shadow-inner flex flex-col gap-4 overflow-y-auto">

                <div className="flex justify-between mb-0">
                    <h1 className="text-2xl font-bold text-gray-800">Editar rol</h1>
                    <button
                        onClick={() => navigate("/dashboard/roles")}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col">

                    {/* ── Skeleton (igual que UpdateProvider) ── */}
                    {!dataLoaded ? (
                        <div className="animate-pulse flex flex-col gap-10 mt-2">
                            {/* Fila superior: nombre/estado + descripción */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                {/* Columna izquierda: nombre + estado + fecha */}
                                <div className="flex flex-col gap-4">
                                    <div className="h-4 bg-gray-300 rounded w-1/3" />
                                    <div className="h-12 bg-gray-300 rounded-xl w-full" />
                                    <div className="flex gap-4">
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-4 bg-gray-300 rounded w-1/3" />
                                            <div className="h-12 bg-gray-300 rounded-xl w-full" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-4 bg-gray-300 rounded w-1/3" />
                                            <div className="h-12 bg-gray-300 rounded-xl w-full" />
                                        </div>
                                    </div>
                                </div>
                                {/* Columna derecha: descripción */}
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/4" />
                                    <div className="h-32 bg-gray-300 rounded-xl w-full" />
                                </div>
                            </div>

                            {/* Grid de permisos */}
                            <div className="flex flex-col gap-3">
                                <div className="h-5 bg-gray-300 rounded w-1/4" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="h-20 bg-gray-300 rounded-xl" />
                                    ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-4 mt-auto">
                                <div className="h-10 bg-gray-300 rounded-xl w-28" />
                                <div className="h-10 bg-gray-300 rounded-xl w-36" />
                            </div>
                        </div>
                    ) : (
                        <RoleForm
                            {...formHook}
                            buttonText="Guardar cambios"
                            onCancel={() => navigate("/dashboard/roles")}
                            isUpdate={true}
                        />
                    )}
                </div>
            </div>
        </>
    );
}