import { User, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateProductCategory() {
    const navigate = useNavigate();

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nueva categoria <span className="text-yellow-400">de productos</span></p>
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
                <div className="flex flex-wrap gap-10 mt-6 justify-around mx-28">

                    {/* NOMBRE */}
                    <div className="flex flex-col gap-3 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <User size={16} />
                            <span>Nombre *</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ingrese el nombre de la categoria"
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {/* DESCRIPCION */}
                    <div className="flex flex-col gap-3 w-80">
                        <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                            <FileText size={16} />
                            <span>Descripción *</span>
                        </div>
                        <textarea
                            placeholder="Descripcion de la categoria"
                            rows={3}
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {/* BOTON */}
                    <div className="flex justify-end mt-6 w-full">
                        <button className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow transition cursor-pointer font-medium">
                            Registrar Categoria
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}