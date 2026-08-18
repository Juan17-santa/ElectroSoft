import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import {
    ChartNoAxesCombined, ShoppingCart, BadgeDollarSign, UsersRound, ShieldCheck,
    LogOut, ChevronDown, ChevronUp, X, Lightbulb,
    Layers, Package, Truck, ShoppingBag, UserRound, ClipboardList, Receipt, Wallet, Undo2
} from 'lucide-react';
import { getAuthUser, logout } from "../../auth/services/authService";
import { usePermissions } from "../../../hooks/usePermissions";
import { useToast } from "../../../context/ToastContext";
import ConfirmModal from "./ui/ConfirmModal";

// Submódulos de Compras
const comprasItems = [
    { key: "Categoria de productos", path: "/dashboard/productCategory", label: "Categoría de productos", icon: Layers },
    { key: "Productos", path: "/dashboard/products", label: "Productos", icon: Package },
    { key: "Proveedores", path: "/dashboard/providers", label: "Proveedores", icon: Truck },
    { key: "Compras", path: "/dashboard/shopping", label: "Compras", icon: ShoppingBag },
];

// Submódulos de Ventas
const ventasItems = [
    { key: "Clientes", path: "/dashboard/clients", label: "Clientes", icon: UserRound },
    { key: "Pedidos", path: "/dashboard/orders", label: "Pedidos", icon: ClipboardList },
    { key: "Ventas", path: "/dashboard/sales-management", label: "Ventas", icon: Receipt },
    { key: "Pagos y abonos", path: "/dashboard/payments", label: "Pagos y abonos", icon: Wallet },
    { key: "Devoluciones", path: "/dashboard/devolutions", label: "Devoluciones", icon: Undo2 },
];

