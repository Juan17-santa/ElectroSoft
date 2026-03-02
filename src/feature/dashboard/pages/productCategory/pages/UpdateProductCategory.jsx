import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { X } from "lucide-react";
import Alert from "../../../components/ui/alert";
import ProductCategoryForm from "../components/ProductCategoryForm";
import useProductCategoryForm from "../hooks/UseProductCategoryForm";

export default function UpdateProductCategory() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA RECIBIR LA CATEGORIA A EDITAR DESDE EL INDEX
    const location = useLocation();
    const categoryToEdit = location.state?.category;

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // SI NO LLEGA LA CATEGORIA, REDIRIGIR A LA LISTA
    if (!categoryToEdit) {
        navigate("/dashboard/productCategory");
        return null;
    }

    // CONFIGURACION DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit
    } = useProductCategoryForm({
        initialData: categoryToEdit,
        mode: "update",
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Categoría Actualizada correctamente"
            });

            setTimeout(() => {
                navigate("/dashboard/productCategory");
            }, 2000);
        }
    });

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
                        onClick={() => navigate("/dashboard/productCategory")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <ProductCategoryForm 
                    formData={formData}
                    errors={errors}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    buttonText={"Editar categoria"}
                    onCancel={() => navigate ("/dashboard/productCategory")}
                />

            </div >

            {/* ALERTA DE EXITO O ERROR */}
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