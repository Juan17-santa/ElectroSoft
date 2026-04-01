import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { X } from "lucide-react";
import Alert from "../../../components/ui/Alert";
import ProviderForm from "../components/ProvidersForm";
import { useProviderForm } from "../hooks/useProviderForm";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";

export default function UpdateProvider() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA RECIBIR DATOS DEL PROVEEDOR A EDITAR DESDE EL INDEX
    const location = useLocation();
    const providerToEdit = location.state?.provider;

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // OBTENER LAS CATEGORIAS
    const todasLasCategorias = ServiceProductCategory.get();

    // LIMPIAR EL PROVEEDOR PARA NO MUTAR EL ORIGINAL
    const providerClean = {
        ...providerToEdit,
        categoriasAsociadas: providerToEdit?.categoriasAsociadas?.filter(catId =>
            todasLasCategorias.some(c => String(c.id) === String(catId))
        ) || []
    };

    // IDS DEL PROVEEDOR
    const idsDelProveedor = providerClean.categoriasAsociadas;

    // CATEGORIAS ACTIVAS Y LAS INACTIVAS QUE TENGA EL PROVEEDOR
    const categoriasParaMostrar = todasLasCategorias.filter(cat =>
        cat.estado === true || idsDelProveedor.some(id => String(id) === String(cat.id))
    );

    // SI NO LLEGA EL PROVEEDOR, REDIRIGIR A LA LISTA
    useEffect(() => {
        if (!providerToEdit) {
            navigate("/dashboard/providers");
        }
    }, [providerToEdit, navigate]);

    // CONFIGURACION DEL HOOK PERSONALIZADO PARA EL FORMULARIO
    const {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setCategoriasAsociadas,
    } = useProviderForm({
        initialData: providerClean,
        mode: "update",
        onSuccess: () => {
            setAlert({
                type: "success",
                message: "Proveedor actualizado con éxito."
            });
            setTimeout(() => {
                navigate("/dashboard/providers");
            }, 2000);
        }
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner h-full">

                {/* HEADER DE LA PÁGINA */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-2">
                            Editar proveedor
                        </p>
                        <p className="text-sm text-gray-600">
                            Complete todos los campos del formulario
                        </p>
                    </div>
                    {/* <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button> */}
                </div>

                {/* FORMULARIO */}
                <ProviderForm
                    formData={formData}
                    errors={errors}
                    categorias={categoriasParaMostrar}
                    handleChange={handleChange}
                    setCategoriasAsociadas={setCategoriasAsociadas}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate("/dashboard/providers")}
                    buttonText="Actualizar proveedor"
                />

                {/* ALERTA */}
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}
            </div>
        </>
    )
}