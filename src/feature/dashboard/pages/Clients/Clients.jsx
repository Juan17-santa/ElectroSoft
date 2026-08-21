import { useEffect, useState } from "react";
import { ClientsService } from "./services/ClientsService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import AssignQuotaModal from "./components/AssignQuotaModal";
import CreateClients from "./CreateClients";
import UpdateClients from "./UpdateClients";
import ClientDetailsPage from "./ClientDetailsPage";
import { Eye, Pencil, Trash, CreditCard } from "lucide-react";
import { generateExcelReport } from "../../../../utils/ExcelReportGenerator";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Restricted } from "../../components/ui/Restricted";
import { useToast } from "../../../../context/ToastContext";

const ITEMS_PER_PAGE = 6;

export default function Clients() {
    const { hasPermission } = usePermissions();
    const { showToast } = useToast();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [assignQuotaClient, setAssignQuotaClient] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [clientToView, setClientToView] = useState(null);

    const filteredClients = clients.filter(client =>
        `${client.nombres} ${client.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
        client.documento.toLowerCase().includes(search.toLowerCase()) ||
        client.tipoDocumento.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.telefono.toLowerCase().includes(search.toLowerCase()) ||
        (client.totalCompras && client.totalCompras.toString().includes(search))
    );

    const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
    const pageActual = Math.min(currentPage, totalPages);
    const paginatedClients = filteredClients.slice(
        (pageActual - 1) * ITEMS_PER_PAGE,
        pageActual * ITEMS_PER_PAGE
    );

    useEffect(() => { getClients(); }, []);

    const getClients = async () => {
        setLoading(true);
        try {
            const data = await ClientsService.get();
            setClients(data);
        } catch (err) {
            const message = err.message || "No se pudieron cargar los clientes.";
            showToast("error", message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = (client) => {
        setConfirmData({
            type: "delete",
            title: "Eliminar cliente",
            message: `¿Estás seguro de que deseas eliminar a ${client.nombres} ${client.apellidos}?`,
            onConfirm: async () => {
                try {
                    await ClientsService.delete(client.id);
                    await getClients(); // Refresh list
                    showToast("success", "Cliente eliminado correctamente.");
                } catch (error) {
                    console.error("Error eliminando cliente:", error);
                    showToast("error", "Error al eliminar el cliente.");
                }
                setConfirmData(null);
            }
        });
    };

    const handleAsignarCupo = (client) => {
        setAssignQuotaClient(client);
    };

    const confirmAssignQuota = async (amount) => {
        if (!assignQuotaClient) return;
        try {
            await ClientsService.updateCupo(assignQuotaClient.id, { cupoTotal: amount, cupoActivo: true });
            await getClients();
            showToast("success", `Cupo de $${amount.toLocaleString("es-CO")} asignado exitosamente.`);
        } catch (error) {
            console.error("Error asignando cupo:", error);
            const msg = error?.response?.data?.error || error?.message || "Error al asignar cupo.";
            showToast("error", msg);
        }
        setAssignQuotaClient(null);
    };

    const handleEditNavigation = (client) => {
        setClientToEdit(client);
    };

    const handleViewDetails = (client) => {
        setClientToView(client);
    };

    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de clientes?",
            onConfirm: () => {
                const reportTitle = "Gestión de Clientes - Reporte";
                const columns = ["ID", "Documento", "Nombre completo", "Email", "Teléfono", "Total Compras", "Cupo"];
                const data = filteredClients.map((c, i) => [
                    String(i + 1).padStart(2, "0"),
                    `${c.abreviacion} - ${c.documento}`,
                    `${c.nombres} ${c.apellidos}`,
                    c.email,
                    c.telefono,
                    `$${c.totalCompras?.toLocaleString("es-CO") || "0"}`,
                    c.cupoActivo ? `$${c.cupoTotal?.toLocaleString("es-CO")}` : "Sin cupo"
                ]);

                generateExcelReport({
                    title: reportTitle,
                    fileName: "reporte_clientes.xlsx",
                    columns: columns,
                    data: data
                });

                showToast("success", "Reporte Excel generado correctamente.");
                setConfirmData(null);
            }
        });
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6 w-full h-full">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de clientes</p>

                {/* BUSCADOR */}
                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar clientes..."
                    onCreateClick={() => setIsCreateModalOpen(true)}
                    createButtonText="Nuevo cliente"
                    showCreateButton={hasPermission("Clientes", "Crear")}
                    showReportButton={hasPermission("Clientes", "Reporte")}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-yellow-200">
                    <div className="rounded-2xl border-none overflow-x-auto">
                        <table className="min-w-240 w-full text-sm table-fixed">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold w-8">ID</th>
                                    <th className="px-3 py-2 font-semibold w-24">Documento</th>
                                    <th className="px-3 py-2 font-semibold w-32">Nombre</th>
                                    <th className="px-3 py-2 font-semibold w-36">Email</th>
                                    <th className="px-3 py-2 font-semibold w-24">Teléfono</th>
                                    <th className="px-3 py-2 font-semibold w-24">Total Compras</th>
                                    <th className="px-3 py-2 font-semibold w-24">Cupo</th>
                                    <th className="px-3 py-2 font-semibold text-center w-36">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                Cargando clientes...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                                            No hay clientes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedClients.map((client, index) => (
                                        <tr key={client.id} className="border-b border-gray-300">
                                            <td className="px-3 py-2">
                                                {String((pageActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                            </td>
                                            <td className="px-3 py-2">
                                                {client.abreviacion} <br />
                                                {client.documento}
                                            </td>
                                            <td className="px-3 py-2 truncate">{client.nombres} {client.apellidos}</td>
                                            <td className="px-3 py-2 truncate">{client.email}</td>
                                            <td className="px-3 py-2 w-20">{client.telefono}</td>
                                            <td className="px-3 py-2 w-24">${client.totalCompras?.toLocaleString("es-CO")}</td>
                                            <td className="px-3 py-2 w-24">
                                                {client.cupoActivo ? (
                                                    <span className="text-green-600 font-medium">
                                                        ${client.cupoTotal?.toLocaleString("es-CO")}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        Sin cupo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 w-36">
                                                <div className="flex justify-center flex-nowrap gap-1.5 h-9">
                                                    {hasPermission("Clientes", "Editar") && (
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            <Restricted scope="Clientes" action="Cupo">
                                                            <button
                                                                onClick={() => handleAsignarCupo(client)}
                                                                disabled={client.totalCompras < 1000000}
                                                                className={`p-2 rounded-lg transition ${client.totalCompras >= 1000000
                                                                    ? "bg-green-200 text-green-700 hover:bg-green-300 cursor-pointer"
                                                                    : "bg-gray-300 cursor-not-allowed opacity-50"
                                                                    }`}
                                                                title={
                                                                    client.totalCompras >= 1000000
                                                                        ? "Asignar cupo"
                                                                        : "Debe superar $1.000.000 en compras"
                                                                }
                                                            >
                                                                <CreditCard size={18} />
                                                            </button>
                                                            </Restricted>
                                                        </div>
                                                    )}
                                                    <div className="flex-none flex items-center justify-center w-9 h-9">
                                                        <Restricted scope="Clientes" action="Ver">
                                                            <button
                                                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                                onClick={() => handleViewDetails(client)}
                                                                title="Ver detalles"
                                                            >
                                                                <Eye size={18} className="text-blue-600" />
                                                            </button>
                                                        </Restricted>
                                                    </div>
                                                    <Restricted scope="Clientes" action="Editar">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            <button
                                                                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                                onClick={() => handleEditNavigation(client)}
                                                                title="Editar cliente"
                                                            >
                                                                <Pencil size={18} className="text-yellow-600" />
                                                            </button>
                                                        </div>
                                                    </Restricted>
                                                    <Restricted scope="Clientes" action="Eliminar">
                                                        <div className="flex-none flex items-center justify-center w-9 h-9">
                                                            <button
                                                                className={`p-2 rounded-lg transition ${
                                                                    client.totalCompras > 0
                                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                        : "bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
                                                                }`}
                                                                onClick={() => handleDelete(client)}
                                                                disabled={client.totalCompras > 0}
                                                                title={client.totalCompras > 0 ? "No se puede eliminar: el cliente tiene historial de compras" : "Eliminar cliente"}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        </div>
                                                    </Restricted>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                {paginatedClients.length > 0 && (
                    <div className="flex justify-end mt-auto">
                        <Pagination
                            currentPage={pageActual}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
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

            {/* MODAL ASIGNAR CUPO */}
            <AssignQuotaModal
                isOpen={!!assignQuotaClient}
                onClose={() => setAssignQuotaClient(null)}
                onConfirm={confirmAssignQuota}
                clientName={assignQuotaClient ? `${assignQuotaClient.nombres} ${assignQuotaClient.apellidos}` : ''}
                currentQuota={assignQuotaClient?.cupoTotal || 0}
            />

            {/* MODAL CREAR CLIENTE */}
            <CreateClients
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    getClients();
                    setCurrentPage(1);
                }}
            />

            {/* MODAL EDITAR CLIENTE */}
            <UpdateClients
                isOpen={!!clientToEdit}
                onClose={() => setClientToEdit(null)}
                onSuccess={getClients}
                initialClient={clientToEdit}
            />

            {/* MODAL DETALLES */}
            <ClientDetailsPage
                isOpen={!!clientToView}
                onClose={() => setClientToView(null)}
                client={clientToView}
            />
        </>
    );
}