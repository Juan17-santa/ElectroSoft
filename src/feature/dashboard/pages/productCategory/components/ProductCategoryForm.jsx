/*
ProductCategoryForm

Componente reutilizable que renderiza el formulario
para crear o editar una categoria de productos

Este componente SOLO maneja la parte visual (UI).
La logica (estado, validaciones, envio) se recibe
desde el componente padre mediante props.

Responsabilidades:
✔ Mostrar campos del formulario
✔ Mostrar errores de validación
✔ Ejecutar funciones enviadas por props
✔ Renderizar botones de acción

No contiene lógica de negocio.
*/

import PrimaryButton from "../../../components/ui/PrimaryButton"; // Boton principal reutilizable
import { User, FileText, X } from "lucide-react"; // Iconos

export default function ProductCategoryForm({
    formData,      // Datos actuales del formulario
    errors,        // Errores de validacion
    handleChange,  // Funcion para manejar cambios en inputs
    handleSubmit,  // Funcion para enviar formulario
    buttonText,    // Texto dinamico del boton (Crear / Actualizar)
    onCancel       // Funcion para cancelar
}) {
    return (
        // Formulario
        <form onSubmit={handleSubmit}>

            {/* Contenedor principal del formulario */}
            <div className="flex flex-col items-center gap-12 mt-6 justify-around mx-28">

                {/* PRIMERA FILA */}
                <div className="flex gap-20">

                    {/* =================== NOMBRE DE CATEGORIA =================== */}
                    <div className="flex flex-col gap-3 w-lg">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Nombre *</span>
                        </div>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese el nombre de la categoria"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                                    ${errors.nombre ? "focus:ring-red-500"
                                    : "focus:ring-yellow-400"
                                }`}
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.nombre}
                            </p>
                        )}
                    </div>
                </div>

                {/* SEGUNDA FILA */}
                <div className="flex gap-20">

                    {/* =================== DESCRIPCION =================== */}
                    <div className="flex flex-col gap-3 w-lg">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} />
                            <span>Descripción</span>
                        </div>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripcion de la categoria"
                            rows={3}
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                </div>
            </div>

            {/* ================= BOTONES ================= */}
            <div className="flex justify-end mt-10 w-full gap-4">

                {/* Botón Cancelar */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 text-sm rounded-lg shadow-md font-medium flex items-center gap-2 cursor-pointer"
                >
                    <X size={16} />
                    Cancelar
                </button>

                {/* Botón Principal (Crear / Actualizar) */}
                <PrimaryButton
                    type="submit"
                    disabled={Object.values(errors).some(error => error)} // Desactiva si hay errores
                >
                    {buttonText}
                </PrimaryButton>
            </div>
        </form>
    )
}