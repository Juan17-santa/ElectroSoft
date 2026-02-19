import { User, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "./services/ServicesProductCategory";

export default function UpdateProductCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        estado: true
    });

    useEffect(() => {
        const data = localStorage.getItem("categoryToEdit");

        if (data) {
            setFormData(JSON.parse(data));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleForm = (e) => {
        e.preventDefault();

        try {

            if (formData.nombre.length < 5) {
                alert("El nombre debe tener mínimo 5 caracteres");
                return;
            }

            ServiceProductCategory.update(formData);

            alert("Categoría actualizada correctamente!");

            // LIMPIEZA: Borramos el rastro del localStorage
            localStorage.removeItem("categoryToEdit");

            navigate("/dashboard/product-category");

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Editar categoria <span className="text-yellow-400">de productos</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/product-category")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm}>
                    <div className="flex flex-wrap gap-10 mt-6 justify-around mx-28">

                        {/* NOMBRE */}
                        <div className="flex flex-col gap-3 w-80">
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
                                className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        {/* DESCRIPCION */}
                        <div className="flex flex-col gap-3 w-80">
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

                        {/* BOTON */}
                        <div className="flex justify-end mt-6 w-full">
                            <button
                                type="submit"
                                className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                            >
                                Editar Categoria
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}