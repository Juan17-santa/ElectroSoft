import { useState, useEffect } from "react";
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { ChartNoAxesCombined, ShoppingCart, BadgeDollarSign, UsersRound, ShieldCheck, LogOut, ChevronDown, X } from 'lucide-react';
import { getAuthUser, logout } from "../../auth/services/authService";
import { usePermissions } from "../../../hooks/usePermissions";
import Alert from "./ui/alert";

export const Sidebar = ({ isOpen, setIsOpen }) => {
    const { hasAccessToScope } = usePermissions();
    const location = useLocation();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const handleLogout = () => {
        setIsOpen(false);
        setAlert({ type: "success", message: "Has cerrado sesión correctamente." });

        setTimeout(() => {
            logout();
            navigate("/");
        }, 2000);
    };

    const [userRole, setUserRole] = useState("Empleado");

    useEffect(() => {
        const authUser = getAuthUser();
        if (authUser) setUserRole(authUser.role || authUser.rol || "Empleado");

        const handler = () => {
            const auth = getAuthUser();
            if (auth) setUserRole(auth.role || auth.rol || "Empleado");
        };
        window.addEventListener("profile-updated", handler);
        return () => window.removeEventListener("profile-updated", handler);
    }, []);

    const hasCompras = hasAccessToScope("Categoria de productos") || hasAccessToScope("Productos") || hasAccessToScope("Proveedores") || hasAccessToScope("Compras");
    const hasVentas = hasAccessToScope("Clientes") || hasAccessToScope("Pedidos") || hasAccessToScope("Ventas") || hasAccessToScope("Pagos y abonos") || hasAccessToScope("Devoluciones");
    const hasAdmin = hasAccessToScope("Usuarios") || hasAccessToScope("Roles");

    // Submenu para compras
    const [openCompras, setOpenCompras] = useState(false);

    // Submenu para ventas
    const [openVentas, setOpenVentas] = useState(false);

    const isPathInCompras = (path) => ["/dashboard/productCategory", "/dashboard/products", "/dashboard/providers", "/dashboard/shopping"].some(p => path.toLowerCase().startsWith(p.toLowerCase()));
    const isPathInVentas = (path) => ["/dashboard/clients", "/dashboard/orders", "/dashboard/sales-management", "/dashboard/payments", "/dashboard/devolutions"].some(p => path.toLowerCase().startsWith(p.toLowerCase()));

    useEffect(() => {
        setOpenCompras(isPathInCompras(location.pathname));
        setOpenVentas(isPathInVentas(location.pathname));
    }, [location.pathname]);

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

    useEffect(() => {
        if (!isOpen) {
            setOpenCompras(false);
            setOpenVentas(false);
        }
    }, [isOpen]);

    const handleNavigate = () => {
        setIsOpen(false);
    };

    return (
        <>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <aside className={`fixed md:relative top-0 left-0 h-screen md:h-full flex flex-col z-50 bg-white w-64 border-r-2 border-yellow-300 shadow-[2px_0_6px_rgba(234,179,8,0.15)] transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0`}>

                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 md:hidden">
                    <span className="text-xl font-semibold">
                        Electro<span className="text-yellow-500">Soft</span>
                    </span>
                    <button
                        onClick={handleNavigate}
                        className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="flex flex-col h-full">

                    <div className="flex-1 overflow-y-auto">
                        {/* Parte superior */}
                        <div className='flex flex-col gap-4 py-6'>

                            <div className='flex flex-col gap-1 px-3'>

                                {/* DASHBOARD */}
                                <NavLink
                                    to="/dashboard"
                                    className={activeLink("/dashboard", true)}
                                    onClick={handleNavigate}
                                >
                                    <div className="flex items-center gap-3">
                                        <ChartNoAxesCombined size={18} />
                                        <span>Dashboard</span>
                                    </div>
                                </NavLink>

                                {/* COMPRAS */}
                                {hasCompras && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setOpenCompras(!openCompras);
                                                if (!openCompras) setOpenVentas(false);
                                            }}
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
                                            {hasAccessToScope("Categoria de productos") && (
                                                <NavLink
                                                    to="/dashboard/productCategory"
                                                    className={activeSubLink("/dashboard/productCategory")}
                                                    onClick={handleNavigate}
                                                >
                                                    Categoria de productos
                                                </NavLink>
                                            )}
                                            {hasAccessToScope("Productos") && (
                                                <NavLink
                                                    to="/dashboard/products"
                                                    className={activeSubLink("/dashboard/products")}
                                                    onClick={handleNavigate}
                                                >
                                                    Productos
                                                </NavLink>
                                            )}
                                            {hasAccessToScope("Proveedores") && (
                                                <NavLink
                                                    to="/dashboard/providers"
                                                    className={activeSubLink("/dashboard/providers")}
                                                    onClick={handleNavigate}
                                                >
                                                    Proveedores
                                                </NavLink>
                                            )}
                                            {hasAccessToScope("Compras") && (
                                                <NavLink
                                                    to="/dashboard/shopping"
                                                    className={activeSubLink("/dashboard/shopping")}
                                                    onClick={handleNavigate}
                                                >
                                                    Compras
                                                </NavLink>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* VENTAS */}
                                {hasVentas && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setOpenVentas(!openVentas);
                                                if (!openVentas) setOpenCompras(false);
                                            }}
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
                                            {hasAccessToScope("Clientes") && (
                                                <NavLink
                                                    to="/dashboard/clients"
                                                    className={activeSubLink("/dashboard/clients")}
                                                    onClick={handleNavigate}
                                                >
                                                    Clientes
                                                </NavLink>
                                            )}

                                            {hasAccessToScope("Pedidos") && (
                                                <NavLink
                                                    to="/dashboard/orders"
                                                    className={activeSubLink("/dashboard/orders")}
                                                    onClick={handleNavigate}
                                                >
                                                    Pedidos
                                                </NavLink>
                                            )}

                                            {hasAccessToScope("Ventas") && (
                                                <NavLink
                                                    to="/dashboard/sales-management"
                                                    className={activeSubLink("/dashboard/sales-management")}
                                                    onClick={handleNavigate}
                                                >
                                                    Ventas
                                                </NavLink>
                                            )}

                                            {hasAccessToScope("Pagos y abonos") && (
                                                <NavLink
                                                    to="/dashboard/payments"
                                                    className={activeSubLink("/dashboard/payments")}
                                                    onClick={handleNavigate}
                                                >
                                                    Pagos y abonos
                                                </NavLink>
                                            )}

                                            {hasAccessToScope("Devoluciones") && (
                                                <NavLink
                                                    to="/dashboard/devolutions"
                                                    className={activeSubLink("/dashboard/devolutions")}
                                                    onClick={handleNavigate}
                                                >
                                                    Devoluciones
                                                </NavLink>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="h-0.5 bg-yellow-400 mx-4"></div>

                            {/* ADMINISTRACION */}
                            {hasAdmin && (
                                <div className='flex flex-col gap-1 px-3'>
                                    {hasAccessToScope("Usuarios") && (
                                        <NavLink
                                            to="/dashboard/users"
                                            className={activeLink("/dashboard/users")}
                                            onClick={handleNavigate}
                                        >
                                            <div className="flex items-center gap-3">
                                                <UsersRound size={18} />
                                                <span>Usuarios</span>
                                            </div>
                                        </NavLink>
                                    )}

                                    {hasAccessToScope("Roles") && (
                                        <NavLink
                                            to="/dashboard/roles"
                                            className={activeLink("/dashboard/roles")}
                                            onClick={handleNavigate}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck size={18} />
                                                <span>Roles</span>
                                            </div>
                                        </NavLink>
                                    )}
                                </div>
                            )}

                            {hasAdmin && <div className="h-0.5 bg-yellow-400 mx-4"></div>}

                        </div>
                    </div>

                    {/* CERRAR SESION */}
                    <div className='p-4'>
                        <button
                            onClick={handleLogout}
                            className='w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-xl shadow'
                        >
                            <LogOut size={18} />
                            Cerrar sesión
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    )
}
