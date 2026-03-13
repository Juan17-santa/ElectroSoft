import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProviders } from "../services/ServicesProviders";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/alert";
import ProvidersTable from "../components/ProvidersTable";
import useProvidersTable from "../hooks/useProvidersTable";
import SearchBar from "../../../components/ui/Searchbar";

// COMPONENTE PRINCIPAL PARA LA GESTIÓN DE PROVEEDORES
export default function Providers() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO PARA EL TEXTO DEL BUSCADOR
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADO PARA EL MODAL DE CONFIRMACION
    const [confirmData, setConfirmData] = useState(null);

    // ESTADO PARA LA ALERTA DE EXITO O ERROR
    const [alert, setAlert] = useState(null);

    // FUNCION PARA MOSTRAR ALERTA
    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    // FUNCION PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

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

    // USO DEL HOOK PERSONALIZADO QUE MANEJA LA LÓGICA DE LA TABLA
    const {
        data,
        totalPages,
        deleteProvider,
        toggleEstado
    } = useProvidersTable({
        setConfirmData,
        showAlert,
        searchTerm,
        currentPage: presentPage,
        recordsPerPage
    });

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de proveedores</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar proveedores..."
                    onCreateClick={() => navigate("/dashboard/providers/create")}
                    createButtonText="Crear proveedor"
                />

                {/* TABLA */}
                <ProvidersTable
                    data={data}
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