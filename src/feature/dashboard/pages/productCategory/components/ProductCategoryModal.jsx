import { X, Tag, FileText, Layers } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import useProductCategoryModal from "../hooks/UseProductCategoryModal";

export default function ProductCategoryModal({ onClose, onSave, categoryData = null }) {

    // 1. DEFINIR isEdit AQUÍ:
    const isEdit = Boolean(categoryData && categoryData.id);

    // 2. LUEGO EL HOOK:
    const {
        formData,
        errors,
        handleChange,
        handleSubmit
    } = useProductCategoryModal({
        initialData: categoryData,
        onSuccess: onSave,
        onClose: onClose,
        mode: isEdit ? "update" : "create" // Usamos isEdit para pasar el modo
    });

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* CARD */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER DINÁMICO */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-lg font-semibold">
                                {isEdit ? "Editar" : "Crear"} categoría
                            </p>
                            <p className="text-xs text-gray-500">
                                {isEdit ? "Modifique los campos de la categoría" : "Complete los campos para la nueva categoría"}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* NOMBRE DE CATEGORÍA */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                <Tag size={16} />
                                <span>Nombre de categoría *</span>
                            </div>
                            <input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre de la categoria"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                ${errors.nombre ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                <FileText size={16} />
                                <span>Descripción</span>
                            </div>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Breve descripción de los productos en esta categoría"
                                rows="3"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                ${errors.descripcion ? "focus:ring-red-500" : "focus:ring-yellow-400"} resize-none`}
                            />
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 hover:bg-gray-300 transition px-6 py-2 rounded-xl text-sm font-medium shadow cursor-pointer"
                            >
                                Cancelar
                            </button>

                            <PrimaryButton
                                type="submit"
                                disabled={Object.values(errors).some(error => error)}
                            >
                                {isEdit ? "Actualizar categoría" : "Crear categoría"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}