import { Trash, Pencil, Plus, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProviders } from "../services/ServicesProviders";
import Pagination from "../../../components/ui/Pagination";
import SearchInput from "../../../components/ui/SearchInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/alert";
import ProvidersTable from "../components/ProvidersTable";
import { useProvidersTable } from "../hooks/useProvidersTable";

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
        navigate("/dashboard/providers/detail", {
            state: { provider },
        });
    };

    // FUNCIÓN PARA PREPARAR LA EDICIÓN
    const handleEditNavigation = (provider) => {
        navigate("/dashboard/providers/update", {
            state: { provider }
        });
    };

    // USAMOS EL HOOK PERSONALIZADO PARA OBTENER LAS FUNCIONES DE ELIMINAR Y TOGGLE ESTADO
    const { deleteProvider, toggleEstado } =
        useProvidersTable({
            setProviders,
            setConfirmData,
            showAlert,
        });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
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
                <ProvidersTable
                    data={PresentRecords}
                    categorias={categorias}
                    onDetails={handleDetailsNavigation}
                    onEdit={handleEditNavigation}
                    onDelete={deleteProvider}
                    onToggleEstado={toggleEstado}
                />

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