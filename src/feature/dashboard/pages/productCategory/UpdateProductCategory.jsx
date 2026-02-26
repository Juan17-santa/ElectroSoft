import { User, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceProductCategory } from "./services/ServicesProductCategory";
import { Validations } from "../../../../utils/validations";
import Alert from "../../components/ui/alert";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function UpdateProductCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        estado: true
    });

    const [errors, setErrors] = useState({
        nombre: ""
    });

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("categoryToEdit");

        if (data) {
            setFormData(JSON.parse(data));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Validación en tiempo real
        if (name === "nombre") {
            if (!value.trim()) {
                setErrors(prev => ({
                    ...prev,
                    nombre: "El nombre es obligatorio"
                }));
            } else if (!Validations.soloLetras(value)) {
                setErrors(prev => ({
                    ...prev,
                    nombre: "El nombre no puede contener números"
                }));
            } else if (value.trim().length < 5) {
                setErrors(prev => ({
                    ...prev,
                    nombre: "El nombre debe tener mínimo 5 caracteres"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    nombre: ""
                }));
            }
        }
    };

    const handleForm = (e) => {
        e.preventDefault();

        try {

            if (!Validations.soloLetras(formData.nombre)) {
                setAlert({
                    type: "error",
                    message: "El nombre no puede contener números"
                });
                return;
            }

            if (formData.nombre.trim().length < 5) {
                setAlert({
                    type: "error",
                    message: "El nombre debe tener mínimo 5 caracteres"
                });
                return;
            }

            ServiceProductCategory.update(formData);

            setAlert({
                type: "success",
                message: "Categoría actualizada correctamente"
            });

            setTimeout(() => {
                localStorage.removeItem("categoryToEdit"); // limpiamos localstorage
                navigate("/dashboard/product-category");
            }, 3000);

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
                    <div className="flex flex-col items-center gap-10 mt-6">
                        {/* NOMBRE */}
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

                        {/* DESCRIPCION */}
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

                        {/* BOTONES */}
                        <div className="flex justify-end mt-6 w-full gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/product-category")}
                                className="px-5 py-2  text-sm rounded-lg shadow-md font-medium transition flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 hover:shadow-lg duration-300 cursor-pointer"
                            >
                                <X size={16} />
                                Cancelar
                            </button>
                            <PrimaryButton
                                type="submit"
                                disabled={!!errors.nombre}
                            >
                                Editar Categoria
                            </PrimaryButton>
                        </div>
                    </div>
                </form >
            </div >
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