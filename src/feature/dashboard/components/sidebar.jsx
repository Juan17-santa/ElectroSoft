import { useState } from "react";
import {
    ChartNoAxesCombined,
    Box,
    ShoppingCart,
    BadgeDollarSign,
    UsersRound,
    ShieldCheck,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
    // Submenu para productos
    const [openProductos, setOpenProductos] = useState(false);

    // Submenu para compras
    const [openCompras, setOpenCompras] = useState(false);

    // Submenu para ventas
    const [openVentas, setOpenVentas] = useState(false);

    return (
        <aside className='w-64 border-r-2 border-yellow-300 shadow-[2px_0_6px_rgba(234,179,8,0.15)] flex flex-col'>

            <nav className="flex flex-col justify-between h-full">

                {/* Parte superior */}
                <div className='flex flex-col gap-4 py-6'>

                    <div className='flex flex-col gap-1 px-3'>

                        {/* DASHBOARD */}
                        <Link className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200'>
                            <div className="flex items-center gap-3">
                                <ChartNoAxesCombined size={18} />
                                <span>Dashboard</span>
                            </div>
                        </Link>

                        {/* PRODUCTOS */}
                        <button
                            onClick={() => setOpenProductos(!openProductos)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200'
                        >
                            <div className="flex items-center gap-3">
                                <Box size={18} />
                                <span>Productos</span>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`transition-transform ${openProductos ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* SUBMENU DE PRODUCTOS */}
                        <div className={`
                            flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                            overflow-hidden transition-all duration-300
                            ${openProductos ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <Link className="px-4 py-2 rounded-xl hover:bg-gray-200 hover:shadow text-sm transition">
                                Categoria de productos
                            </Link>

                            <Link className="px-4 py-2 rounded-xl hover:bg-gray-200 hover:shadow text-sm transition">
                                Gestion de productos
                            </Link>
                        </div>

                        {/* COMPRAS */}
                        <button
                            onClick={() => setOpenCompras(!openCompras)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200'
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={18} />
                                <span>Compras</span>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`transition-transform ${openProductos ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* SUBMENU DE COMPRAS */}
                        <div className={`
                            flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                            overflow-hidden transition-all duration-300
                            ${openCompras ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Gestion de compras
                            </Link>

                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Proveedores
                            </Link>
                        </div>

                        {/* VENTAS */}
                        <button
                            onClick={() => setOpenVentas(!openVentas)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200'
                        >
                            <div className="flex items-center gap-3">
                                <BadgeDollarSign size={18} />
                                <span>Ventas</span>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`transition-transform ${openProductos ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* SUBMENU DE VENTAS */}
                        <div className={`
                            flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                            overflow-hidden transition-all duration-300
                            ${openVentas ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Clientes
                            </Link>

                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Pedidos
                            </Link>

                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Gestion de ventas
                            </Link>

                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Pagos y abonos
                            </Link>

                            <Link className="px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                                Devoluciones
                            </Link>
                        </div>
                    </div>

                    <div className="h-0.5 bg-yellow-400 mx-4"></div>

                    {/* ADMINISTRACION */}
                    <div className='flex flex-col gap-1 px-3'>
                        <Link className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200'>
                            <UsersRound size={18} />
                            <span>Usuarios</span>
                        </Link>

                        <Link className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200'>
                            <ShieldCheck size={18} />
                            <span>Roles</span>
                        </Link>
                    </div>

                    <div className="h-0.5 bg-yellow-400 mx-4"></div>

                </div>

                {/* Logout */}
                <div className='p-4'>
                    <button className='w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-xl shadow'>
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>

            </nav>

        </aside>
    )
}
