import { ChevronDown, Lightbulb, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Navbar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    

    return (
        <header className="bg-white border-b-2 border-yellow-300 shadow-[0_2px_6px_rgba(234,179,8,0.15)]">
            <div className="flex items-center justify-between px-6 py-1">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div>
                        <Lightbulb size={35} className="text-yellow-400" />
                    </div>
                    <span className="text-3xl font-semibold">
                        Electro<span className="text-yellow-500">Soft</span>
                    </span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="avatar"
                            className="w-9 h-9 rounded-full object-cover"
                        />

                        <div className="text-left leading-tight">
                            <p className="text-sm font-medium">Andres Camilo S...</p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>

                        <ChevronDown size={18} className="text-gray-500" />
                    </button>

                    {/* Card de perfil */}
                    {open && (
                        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 z-50">

                            {/* Header card */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-400">
                                    Último acceso: 20 oct 2025
                                </span>

                                <button className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                                onClick={() => navigate("/dashboard/editprofile")}>
                                    <Pencil size={16}  />
                                    
                                    Editar perfil
                                </button>
                            </div>

                            {/* Contenido */}
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src="https://i.pravatar.cc/120"
                                    alt="avatar"
                                    className="w-24 h-24 rounded-full object-cover mb-3"
                                />

                                <p className="font-semibold text-lg">
                                    Andres Camilo Santa Aguiar
                                </p>

                                <p className="text-blue-600 text-sm hover:underline cursor-pointer">
                                    CamiloSanta20@gmail.com
                                </p>

                                <p className="text-gray-500 text-sm mt-1">
                                    Administrador
                                </p>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};