export const Sidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
    const { hasAccessToScope } = usePermissions();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Pista de scroll integrada (solo desktop)
    const scrollRef = useRef(null);
    const trackRef = useRef(null);
    const scrollTimer = useRef(null);
    const [scrollMetrics, setScrollMetrics] = useState({ scrollTop: 0, scrollHeight: 1, clientHeight: 1, trackTop: 0, trackHeight: 1 });
    const [isHovering, setIsHovering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        setIsOpen(false);

        showToast("success", "Has cerrado sesión correctamente.");

        setTimeout(() => {
            logout();
            navigate("/");
        }, 1500);
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

    const comprasVisible = comprasItems.filter(item => hasAccessToScope(item.key));
    const ventasVisible = ventasItems.filter(item => hasAccessToScope(item.key));
    const hasCompras = comprasVisible.length > 0;
    const hasVentas = ventasVisible.length > 0;
    const hasAdmin = hasAccessToScope("Usuarios") || hasAccessToScope("Roles");

    // Submenu para compras
    const [openCompras, setOpenCompras] = useState(false);

    // Submenu para ventas
    const [openVentas, setOpenVentas] = useState(false);

    const isPathInCompras = (path) => comprasItems.some(item => path.toLowerCase().startsWith(item.path.toLowerCase()));
    const isPathInVentas = (path) => ventasItems.some(item => path.toLowerCase().startsWith(item.path.toLowerCase()));

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
            "flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition text-left";

        const activeStyle = "bg-yellow-400 font-semibold";
        const normalStyle = "hover:bg-gray-200";

        return `${baseStyle} ${location.pathname.startsWith(path)
            ? activeStyle
            : normalStyle
            }`;
    };

    // Estilo para íconos en modo colapsado
    const activeCollapsedIcon = (path, exact = false) => {
        const baseStyle = "flex items-center justify-center w-11 h-11 rounded-lg transition";
        const activeStyle = "bg-yellow-400 text-black";
        const normalStyle = "hover:bg-gray-200 text-gray-700";

        const isActive = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

        return `${baseStyle} ${isActive ? activeStyle : normalStyle}`;
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

    // Sincroniza el deslizador con el scroll nativo del contenedor (única fuente de scroll)
    const updateScrollMetrics = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        let trackTop = 0;
        let trackHeight = el.clientHeight;
        if (trackRef.current) {
            const trackRect = trackRef.current.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            trackTop = elRect.top - trackRect.top;
            trackHeight = el.clientHeight;
        }
        setScrollMetrics({
            scrollTop: el.scrollTop,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            trackTop,
            trackHeight,
        });
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            updateScrollMetrics();
            setIsScrolling(true);
            if (scrollTimer.current) clearTimeout(scrollTimer.current);
            scrollTimer.current = setTimeout(() => setIsScrolling(false), 400);
        };

        el.addEventListener('scroll', onScroll);
        window.addEventListener('resize', updateScrollMetrics);

        const observer = new ResizeObserver(() => updateScrollMetrics());
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);

        updateScrollMetrics();

        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateScrollMetrics);
            observer.disconnect();
            if (scrollTimer.current) clearTimeout(scrollTimer.current);
        };
    }, [updateScrollMetrics]);

    // Arrastre del deslizador -> scrollTop nativo
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e) => {
            const el = scrollRef.current;
            const track = trackRef.current;
            if (!el || !track) return;
            const { trackTop, trackHeight, clientHeight, scrollHeight } = scrollMetrics;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 24);
            const usable = trackHeight - thumbHeight;
            if (usable <= 0) return;
            const trackRect = track.getBoundingClientRect();
            const ratio = Math.min(Math.max((e.clientY - trackRect.top - trackTop) / usable, 0), 1);
            el.scrollTop = ratio * (scrollHeight - clientHeight);
        };

        const handleUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDragging, scrollMetrics]);

    const handleThumbMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const scrollByDirection = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ top: direction * el.clientHeight * 0.8, behavior: 'smooth' });
    };

    const { scrollTop, scrollHeight, clientHeight, trackTop, trackHeight } = scrollMetrics;
    const maxScroll = scrollHeight - clientHeight;
    const thumbHeight = Math.max(maxScroll > 0 ? (clientHeight / scrollHeight) * trackHeight : 0, 24);
    const thumbTop = maxScroll > 0 ? trackTop + (scrollTop / maxScroll) * (trackHeight - thumbHeight) : trackTop;
    const thumbActive = isHovering || isDragging || isScrolling;

    // Ícono + tooltip para modo colapsado (con portal para evitar el clipping del overflow)
    const CollapsedIcon = ({ path, label, Icon, exact = false }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [coords, setCoords] = useState({ top: 0, left: 0 });
        const linkRef = useRef(null);

        const handleMouseEnter = () => {
            if (linkRef.current) {
                const rect = linkRef.current.getBoundingClientRect();
                setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 });
            }
            setShowTooltip(true);
        };

        return (
            <div className="flex justify-center">
                <NavLink
                    ref={linkRef}
                    to={path}
                    className={activeCollapsedIcon(path, exact)}
                    onClick={handleNavigate}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Icon size={18} />
                </NavLink>

                {showTooltip && createPortal(
                    <span
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                            transform: "translateY(-50%)",
                        }}
                        className="whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 z-9999 shadow-lg pointer-events-none"
                    >
                        {label}
                    </span>,
                    document.body
                )}
            </div>
        );
    };

    // Botón de cerrar sesión colapsado (mismo patrón de portal)
    const CollapsedLogout = ({ onClick }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [coords, setCoords] = useState({ top: 0, left: 0 });
        const btnRef = useRef(null);

        const handleMouseEnter = () => {
            if (btnRef.current) {
                const rect = btnRef.current.getBoundingClientRect();
                setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 });
            }
            setShowTooltip(true);
        };

        return (
            <div className="flex justify-center">
                <button
                    ref={btnRef}
                    onClick={onClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setShowTooltip(false)}
                    className='flex items-center justify-center w-11 h-11 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl shadow'
                >
                    <LogOut size={18} />
                </button>

                {showTooltip && createPortal(
                    <span
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                            transform: "translateY(-50%)",
                        }}
                        className="whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 z-9999 shadow-lg pointer-events-none"
                    >
                        Cerrar sesión
                    </span>,
                    document.body
                )}
            </div>
        );
    };

    return (
        <>
            {showLogoutModal && (
                <ConfirmModal
                    type="warning"
                    title="Cerrar sesión"
                    message="¿Estás seguro de que deseas cerrar sesión?"
                    labelConfirmar="Cerrar sesión"
                    labelCancelar="Cancelar"
                    onConfirm={confirmLogout}
                    onCancel={() => setShowLogoutModal(false)}
                />
            )}

            <aside className={`fixed md:relative top-0 left-0 h-screen md:h-full flex flex-col z-40 overflow-hidden bg-white border-r-2 border-yellow-300 shadow-[2px_0_6px_rgba(234,179,8,0.15)] transform transition-[width,transform] duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            w-64 ${isCollapsed ? "md:w-20" : "md:w-64"}`}>

                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 md:hidden">
                    <div className="flex gap-1">
                        <Lightbulb size={25} className="text-yellow-400" />
                        <span className="text-xl font-semibold">
                            Electro<span className="text-yellow-500">Soft</span>
                        </span>
                    </div>
                    <button
                        onClick={handleNavigate}
                        className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="flex flex-col h-full">

                    <div ref={scrollRef} className="flex-1 overflow-y-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">

                        {isCollapsed ? (
                            /* ---------- MODO COLAPSADO: solo íconos + tooltip ---------- */
                            <div className="flex flex-col items-center gap-2 py-6 px-3">

                                {hasAccessToScope("Dashboard") && (
                                    <CollapsedIcon path="/dashboard" label="Dashboard" Icon={ChartNoAxesCombined} exact />
                                )}

                                {hasCompras && (hasVentas || hasAdmin) && hasAccessToScope("Dashboard") && (
                                    <div className="w-8 h-0.5 bg-yellow-400 my-1"></div>
                                )}

                                {comprasVisible.map(item => (
                                    <CollapsedIcon key={item.key} path={item.path} label={item.label} Icon={item.icon} />
                                ))}

                                {hasCompras && hasVentas && (
                                    <div className="w-8 h-0.5 bg-yellow-400 my-1"></div>
                                )}

                                {ventasVisible.map(item => (
                                    <CollapsedIcon key={item.key} path={item.path} label={item.label} Icon={item.icon} />
                                ))}

                                {(hasCompras || hasVentas) && hasAdmin && (
                                    <div className="w-8 h-0.5 bg-yellow-400 my-1"></div>
                                )}

                                {hasAccessToScope("Usuarios") && (
                                    <CollapsedIcon path="/dashboard/users" label="Usuarios" Icon={UsersRound} />
                                )}

                                {hasAccessToScope("Roles") && (
                                    <CollapsedIcon path="/dashboard/roles" label="Roles" Icon={ShieldCheck} />
                                )}
                            </div>
                        ) : (
                            /* ---------- MODO EXPANDIDO ---------- */
                            <div className='flex flex-col gap-4 py-6'>

                                <div className='flex flex-col gap-1 px-3'>

                                    {/* DASHBOARD */}
                                    {hasAccessToScope("Dashboard") && (
                                        <NavLink to="/dashboard" className={activeLink("/dashboard", true)} onClick={handleNavigate}>
                                            <div className="flex items-center gap-3">
                                                <ChartNoAxesCombined size={18} />
                                                <span>Dashboard</span>
                                            </div>
                                        </NavLink>
                                    )}

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
                                                {comprasVisible.map(item => (
                                                    <NavLink
                                                        key={item.key}
                                                        to={item.path}
                                                        className={activeSubLink(item.path)}
                                                        onClick={handleNavigate}
                                                    >
                                                        <item.icon
                                                            size={item.key === "Categoria de productos" ? 19 : 16}
                                                        />
                                                        <span>{item.label}</span>
                                                    </NavLink>
                                                ))}
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
                                                {ventasVisible.map(item => (
                                                    <NavLink
                                                        key={item.key}
                                                        to={item.path}
                                                        className={activeSubLink(item.path)}
                                                        onClick={handleNavigate}
                                                    >
                                                        <item.icon size={16} />
                                                        <span>{item.label}</span>
                                                    </NavLink>
                                                ))}
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
                        )}
                    </div>

                    {/* CERRAR SESION */}
                    <div className='p-4'>
                        {isCollapsed ? (
                            <CollapsedLogout onClick={handleLogout} />
                        ) : (
                            <button
                                onClick={handleLogout}
                                className='w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-xl shadow'
                            >
                                <LogOut size={18} />
                                Cerrar sesión
                            </button>
                        )}
                    </div>
                </nav>

{/* Pista de scroll integrada (solo desktop): el borde del Sidebar es la pista */}
                <div
                    ref={trackRef}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="hidden md:block absolute right-0 top-0 bottom-0 w-2.5 bg-transparent select-none"
                >
                    {scrollTop > 0 && (
                        <button
                            onClick={() => scrollByDirection(-1)}
                            title="Desplazar hacia arriba"
                            style={{ top: trackTop + 2 }}
                            className={`absolute right-0 w-6 h-6 flex items-center justify-center text-gray-700 cursor-pointer transition-opacity duration-300 ${thumbActive ? "opacity-100" : "opacity-90"}`}
                        >
                            <ChevronUp size={24} className="animate-nudge-up" />
                        </button>
                    )}
                    {maxScroll > 0 && scrollTop < maxScroll && (
                        <button
                            onClick={() => scrollByDirection(1)}
                            title="Desplazar hacia abajo"
                            style={{ top: trackTop + trackHeight - 32 }}
                            className={`absolute right-0 w-6 h-6 flex items-center justify-center text-gray-700 cursor-pointer transition-opacity duration-300 ${thumbActive ? "opacity-100" : "opacity-90"}`}
                        >
                            <ChevronDown size={24} className="animate-nudge-down" />
                        </button>
                    )}
                    {maxScroll > 0 && (
                        <div
                            onMouseDown={handleThumbMouseDown}
                            style={{ top: thumbTop, height: thumbHeight }}
                            className={`absolute right-[1px] w-1 rounded-full bg-gray-400 transition-opacity duration-300 cursor-grab ${thumbActive ? "opacity-100" : "opacity-60"} ${isDragging ? "cursor-grabbing" : ""}`}
                        />
                    )}
                </div>
            </aside>
        </>
    )
}