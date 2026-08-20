import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/ui/Pagination";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import ProvidersTable from "../components/ProvidersTable";
import useProvidersTable from "../hooks/useProvidersTable";
import SearchBar from "../../../components/ui/Searchbar";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { useToast } from "../../../../../context/ToastContext";

export default function Providers() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [confirmData, setConfirmData] = useState(null);

    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    const handleDetailsNavigation = (provider) => {
        navigate(`/dashboard/providers/detail/${provider._id}`);
    };

    const handleEditNavigation = (provider) => {
        navigate(`/dashboard/providers/update/${provider._id}`);
    };

    const {
        data,
        totalPages,
        deleteProvider,
        toggleEstado,
        loading
    } = useProvidersTable({
        setConfirmData,
        showAlert: showToast,
        searchTerm,
        currentPage: presentPage,
        recordsPerPage
    });

    return (
        <>
            <div className="p-4 sm:p-6 flex flex-col gap-6 w-full h-full">

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
                            loading={loading}
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
        </>
    );
}