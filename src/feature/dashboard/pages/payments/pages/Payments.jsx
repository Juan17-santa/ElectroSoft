import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import paymentsService from "../services/paymentsService";
import ClientCreditCard from "../components/ClientCreditCard";
import SearchBar from "../../../components/ui/Searchbar";
import Pagination from "../../../components/ui/Pagination";
import { CreditCard } from "lucide-react";
import { generarReporteGeneral, generarReporteGeneralPDF } from "../hooks/reportesPayments";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useToast } from "../../../../../context/ToastContext";
import { usePermissions } from "../../../../../hooks/usePermissions";

export default function Payments() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    
    const { hasPermission } = usePermissions();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            await paymentsService.checkAndExpireOverdue();
            const data = await paymentsService.getClientesConCupo();
            setClientes(data);
        } catch (err) {
            const message = "No se pudieron cargar los créditos." || err.message;
            showToast("error", message);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Recarga al navegar a esta ruta
    useEffect(() => {
        cargarDatos();
    }, [location, cargarDatos]);

    // Recarga en tiempo real si algo cambia
    useEffect(() => {
        window.addEventListener("payments-updated", cargarDatos);
        return () => window.removeEventListener("payments-updated", cargarDatos);
    }, [cargarDatos]);

    const filtered = clientes.filter(c => {
        const q = search.toLowerCase();
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const getEstadoStr = (cliente) => {
            if (cliente.estado === false) return "suspendido";
            if (cliente.cupoOcupado > 0) return "por pagar";
            return "al dia al día";
        };

        const estadoStr = getEstadoStr(c);

        return (
            normalize(`${c.nombres} ${c.apellidos}`).includes(normalize(q)) ||
            String(c.documento).includes(q) ||
            String(c.tipoDocumento || "").toLowerCase().includes(q) ||
            estadoStr.includes(normalize(q))
        );
    });

    const totalPages = Math.ceil(filtered.length / recordsPerPage);
    const currentRecords = filtered.slice(
        (presentPage - 1) * recordsPerPage,
        presentPage * recordsPerPage
    );

    return (
        <div className="p-6 flex flex-col gap-6 w-full h-full overflow-y-auto">

            <p className="text-xl font-semibold">
                Control de créditos y abonos
            </p>

            <SearchBar
                searchTerm={search}
                onSearchChange={(e) => { setSearch(e.target.value); setPresentPage(1); }}
                placeholder="Buscar cliente..."
                showReportButton={hasPermission("pagos", "Reporte")}
                onReportClick={() => setShowReportModal(true)}
                showCreateButton={false} // ESTA LÍNEA ES LA CLAVE
            />

            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 text-center shadow-md">
                        <svg className="animate-spin h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        <p className="text-gray-500 text-sm font-medium">Cargando créditos...</p>
                    </div>
                ) : currentRecords.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 text-center shadow-md">
                        <CreditCard size={32} className="text-gray-300" />
                        <p className="text-gray-500 text-sm font-medium">
                            {search
                                ? "No se encontraron clientes con ese criterio."
                                : "No hay clientes con cupo de crédito asignado."}
                        </p>
                        {/* Mensaje orientativo — el cupo se asigna desde Clientes */}
                        {!search && (
                            <p className="text-xs text-gray-400">
                                Los cupos se asignan desde el módulo de{" "}
                                <span className="font-semibold text-yellow-500">Clientes</span>
                                {" "}cuando las compras superan $1.000.000.
                            </p>
                        )}
                    </div>
                ) : (
                    currentRecords.map(cliente => (
                        <ClientCreditCard
                            key={cliente.id}
                            cliente={cliente}
                            onClick={() => navigate(`/dashboard/payments/client/${cliente.documento}`)}
                        />
                    ))
                )}
            </div>

            <div className="flex justify-end mt-auto pt-4">
                <Pagination
                    currentPage={presentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setPresentPage(page)}
                />
            </div>
            {showReportModal && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte"
                    message="Selecciona el rango de fechas para el reporte"
                    showDateFilter={true}
                    showFormatSelector={true}
                    onCancel={() => setShowReportModal(false)}
                    onConfirm={({ fechaInicio, fechaFin, format }) => {
                        try {
                            if (format === "pdf") {
                                generarReporteGeneralPDF(clientes, fechaInicio, fechaFin);
                            } else {
                                generarReporteGeneral(clientes, fechaInicio, fechaFin);
                            }

                            showToast("success", "El reporte se generó correctamente");

                        } catch (error) {
                            showToast("error", "Hubo un error al generar el reporte");
                        }

                        setShowReportModal(false);
                    }}
                />
            )}
        </div>

    );
}