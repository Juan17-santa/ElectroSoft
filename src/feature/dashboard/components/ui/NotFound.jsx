// src/feature/dashboard/components/ui/NotFound.jsx
import React from 'react';
import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl shadow-sm px-12 py-14 max-w-md w-full text-center">

                <div className="bg-yellow-50 rounded-full p-5 mb-6">
                    <ShieldOff size={48} className="text-yellow-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Acceso restringido
                </h1>

                <p className="text-gray-500 text-sm mb-1">
                    No tienes permisos para ver este módulo.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    Contacta al administrador para solicitar acceso.
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-8 rounded-lg transition-colors shadow-sm w-full"
                >
                    Volver
                </button>
            </div>
        </div>
    );
};

export default NotFound;