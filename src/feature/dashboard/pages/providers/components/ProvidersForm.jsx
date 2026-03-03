/*
ProviderForm

Componente reutilizable que renderiza el formulario
para crear o actualizar un proveedor.

Este componente SOLO maneja la parte visual (UI).
La lógica (estado, validaciones, envío) se recibe
desde el componente padre mediante props.

Responsabilidades:
✔ Mostrar campos del formulario
✔ Mostrar errores de validación
✔ Mostrar selector de categorías
✔ Ejecutar funciones enviadas por props
✔ Renderizar botones de acción

No contiene lógica de negocio.
*/

import PrimaryButton from "../../../components/ui/PrimaryButton"; // Botón principal reutilizable
import { IdCard, FileText, User, ChevronDown, X } from "lucide-react"; // Iconos
import { useRef, useEffect } from "react";

export default function ProviderForm({
    formData,              // Datos actuales del formulario
    errors,                // Errores de validación
    categorias,            // Lista de categorías disponibles
    open,                  // Estado que controla apertura del dropdown
    setOpen,               // Función para abrir/cerrar dropdown
    handleChange,          // Función para manejar cambios en inputs
    handleToggleCategoria, // Función para seleccionar/deseleccionar categorías
    handleSubmit,          // Función para enviar formulario
    buttonText,            // Texto dinámico del botón (Crear / Actualizar)
    onCancel               // Función para cancelar
}) {

    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        // Formulario principal
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">

            {/* Contenedor principal del formulario */}
            <div className="flex flex-col items-center gap-12 mt-6 justify-around mx-28">

                {/* PRIMERA FILA */}
                <div className="flex gap-20">

                    {/* ================= TIPO DOCUMENTO ================= */}
                    <div className="flex flex-col gap-3 w-80">

                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <IdCard size={16} />
                            <span>Tipo de documento *</span>
                        </div>

                        <select
                            name="tipoDoc"
                            value={formData.tipoDoc}
                            onChange={handleChange}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                            ${errors.tipoDoc ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        >
                            <option value="" hidden>Seleccione un tipo</option>
                            <option value="NIT">NIT</option>
                            <option value="CC">C.C</option>
                            <option value="CE">C.E</option>
                        </select>

                        {errors.tipoDoc && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.tipoDoc}
                            </p>
                        )}
                    </div>

                    {/* ================= DOCUMENTO ================= */}
                    <div className="flex flex-col gap-3 w-80">

                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} />
                            <span>Documento *</span>
                        </div>

                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            placeholder="Ingrese su documento"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                            ${errors.documento ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />

                        {errors.documento && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.documento}
                            </p>
                        )}
                    </div>
                </div>

                {/* ================= SEGUNDA FILA ================= */}
                <div className="flex gap-20">

                    {/* ================= NOMBRE PROVEEDOR ================= */}
                    <div className="flex flex-col gap-3 w-80">

                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Nombre Proveedor *</span>
                        </div>

                        <input
                            type="text"
                            name="nombreProveedor"
                            value={formData.nombreProveedor}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre del proveedor"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 
                            ${errors.nombreProveedor ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />

                        {errors.nombreProveedor && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.nombreProveedor}
                            </p>
                        )}
                    </div>

                    {/* ================= CATEGORÍAS ASOCIADAS ================= */}
                    <div ref={dropdownRef} className="relative">
                        <div className="flex flex-col gap-3 w-80 relative">

                            <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                <User size={16} />
                                <span>Categorías Asociadas</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md flex justify-between items-center"
                            >
                                <span>
                                    {formData.categoriasAsociadas.length > 0
                                        ? `${formData.categoriasAsociadas.length} seleccionada(s)`
                                        : "Seleccionar categorías"}
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown de categorías */}
                            {open && (
                                <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl p-3 max-h-48 overflow-y-auto z-20">

                                    {/* Mapear todas las categorías */}
                                    {categorias.map(cat => (
                                        <label
                                            key={cat.id}
                                            className="flex items-center gap-2 py-1 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.categoriasAsociadas.includes(cat.id)}
                                                onChange={() => handleToggleCategoria(cat.id)}
                                                className="accent-yellow-400"
                                            />
                                            {cat.nombre}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= TERCERA FILA ================= */}
                <div className="flex gap-20">

                    {/* ================= NOMBRE CONTACTO ================= */}
                    <div className="flex flex-col gap-3 w-80">

                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Nombre Contacto *</span>
                        </div>

                        <input
                            type="text"
                            name="nombreContacto"
                            value={formData.nombreContacto}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre de contacto"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md 
                            ${errors.nombreContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />

                        {errors.nombreContacto && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.nombreContacto}
                            </p>
                        )}
                    </div>

                    {/* ================= TELÉFONO CONTACTO ================= */}
                    <div className="flex flex-col gap-3 w-80">

                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Telefono Contacto *</span>
                        </div>

                        <input
                            type="text"
                            name="telefonoContacto"
                            value={formData.telefonoContacto}
                            onChange={handleChange}
                            placeholder="Ingrese el telefono"
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md 
                            ${errors.telefonoContacto ? "focus:ring-red-500" : "focus:ring-yellow-400"}`}
                        />

                        {errors.telefonoContacto && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.telefonoContacto}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= BOTONES ================= */}
            <div className="flex justify-end gap-4 mt-auto">

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
    );
}