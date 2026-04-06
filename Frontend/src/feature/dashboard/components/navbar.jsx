import { ChevronDown, Lightbulb, Pencil, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthUser, logout } from "../../auth/services/authService";
import Alert from "./ui/alert";

export const Navbar = () => {
    const [open,  setOpen]  = useState(false);
    const [user,  setUser]  = useState(null);
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    // Carga inicial
    useEffect(() => {
        const authUser = getAuthUser();
        if (authUser) setUser(authUser);
    }, []);

    // ✅ Escucha cuando el perfil se actualiza y recarga el usuario
    useEffect(() => {
        const handler = () => {
            const authUser = getAuthUser();
            if (authUser) setUser(authUser);
        };
        window.addEventListener("profile-updated", handler);
        return () => window.removeEventListener("profile-updated", handler);
    }, []);

    const nombre    = user?.fullName  || user?.nombre || "Usuario";
    const email     = user?.email     || "";
    const rol       = user?.role      || user?.rol    || "Sin rol";
    const avatar    = user?.avatar    || null;
    const ultimoAcc = user?.ultimoAcceso || null;

    const handleLogout = () => {
        setOpen(false);
        setAlert({ type: "success", message: "Has cerrado sesión correctamente." });
        setTimeout(() => {
            logout();
            navigate("/");
        }, 2000);
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

            <header className="bg-white border-b-2 border-yellow-300 shadow-[0_2px_6px_rgba(234,179,8,0.15)]">
                <div className="flex items-center justify-between px-6 py-1">

                    <div className="flex items-center gap-2">
                        <Lightbulb size={35} className="text-yellow-400" />
                        <span className="text-3xl font-semibold">
                            Electro<span className="text-yellow-500">Soft</span>
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-500">
                                    {nombre.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="text-left leading-tight">
                                <p className="text-sm font-medium">{nombre}</p>
                                <p className="text-xs text-gray-500">{rol}</p>
                            </div>

                            <ChevronDown size={18} className="text-gray-500" />
                        </button>

                        {open && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 z-50">

                                    <p className="text-xs text-gray-400 mb-4">
                                        Último acceso:{" "}
                                        <span className="font-medium text-gray-500">
                                            {ultimoAcc ?? "Sin registro"}
                                        </span>
                                    </p>

                                    <div className="flex flex-col items-center text-center mb-5">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt="avatar"
                                                className="w-24 h-24 rounded-full object-cover mb-3 ring-2 ring-amber-300"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-amber-100 ring-2 ring-amber-300
                                                flex items-center justify-center text-amber-500 font-bold text-4xl mb-3">
                                                {nombre.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <p className="font-semibold text-lg">{nombre}</p>
                                        <p className="text-blue-600 text-sm">{email}</p>
                                        <p className="text-gray-500 text-sm mt-1">{rol}</p>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                navigate("/dashboard/editprofile");
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl
                                            text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                                        >
                                            <Pencil size={16} />
                                            Editar perfil
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl
                                            text-sm font-medium text-red-500 hover:bg-red-50 transition"
                                        >
                                            <LogOut size={16} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};