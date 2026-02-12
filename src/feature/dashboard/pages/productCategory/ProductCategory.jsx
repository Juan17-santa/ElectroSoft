import { Trash, Pencil, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductCategory() {
    const navigate = useNavigate();

    // ARRAY DE OBJETOS PARA SIMULAR EL BACKEND
    const categorias = [
        {
            id: 1,
            nombre: "Cables",
            descripcion: "Incluye todo tipo de cables electricos, alambres, extensiones y conductores de energia.",
            estado: "Activo"
        },
        {
            id: 2,
            nombre: "Luces y luminarias",
            descripcion: "Lamparas, reflectores, plafones, faroles y sistema de iluminacion decorativa.",
            estado: "Activo"
        },
        {
            id: 3,
            nombre: "Conectores",
            descripcion: "Enchufes, adaptadores, conectores industriales, regletas, interruptores y accesorios de conexcion electrica.",
            estado: "Inactivo"
        },
        {
            id: 4,
            nombre: "Conectores",
            descripcion: "Enchufes, adaptadores, conectores industriales, regletas, interruptores y accesorios de conexcion electrica.",
            estado: "Inactivo"
        },
        {
            id: 5,
            nombre: "Conectores",
            descripcion: "Enchufes, adaptadores, conectores industriales, regletas, interruptores y accesorios de conexcion electrica.",
            estado: "Inactivo"
        }
    ]

    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
                {/* TITULO */}
                <p className="text-xl font-semibold">Control de categorias de productos</p>

                {/* BUSCADOR Y BOTON CREAR */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-4/5">
                        <Search size={20} className="text-gray-400" />
                        <input type="text" placeholder="Buscar categorias de productos.." className="w-full outline-none text-md placeholder-gray-400" />
                    </div>
                    <div className="flex items-center bg-linear-to-r from-white to-yellow-300 px-4 py-2 rounded-lg font-medium cursor-pointer gap-2 shadow-md transition">
                        <Plus />
                        <button
                            type="button"
                            className="cursor-pointer"
                            onClick={() => navigate("/dashboard/product-category/create")}
                        >
                            Crear categoria
                        </button>
                    </div>
                </div>

                {/* TABLA */}
                <div className="p-0.5 rounded-2xl bg-linear-to-r from-yellow-400 to-white">
                    <div className="bg-gray-100 rounded-2xl border-none overflow-hidden">

                        <table className="w-full text-sm">

                            <thead className="bg-gray-200">
                                <tr className="text-left border-b border-gray-300">
                                    <th className="px-4 py-2 font-semibold">ID</th>
                                    <th className="px-4 py-2 font-semibold">Nombre</th>
                                    <th className="px-4 py-2 font-semibold">Descripción</th>
                                    <th className="px-4 py-2 font-semibold">Estado</th>
                                    <th className="px-4 py-2 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white text-gray-700">
                                {categorias.map((categoria, index) => (
                                    <tr key={categoria.id}>
                                        <td className="px-4 py-1 border-b border-gray-300">{index + 1}</td>
                                        <td className="px-4 py-1 border-b border-gray-300">{categoria.nombre}</td>
                                        <td className="px-4 py-1 border-b border-gray-300 max-w-md">{categoria.descripcion}</td>
                                        <td className="px-4 py-1 border-b border-gray-300">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full 
                                                    ${categoria.estado === "Activo" ? "bg-green-500" : "bg-red-500"}`}
                                                ></span>
                                                <span>{categoria.estado}</span>
                                            </div>

                                        </td>
                                        <td className="px-4 py-1 border-b border-gray-300">
                                            <div className="flex justify-center gap-4">

                                                {/* BOTON EDITAR */}
                                                <button className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition cursor-pointer">
                                                    <Pencil size={18} className="text-yellow-600" />
                                                </button>

                                                {/* VOTON ELIMINAR */}
                                                <button className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition cursor-pointer">
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
                        <button className="p-2 rounded-lg hover:bg-gray-300 transition">
                            ←
                        </button>

                        {/* Página activa */}
                        <button className="px-3 py-1 rounded-md bg-yellow-400 text-black font-medium shadow-sm">
                            1
                        </button>

                        {/* Otras páginas */}
                        <button className="px-3 py-1 rounded-md hover:bg-gray-300 transition">
                            2
                        </button>

                        <button className="px-3 py-1 rounded-md hover:bg-gray-300 transition">
                            3
                        </button>

                        {/* Flecha derecha */}
                        <button className="p-2 rounded-lg hover:bg-gray-300 transition">
                            →
                        </button>

                    </div>
                </div>

            </div>
        </>
    )
}