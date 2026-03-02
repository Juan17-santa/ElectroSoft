import { useState, } from "react";
import { useLocation, NavLink } from 'react-router-dom';
import { ChartNoAxesCombined, ShoppingCart, BadgeDollarSign, UsersRound, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';

export const Sidebar = () => {
    const location = useLocation();

    // Submenu para compras
    const [openCompras, setOpenCompras] = useState(false);

    // Submenu para ventas
    const [openVentas, setOpenVentas] = useState(false);

    // Función para determinar si una ruta está activa
    const activeLink = (path, exact = false) => {
        const baseStyle =
            "flex items-center justify-between w-full px-3 py-2 rounded-lg transition";

        const activeStyle = "bg-yellow-400 font-semibold text-black";
        const normalStyle = "hover:bg-gray-200";

        const isActive = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

        return `${baseStyle} ${isActive ? activeStyle : normalStyle}`;
    };

    // Función para determinar si una ruta está activa (para botones del submenu)
    const activeSubLink = (path) => {
        const baseStyle =
            "w-full px-4 py-2 rounded-lg text-sm transition text-left block";

        const activeStyle = "bg-yellow-400 font-semibold";
        const normalStyle = "hover:bg-gray-200";

        return `${baseStyle} ${location.pathname.startsWith(path)
            ? activeStyle
            : normalStyle
            }`;
    };

    return (
        <aside className='w-64 border-r-2 border-yellow-300 shadow-[2px_0_6px_rgba(234,179,8,0.15)] flex flex-col'>

            <nav className="flex flex-col justify-between h-full">

                {/* Parte superior */}
                <div className='flex flex-col gap-4 py-6'>

                    <div className='flex flex-col gap-1 px-3'>

                        {/* DASHBOARD */}
                        <NavLink
                            to="/dashboard"
                            className={activeLink("/dashboard", true)}
                        >
                            <div className="flex items-center gap-3">
                                <ChartNoAxesCombined size={18} />
                                <span>Dashboard</span>
                            </div>
                        </NavLink>

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
                                className={`transition-transform ${openCompras ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* SUBMENU DE COMPRAS */}
                        <div className={`
                            flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                            overflow-hidden transition-all duration-300
                            ${openCompras ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <NavLink
                                to="/dashboard/productCategory"
                                className={activeSubLink("/dashboard/productCategory")}
                            >
                                Categoria de productos
                            </NavLink>
                            <NavLink
                                to="/dashboard/products"
                                className={activeSubLink("/dashboard/products")}
                            >
                                Productos
                            </NavLink>
                            <NavLink
                                to="/dashboard/providers"
                                className={activeSubLink("/dashboard/providers")}
                            >
                                Proveedores
                            </NavLink>
                            <NavLink
                                to="/dashboard/shopping"
                                className={activeSubLink("/dashboard/shopping")}
                            >
                                Compras
                            </NavLink>
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
                                className={`transition-transform ${openVentas ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* SUBMENU DE VENTAS */}
                        <div className={`
                            flex flex-col gap-1 ml-6 pl-4 border-l-2 border-yellow-300
                            overflow-hidden transition-all duration-300
                            ${openVentas ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
                        `}>
                            <NavLink
                                to="/dashboard/clients"
                                className={activeSubLink("/dashboard/clients")}
                            >
                                Clientes
                            </NavLink>

                            <NavLink
                                to="/dashboard/orders"
                                className={activeSubLink("/dashboard/orders")}
                            >
                                Pedidos
                            </NavLink>

                            <NavLink
                                to="/dashboard/sales-management"
                                className={activeSubLink("/dashboard/sales-management")}
                            >
                                Ventas
                            </NavLink>

                            <NavLink
                                to="/dashboard/payments"
                                className={activeSubLink("/dashboard/payments")}
                            >
                                Pagos y abonos
                            </NavLink>

                            <NavLink
                                to="/dashboard/returns"
                                className={activeSubLink("/dashboard/returns")}
                            >
                                Devoluciones
                            </NavLink>
                        </div>
                    </div>

                    <div className="h-0.5 bg-yellow-400 mx-4"></div>

                    {/* ADMINISTRACION */}
                    <div className='flex flex-col gap-1 px-3'>
                        <NavLink
                            to="/dashboard/users"
                            className={activeLink("/dashboard/users")}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={18} />
                                <span>Usuarios</span>
                            </div>
                        </NavLink>

                        <NavLink
                            to="/dashboard/roles"
                            className={activeLink("/dashboard/roles")}
                        >
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={18} />
                                <span>Roles</span>
                            </div>
                        </NavLink>
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
