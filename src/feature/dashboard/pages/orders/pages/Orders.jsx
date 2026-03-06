import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useOrdersTable } from "../hooks/UseOrdersTable";
import SearchBar from "../../../components/ui/Searchbar";
import OrdersTable from "../components/OrdersTable";
import Pagination from "../../../components/ui/Pagination"

export default function Orders() {

    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // ESTADO DEL BUSCADOR
    const [search, setSearch] = useState("");

    // FUNCION PAGINADOR, PAGINA ACTUAL DEL PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;

    // FUNCION PARA PREPARAR LA VISTA DE DETALLES
    const handleDetailsNavigation = (order) => {
        navigate("/dashboard/orders/detail", {
            state: { order },
        })
    };

    const { data, totalPages } = useOrdersTable(search, presentPage, recordsPerPage);

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de pedidos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <SearchBar
                    searchTerm={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar pedidos..."

                    showReportButton={true}   // 👈 ACTIVAR BOTÓN
                    onReportClick={() => {
                        console.log("Generar reporte");
                        // aquí luego puedes exportar PDF o Excel
                    }}

                    onCreateClick={() => navigate("/dashboard/orders/create")}
                    createButtonText="Crear pedido"
                />

                {/* TABLA */}
                <OrdersTable
                    data={data}
                    onDetails={handleDetailsNavigation}
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
        </>
    )
}