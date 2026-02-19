/**
 * Clients.jsx
 * 
 * Página principal de gestión de clientes.
 * Muestra una tabla con todos los clientes, permite buscar, paginar y ejecutar acciones:
 * - Ver detalles (ojo) → navega a ClientDetailsPage
 * - Editar (lápiz) → navega a UpdateClients
 * - Duplicar (copiar) → crea una copia del cliente
 * - Eliminar (basura) → elimina el cliente
 */
import { Eye, Pencil, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsService } from "./services/ClientsService";

export default function Clients() {
    // ESTADO PARA NAVEGAR
    const navigate = useNavigate();

    // OBTENER LOS CLIENTES
    const [clients, setClients] = useState([]);

    // ESTADO PARA EL BUSCADOR
    const [search, setSearch] = useState("");

    // FILTRAR LOS CLIENTES POR NOMBRE O DOCUMENTO
    const filteredClients = clients.filter(client =>
        `${client.nombres} ${client.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
        client.documento.toLowerCase().includes(search.toLowerCase())
    );

    // FUNCION PAGINADOR, PAGINA ACTUAL DEL PAGINADOR
    const [presentPage, setPresentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = presentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const PresentRecords = filteredClients.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredClients.length / recordsPerPage);

    const nextPage = () => {
        if (presentPage < totalPages) setPresentPage(presentPage + 1);
    };

    const prevPage = () => {
        if (presentPage > 1) setPresentPage(presentPage - 1);
    };


    useEffect(() => {
        getClients();
    }, [])

    const getClients = async () => {
        try {
            const response = ClientsService.get();
            setClients(response)
        } catch (error) {
            console.error(error)
        }
    }

    /** Elimina un cliente (con confirmación) */
    const handleDelete = (id) => {
        const confirmDelete = window.confirm("¿Esta seguro de eliminar cliente?");
        if (!confirmDelete) return;

        const newData = ClientsService.delete(id);
        setClients(newData);
        alert("Cliente eliminado correctamente");
    };

    /** Navega a la vista de edición del cliente */
    const handleEditNavigation = (client) => {
        localStorage.setItem("clientToEdit", JSON.stringify(client));
        navigate("/dashboard/clients/update");
    };

    /**
     * Navega a la vista de detalles del cliente.
     * Guarda el cliente en localStorage con clave "clientToView".
     */
    const handleViewDetails = (client) => {
        localStorage.setItem("clientToView", JSON.stringify(client));
        navigate("/dashboard/clients/details");
    };

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full min-h-142 shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Gestión de clientes</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-4/5">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar clientes.."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none text-md placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md hover:bg-linear-to-r hover:shadow-lg transition">
                        <Plus />
                        <button
                            type="button"
                            className="cursor-pointer"
                            onClick={() => navigate("/dashboard/clients/create")}
                        >
                            Crear cliente
                        </button>
                    </div>
                </div>

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
                                    <th className="px-3 py-2 font-semibold w-24">Total Compras</th>
                                    <th className="px-3 py-2 font-semibold text-center w-24">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700 text-sm">
                                {PresentRecords.map((client, index) => (
                                    <tr key={client.id} className="border-b border-gray-300">
                                        <td className="px-3 py-2 w-8">{firstIndex + index + 1}</td>
                                        <td className="px-3 py-2 w-16">{client.tipoDocumento}</td>
                                        <td className="px-3 py-2 w-24">{client.documento}</td>
                                        <td className="px-3 py-2 w-32 truncate">{client.nombres} {client.apellidos}</td>
                                        <td className="px-3 py-2 w-32 truncate">{client.email}</td>
                                        <td className="px-3 py-2 w-20">{client.telefono}</td>
                                        <td className="px-3 py-2 w-24">${client.totalCompras.toLocaleString('es-CO')}</td>
                                        <td className="px-3 py-2 w-24">
                                            <div className="flex justify-center gap-1.5">

                                                {/* VER DETALLES */}
                                                <button
                                                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 cursor-pointer"
                                                    onClick={() => handleViewDetails(client)}
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>

                                                {/* EDITAR */}
                                                <button
                                                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer"
                                                    onClick={() => handleEditNavigation(client)}
                                                    title="Editar cliente"
                                                >
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>

                                                {/* ELIMINAR */}
                                                <button
                                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer"
                                                    onClick={() => handleDelete(client.id)}
                                                    title="Eliminar cliente"
                                                >
                                                    <Trash size={18} className="text-red-600" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINADOR */}
                <div className="flex justify-end mt-4">
                    <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-2xl w-fit shadow-xl">
                        {/* Flecha izquierda */}
                        <button onClick={prevPage} className="p-2 rounded-lg hover:bg-gray-300 transition">←</button>

                        {/* Números de página */}
                        {(() => {
                            const pages = [];
                            if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                if (presentPage > 3) pages.push("...");
                                for (let i = Math.max(2, presentPage - 1); i <= Math.min(totalPages - 1, presentPage + 1); i++) {
                                    pages.push(i);
                                }
                                if (presentPage < totalPages - 2) pages.push("...");
                                pages.push(totalPages);
                            }
                            return pages.map((page, index) => (
                                page === "..." ? (
                                    <span key={`e-${index}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setPresentPage(page)}
                                        className={`px-3 py-1 rounded-md transition ${presentPage === page ? "bg-yellow-400 text-black font-medium shadow-sm" : "bg-gray-300"}`}
                                    >
                                        {page}
                                    </button>
                                )
                            ));
                        })()}

                        {/* Flecha derecha */}
                        <button onClick={nextPage} className="p-2 rounded-lg hover:bg-gray-300 transition">→</button>
                    </div>
                </div>
            </div>
        </>
    )
}