import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Alert from "../../../components/ui/Alert";
import ProvidersTable from "../components/ProvidersTable";
import useProvidersTable from "../hooks/useProvidersTable";
import SearchBar from "../../../components/ui/Searchbar";
import { usePermissions } from "../../../../../hooks/usePermissions";

export default function Providers() {
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [confirmData, setConfirmData] = useState(null);
    const [alert, setAlert] = useState(null);

    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    const categorias = JSON.parse(localStorage.getItem("productCategory")) || [];

    const showAlert = (type, message) => {
        setAlert({ type, message });
    };

    const handleDetailsNavigation = (provider) => {
        navigate("/dashboard/providers/detail", { state: { provider } });
    };

    const handleEditNavigation = (provider) => {
        navigate("/dashboard/providers/update", { state: { provider } });
    };

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
            <div className="bg-gray-100 p-4 sm:p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                <p className="text-lg sm:text-xl font-semibold">
                    Control de proveedores
                </p>

                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPresentPage(1);
                    }}
                    placeholder="Buscar proveedores..."
                    onCreateClick={() => navigate("/dashboard/providers/create")}
                    createButtonText="Nuevo proveedor"
                    showCreateButton={hasPermission("Proveedores", "Crear")}
                />

                {/* TABLA RESPONSIVE */}
                <div className="w-full overflow-x-auto">
                    <div className="min-w-max">
                        <ProvidersTable
                            data={data}
                            categorias={categorias}
                            onDetails={handleDetailsNavigation}
                            onEdit={handleEditNavigation}
                            onDelete={deleteProvider}
                            onToggleEstado={toggleEstado}
                        />
                    </div>
                </div>

                {/* PAGINADOR */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>
            </div>

            {/* MODAL */}
            {confirmData && (
                <ConfirmModal
                    type={confirmData.type}
                    title={confirmData.title}
                    message={confirmData.message}
                    onConfirm={confirmData.onConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}

            {/* ALERTA */}
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