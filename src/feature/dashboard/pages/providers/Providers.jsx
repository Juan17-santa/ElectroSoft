import { Trash, Pencil, Plus, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProviders } from "./services/ServicesProviders";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/alert";

export default function Providers() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // OBTENER LOS PROVEEDORES
    const [providers, setProviders] = useState([]);

    // ESTADO PARA EL BUSCADOR
    const [search, setSearch] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // FUNCION PARA MOSTRAR ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // FUNCION PAGINADOR, PAGINA ACTUAL DEL PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // FILTRAR LOS PROVEEDORES POR NOMBRE
    const filteredProviders = providers.filter(pro => {
        const query = search.toLowerCase();
        const telefono = pro.telefonoContacto ? String(pro.telefonoContacto) : "";

        return (
            pro.nombreProveedor?.toLowerCase().includes(query) ||
            pro.tipoDoc?.toLowerCase().includes(query) ||
            pro.documento?.toLowerCase().includes(query) ||
            pro.nombreContacto?.toLowerCase().includes(query) ||
            telefono.includes(query) || // Ahora es un string garantizado            
            (pro.estado ? "activo" : "inactivo").includes(query)
        );
    });

    // CÁLCULO DE PAGINACIÓN
    const totalPages = Math.ceil(filteredProviders.length / recordsPerPage);
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const PresentRecords = filteredProviders.slice(firstIndex, lastIndex);

    // OBTENER PROVEEDORES AL CARGAR EL COMPONENTE
    useEffect(() => {
        getproviders();
    }, [])

    // FUNCION PARA OBTENER PROVEEDORES
    const getproviders = async () => {
        try {
            const response = ServicesProviders.get();
            setProviders(response)
        } catch (error) {
            console.error(error)
        }
    }

    // FUNCION PARA OBTENER CATEGORIAS PARA LA TABLA
    const categorias = JSON.parse(localStorage.getItem("productCategory")) || [];

    // FUNCION PARA PREPARAR LA VISTA DE DETALLES
    const handleDetailsNavigation = (provider) => {
        // Guardamos el proveedor seleccionado para que el otro componente la lea
        localStorage.setItem("providerToView", JSON.stringify(provider));
        // Navegamos
        navigate("/dashboard/providers/detail");
    };

    // FUNCIÓN PARA PREPARAR LA EDICIÓN
    const handleEditNavigation = (provider) => {
        // Guardamos el proveedor seleccionado para que el otro componente la lea
        localStorage.setItem("providerToEdit", JSON.stringify(provider));
        // Navegamos
        navigate("/dashboard/providers/update");
    };

    // FUNCION PARA ELIMINAR UN PROVEEDOR
    const handleDelete = (id) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar proveedor",
            message: "¿Seguro que deseas eliminar este proveedor? Esta acción no se puede deshacer.",
            onConfirm: () => {
                // Guardamos lo que devuelve el servicio (la lista sin el eliminado)
                const nuevosProveedores = ServicesProviders.delete(id);

                // Actualizamos el estado de React para que la lista cambie en pantalla
                setProviders(nuevosProveedores);

                // Cerramos el modal
                setConfirmData(null);

                // Lanzamos la alerta de éxito
                showAlert("success", "Proveedor eliminado con éxito");
            },
            onCancel: () => setConfirmData(null)
        });
    };

    // FUNCION PARA CAMBIO DE ESTADO
    const handleToggleEstado = (id) => {
        setConfirmData({
            type: "warning",
            title: "Cambiar estado del proveedor",
            message: "¿Seguro que deseas cambiar el estado de este proveedor?",
            onConfirm: () => {
                // Cambiamos el estado en el servicio y obtenemos la lista actualizada
                const nuevosProveedores = ServicesProviders.toggleEstado(id);

                // Actualizamos react
                setProviders(nuevosProveedores);

                // Cerramos el modal
                setConfirmData(null);

                // Lanzamos la alerta
                showAlert("success", "Estado del proveedor actualizado con éxito");
            },
            onCancel: () => setConfirmData(null)
        });
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de proveedores</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between">
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar proveedores..."
                        className="w-4/5"
                    />
                    <PrimaryButton
                        onClick={() => navigate("/dashboard/providers/create")}
                        icon={Plus}
                    >
                        Crear proveedor
                    </PrimaryButton>
                </div>

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">

                        <table className="w-full text-sm table-fixed">

                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold w-12">ID</th>
                                    <th className="px-3 py-2 font-semibold w-28">Documento</th>
                                    <th className="px-3 py-2 font-semibold w-36">Nombre proveedor</th>
                                    <th className="px-3 py-2 font-semibold w-32">Nombre contacto</th>
                                    <th className="px-3 py-2 font-semibold w-28">Telefono contacto</th>
                                    <th className="px-3 py-2 font-semibold w-44">Categorias asociadas</th>
                                    <th className="px-3 py-2 font-semibold w-28">Estado</th>
                                    <th className="px-3 py-2 font-semibold">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {PresentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">
                                            No se encontraron proveedores.
                                        </td>
                                    </tr>
                                ) : (
                                    PresentRecords.map((provider, index) => (
                                        <tr key={provider.id} className="border-b border-gray-300">
                                            <td className="px-3 py-2 ">{index + 1}</td>
                                            <td
                                                className="px-3 py-2 "
                                            >
                                                {provider.tipoDoc}<br />
                                                {provider.documento}
                                            </td>
                                            <td className="px-3 py-2">{provider.nombreProveedor}</td>
                                            <td className="px-3 py-2">{provider.nombreContacto}</td>
                                            <td className="px-3 py-2">{provider.telefonoContacto}</td>
                                            <td className="px-3 py-2">
                                                {provider.categoriasAsociadas?.length > 0 ? (
                                                    provider.categoriasAsociadas
                                                        .map(id => {
                                                            const cat = categorias.find(c => c.id === id);
                                                            return cat?.nombre;
                                                        })
                                                        .join(", ")
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        Sin categorías asociadas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full 
                                                    ${provider.estado === true ? "bg-green-500" : "bg-red-500"}`}
                                                    ></span>
                                                    <span>
                                                        {provider.estado ? "Activo" : "Inactivo"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-1 py-1">
                                                <div className="flex justify-center gap-2">

                                                    {/* BOTON DE VER DETALLE */}
                                                    <button
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition cursor-pointer"
                                                        onClick={() => handleDetailsNavigation(provider)}
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>

                                                    {/* BOTON EDITAR */}
                                                    <button
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                        onClick={() => handleEditNavigation(provider)}
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>

                                                    <div className="flex justify-center items-center gap-2">
                                                        <div
                                                            onClick={() => handleToggleEstado(provider.id)}
                                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition
                                                        ${provider.estado ? "bg-green-500" : "bg-red-500"}`}
                                                        >
                                                            <div
                                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition
                                                            ${provider.estado ? "translate-x-4" : "translate-x-0"}`}
                                                            >
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BOTON ELIMINAR */}
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        onClick={() => handleDelete(provider.id)}
                                                    >
                                                        <Trash size={18} className="text-red-600" />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* PAGINACION */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>
            </div>
            {/* MODAL DE CONFIRMACION */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
            {/* ALERTA DE EXITO O ERROR */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    )
}