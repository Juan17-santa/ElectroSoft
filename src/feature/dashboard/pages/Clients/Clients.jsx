import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";
import Searchbar from "../../components/ui/Searchbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Alert from "../../components/ui/Alert";
import AssignQuotaModal from "./components/AssignQuotaModal";
import { Eye, Pencil, Trash, CreditCard } from "lucide-react";
import { generateExcelReport } from "../../../../utils/ExcelReportGenerator";

const ITEMS_PER_PAGE = 6;

export default function Clients() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmData, setConfirmData] = useState(null);
    const [assignQuotaClient, setAssignQuotaClient] = useState(null);
    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => setAlert({ type, message });

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

    const getClients = () => {
        try {
            setClients(ClientsService.get());
        } catch (error) {
            console.error(error);
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
            onConfirm: () => {
                const newData = ClientsService.delete(client.id);
                setClients(newData);
                showAlert("success", "Cliente eliminado correctamente.");
                setConfirmData(null);
            }
        });
    };

    const handleAsignarCupo = (client) => {
        setAssignQuotaClient(client);
    };

    const confirmAssignQuota = (amount) => {
        if (!assignQuotaClient) return;
        const clientActualizado = { ...assignQuotaClient, cupoActivo: true, cupoTotal: amount };
        const newData = ClientsService.update(clientActualizado);
        setClients(newData);
        showAlert("success", `Cupo de $${amount.toLocaleString("es-CO")} asignado exitosamente.`);
        setAssignQuotaClient(null);
    };

    const handleEditNavigation = (client) => {
        localStorage.setItem("clientToEdit", JSON.stringify(client));
        navigate("/dashboard/clients/update");
    };

    const handleViewDetails = (client) => {
        localStorage.setItem("clientToView", JSON.stringify(client));
        navigate("/dashboard/clients/details");
    };

    const handleGenerarReporte = () => {
        setConfirmData({
            type: "info",
            title: "Generar reporte",
            message: "¿Deseas descargar el reporte de clientes?",
            onConfirm: () => {
                const reportTitle = "Gestión de Clientes - Reporte";
                const columns = ["ID", "Tipo Doc", "Documento", "Nombre", "Email", "Teléfono", "Total Compras"];
                const data = filteredClients.map((c, i) => [
                    String(i + 1).padStart(2, "0"),
                    c.tipoDocumento,
                    c.documento,
                    `${c.nombres} ${c.apellidos}`,
                    c.email,
                    c.telefono,
                    `$${c.totalCompras?.toLocaleString("es-CO") || "0"}`
                ]);

                generateExcelReport({
                    title: reportTitle,
                    fileName: "reporte_clientes.xlsx",
                    columns: columns,
                    data: data
                });

                showAlert("success", "Reporte Excel generado correctamente.");
                setConfirmData(null);
            }
        });
    };

    return (
        <>
            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Gestión de clientes</p>

                {/* BUSCADOR */}
                <Searchbar
                    searchTerm={search}
                    onSearchChange={handleSearch}
                    placeholder="Buscar por nombre, documento..."
                    onCreateClick={() => navigate("/dashboard/clients/create")}
                    createButtonText="Crear cliente"
                    showReportButton={true}
                    onReportClick={handleGenerarReporte}
                />

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">
                        <table className="w-full text-sm table-fixed">
                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-3 py-2 font-semibold w-8">ID</th>
                                    <th className="px-3 py-2 font-semibold w-16">Tipo Doc</th>
                                    <th className="px-3 py-2 font-semibold w-24">Documento</th>
                                    <th className="px-3 py-2 font-semibold w-32">Nombre</th>
                                    <th className="px-3 py-2 font-semibold w-32">Email</th>
                                    <th className="px-3 py-2 font-semibold w-20">Teléfono</th>
                                    <th className="px-3 py-2 font-semibold w-24">Compras Anual</th>
                                    <th className="px-3 py-2 font-semibold text-center w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-gray-700 text-sm">
                                {paginatedClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                            No hay clientes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedClients.map((client, index) => (
                                        <tr key={client.id} className="border-b border-gray-300">
                                            <td className="px-3 py-2 w-8">
                                                {String((pageActual - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                                            </td>
                                            <td className="px-3 py-2 w-16">{client.tipoDocumento}</td>
                                            <td className="px-3 py-2 w-24">{client.documento}</td>
                                            <td className="px-3 py-2 w-32 truncate">{client.nombres} {client.apellidos}</td>
                                            <td className="px-3 py-2 w-32 truncate">{client.email}</td>
                                            <td className="px-3 py-2 w-20">{client.telefono}</td>
                                            <td className="px-3 py-2 w-24">${client.totalCompras?.toLocaleString("es-CO")}</td>
                                            <td className="px-3 py-2 w-24">
                                                <div className="flex justify-end gap-1.5">
                                                    {client.totalCompras > 1000000 && (
                                                        <button
                                                            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition duration-300 cursor-pointer"
                                                            onClick={() => handleAsignarCupo(client)}
                                                            title="Asignar cupo"
                                                        >
                                                            <CreditCard size={18} className="text-green-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                        onClick={() => handleViewDetails(client)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} className="text-blue-600" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                        onClick={() => handleEditNavigation(client)}
                                                        title="Editar cliente"
                                                    >
                                                        <Pencil size={18} className="text-yellow-600" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                        onClick={() => handleDelete(client)}
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash size={18} className="text-red-600" />
                                                    </button>
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
                <div className="flex justify-end mt-auto">
                    <Pagination
                        currentPage={pageActual}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
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

            {/* MODAL ASIGNAR CUPO */}
            <AssignQuotaModal
                isOpen={!!assignQuotaClient}
                onClose={() => setAssignQuotaClient(null)}
                onConfirm={confirmAssignQuota}
                clientName={assignQuotaClient ? `${assignQuotaClient.nombres} ${assignQuotaClient.apellidos}` : ''}
            />

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