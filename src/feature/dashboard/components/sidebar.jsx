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
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
    const navigate = useNavigate();

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
                        <button 
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'
                            onClick={() => navigate("/dashboard")}
                        >
                            <div className="flex items-center gap-3">
                                <ChartNoAxesCombined size={18} />
                                <span>Dashboard</span>
                            </div>
                        </button>

                        {/* PRODUCTOS */}
                        <button
                            onClick={() => setOpenProductos(!openProductos)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'
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
                        <div className={`flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                        overflow-hidden transition-all duration-300
                        ${openProductos ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                            <button
                                className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left"
                                onClick={() => navigate("/dashboard/product-category")}
                            >
                                Categoria de productos
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Gestion de productos
                            </button>
                        </div>


                        {/* COMPRAS */}
                        <button
                            onClick={() => setOpenCompras(!openCompras)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'
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
                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Gestion de compras
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Proveedores
                            </button>
                        </div>

                        {/* VENTAS */}
                        <button
                            onClick={() => setOpenVentas(!openVentas)}
                            className='flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'
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
                            ${openVentas ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left"
                             onClick={() => navigate('/dashboard/clients')}>
                                Clientes
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Pedidos
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left"
                             onClick={() => navigate('/dashboard/salesmanagement')}>
                                Gestion de ventas
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Pagos y abonos
                            </button>

                            <button className="w-full px-4 py-2 rounded-lg hover:bg-gray-200 text-sm transition cursor-pointer text-left">
                                Devoluciones
                            </button>
                        </div>
                    </div>

                    <div className="h-0.5 bg-yellow-400 mx-4"></div>

                    {/* ADMINISTRACION */}
                    <div className='flex flex-col gap-1 px-3'>
                        <button className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'>
                            <UsersRound size={18} />
                            <span>Usuarios</span>
                        </button>

                        <button className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 cursor-pointer'>
                            <ShieldCheck size={18} />
                            <span>Roles</span>
                        </button>
                    </div>

                    <div className="h-0.5 bg-yellow-400 mx-4"></div>

                </div>

                {/* CERRAR SESION */}
                <div className='p-4'>
                    <button className='w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-xl shadow cursor-pointer'>
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>

            </nav>

        </aside>
    )
}
