import { X, Tag, FileText } from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import useProductCategoryModal from "../hooks/UseProductCategoryModal";
import ValidationMessage from "../../../components/ui/ValidationMessage";

// COMPONENTE MODAL PARA CREAR Y EDITAR LAS CATEGORIAS DE PRODUCTOS
export default function ProductCategoryModal({
    onClose,
    onSave,
    categoryData = null
}) {

    // DETERMINAR SI EL MODAL ES PARA EDITAR O PARA CREAR
    const isEdit = Boolean(categoryData && categoryData._id);

    // USO DEL HOOK PERSONALIZADO PARA MANEJAR EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit
    } = useProductCategoryModal({
        initialData: categoryData,
        onSuccess: onSave,
        onClose: onClose,
        mode: isEdit ? "update" : "create"
    });

    return (
        <>
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-lg font-semibold">
                                {isEdit ? "Editar" : "Nueva"} categoría
                            </p>
                            <p className="text-xs text-gray-500">
                                {isEdit ? "Modifique los campos de la categoría" : "Complete los campos para la nueva categoría"}
                            </p>
                        </div>
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
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre de la categoria"
                                className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 
                                ${errors.name ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                            />
                            <ValidationMessage
                                error={errors.name}
                                success={formData.name}
                                successMessage={"Nombre valido"}
                            />
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                <FileText size={16} />
                                <span>Descripción</span>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Breve descripción de los productos en esta categoría"
                                rows="3"
                                className={"bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"}
                            />
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-end gap-4 pt-2">
                            {/* BOTON CANCELAR */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2  text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
                            >
                                <X size={16} />
                                Cancelar
                            </button>

                            {/* BOTON PRINCIPAL (CREAR / ACTUALIZAR) */}
                            <PrimaryButton
                                type="submit"
                                disabled={Object.values(errors).some(error => error)}
                            >
                                {isEdit ? "Guardar cambios" : "Crear categoría"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}