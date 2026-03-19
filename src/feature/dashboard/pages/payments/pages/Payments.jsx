import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import paymentsService from "../services/paymentsService";
import { ClientsService } from "../../Clients/services/ClientsService"; // ajusta el path
import ClientCreditCard from "../components/ClientCreditCard";
import AsignarCupoModal from "../components/AsignarCupoModal";
import SearchBar from "../../../components/ui/Searchbar";
import Pagination from "../../../components/ui/Pagination";
import { CreditCard } from "lucide-react";
import { generarReporteGeneral } from "../hooks/reportesPayments";

export default function Payments() {
    const navigate  = useNavigate();
    const location  = useLocation();

    const [clientes,     setClientes]     = useState([]);
    const [search,       setSearch]       = useState("");
    const [presentPage,  setPresentPage]  = useState(1);
    const [showModal,    setShowModal]    = useState(false);
    const [sinCupo,      setSinCupo]      = useState([]);
    const recordsPerPage = 6;

    useEffect(() => {
        cargarDatos();
    }, [location]);

    const cargarDatos = () => {
        paymentsService.checkAndExpireOverdue();

        // Clientes con cupo — aparecen en la lista principal
        setClientes(paymentsService.getClientesConCupo());

        // Clientes activos con ventas a crédito pendientes pero SIN cupo — para el modal
        const todosLosClientes = ClientsService.get().filter(c => c.estado === true);
        const pendientes       = paymentsService.getPending();

        const documentosConVentas = new Set(
            pendientes.map(v => String(v.numeroDocumento))
        );

        const clientesSinCupo = todosLosClientes.filter(c =>
            documentosConVentas.has(String(c.documento)) &&
            (!c.cupoCredito || c.cupoCredito <= 0)
        );

        setSinCupo(clientesSinCupo);
    };

    const handleAsignarCupo = (cliente, monto) => {
        const clienteActualizado = { ...cliente, cupoCredito: monto };
        ClientsService.update(clienteActualizado);
        setShowModal(false);
        cargarDatos(); // recargar lista
    };

    const filtered = clientes.filter(c => {
        const q = search.toLowerCase();
        return (
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) ||
            String(c.documento).includes(q) ||
            String(c.tipoDocumento || "").toLowerCase().includes(q)
        );
    });

    const totalPages     = Math.ceil(filtered.length / recordsPerPage);
    const currentRecords = filtered.slice(
        (presentPage - 1) * recordsPerPage,
        presentPage * recordsPerPage
    );

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                <p className="text-xl font-semibold">
                    Gestión de <span className="text-yellow-500">créditos y abonos</span>
                </p>

                {/* Buscador + botón asignar cupo + reporte */}
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <SearchBar
                            searchTerm={search}
                            onSearchChange={(e) => { setSearch(e.target.value); setPresentPage(1); }}
                            placeholder="Buscar cliente..."
                            showReportButton={true}
                            onReportClick={() => generarReporteGeneral(clientes)}
                        />
                    </div>

                    {/* ⚠️ TEMPORAL — eliminar cuando Clientes implemente cupoCredito */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-yellow-300 hover:bg-yellow-50 text-sm font-medium text-yellow-600 shadow-sm transition cursor-pointer shrink-0"
                    >
                        <CreditCard size={16} />
                        Asignar cupo
                        {sinCupo.length > 0 && (
                            <span className="bg-yellow-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {sinCupo.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Lista de clientes con cupo */}
                <div className="flex flex-col gap-3">
                    {currentRecords.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 text-center shadow-md">
                            <CreditCard size={32} className="text-gray-300" />
                            <p className="text-gray-500 text-sm font-medium">
                                {search
                                    ? "No se encontraron clientes con ese criterio."
                                    : "No hay clientes con cupo de crédito asignado."}
                            </p>
                            {!search && sinCupo.length > 0 && (
                                <p className="text-xs text-yellow-500">
                                    Hay {sinCupo.length} cliente{sinCupo.length !== 1 ? "s" : ""} con ventas a crédito sin cupo asignado.{" "}
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="underline font-semibold cursor-pointer"
                                    >
                                        Asignar ahora
                                    </button>
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
            </div>

            {/* Modal temporal asignar cupo */}
            {showModal && (
                <AsignarCupoModal
                    clientes={sinCupo}
                    onAsignar={handleAsignarCupo}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}