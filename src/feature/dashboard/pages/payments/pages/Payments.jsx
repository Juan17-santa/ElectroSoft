import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import paymentsService from "../services/PaymentsService";
import SearchBar from "../../../components/ui/Searchbar";
import Pagination from "../../../components/ui/Pagination";
import PaymentsTable from "../components/paymentsTable";
import Alert from "../../../components/ui/Alert";
import { useLocation } from "react-router-dom";

export default function Payments() {

    const location = useLocation();
    const navigate = useNavigate();

    const handleDetails = (payment) => {
        navigate(`/dashboard/payments/details/${payment.id}`, {
            state: { payment }
        });
    };

    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    useEffect(() => {
        getPayments();
    }, [location]);

    const getPayments = () => {
        try {
            const response = paymentsService.get();
            setPayments(response);
        } catch (error) {
            console.error(error);
        }
    };

    const filterPayments = payments.filter(payment => {
        const query = search.toLowerCase();

        return (
            String(payment.numeroVenta || "").toLowerCase().includes(query) ||
            String(payment.fecha || "").toLowerCase().includes(query) ||
            String(payment.fechaLimite || "").toLowerCase().includes(query) ||
            String(payment.cliente || "").toLowerCase().includes(query) ||
            String(payment.saldoPendiente || "").toLowerCase().includes(query) ||
            String(payment.estado ? "pendiente" : "finalizado").includes(query)
        );
    });

    const totalPages = Math.ceil(filterPayments.length / recordsPerPage);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = filterPayments.slice(firstIndex, lastIndex);


    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">

                <p className="text-xl font-semibold">Gestión de Pagos y Abonos</p>

                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar abonos ..."
                    onCreateClick={() => navigate("/dashboard/payments/create")}
                    createButtonText="Crear abono"
                />
                <PaymentsTable
                    data={currentRecords}
                    onDetails={handleDetails}
                />

                <div className="flex justify-end mt-auto pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

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