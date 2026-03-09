import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import paymentsService from "../services/PaymentsService";
import SearchBar from "../../../components/ui/Searchbar";
import PaymentsTable from "../components/PaymentsTable";
import Pagination from "../../../components/ui/Pagination";

export default function Payments() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();
    const location = useLocation();

    // ESTADO DEL BUSCADOR
    const [search, setSearch] = useState("");

    // PAGINACIÓN
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // DATOS
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        loadPayments();
    }, [location]);

    const loadPayments = () => {
        try {
            const pending = paymentsService.getPending();
            setPayments(pending);
        } catch (error) {
            console.error("Error cargando pagos:", error);
        }
    };

    // FUNCIÓN PARA VER DETALLE
    const handleDetailsNavigation = (payment) => {
        navigate(`/dashboard/payments/details/${payment.id}`, {
            state: { payment },
        });
    };

    // FILTRADO
    const filtered = payments.filter((payment) => {
        const query = search.toLowerCase();
        const abonos = payment.abonos || [];
        const ultimoAbono = abonos.length > 0 ? abonos[abonos.length - 1] : null;
        return (
            String(payment.numeroVenta || "").toLowerCase().includes(query) ||
            String(payment.cliente || "").toLowerCase().includes(query) ||
            String(payment.documentoCliente || "").toLowerCase().includes(query) ||
            String(payment.fecha || "").toLowerCase().includes(query) ||
            String(payment.fechaLimite || "").toLowerCase().includes(query) ||
            String(payment.saldoPendiente || "").toLowerCase().includes(query) ||
            String(ultimoAbono?.paymentMethod || "").toLowerCase().includes(query) ||
            (payment.estado ? "pendiente" : "finalizado").includes(query)
        );
    });

    // PAGINACIÓN
    const totalPages = Math.ceil(filtered.length / recordsPerPage);
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filtered.slice(firstIndex, lastIndex);

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                {/* TITULO */}
                <p className="text-xl font-semibold">
                    Listado de <span className="text-yellow-500">pagos y abonos</span>
                </p>

                {/* BUSCADOR Y BOTÓN CREAR */}
                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        setPresentPage(1);
                    }}
                    placeholder="Buscar abono..."
                    onCreateClick={() => navigate("/dashboard/payments/create")}
                    createButtonText="Nuevo"
                    showReportButton={true}
                    onReportClick={() => console.log("Generar reporte")}
                />

                {/* TABLA */}
                <PaymentsTable
                    data={currentRecords}
                    onDetails={handleDetailsNavigation}
                />

                {/* PAGINACIÓN */}
                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={presentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setPresentPage(page)}
                    />
                </div>

            </div>
        </>
    );
}