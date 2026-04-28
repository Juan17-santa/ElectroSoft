import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 rounded-2xl">
            <ShieldAlert size={80} className="text-gray-300 mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
            <p className="text-gray-500 mb-8 max-w-md text-center">
                Lo sentimos, la página que buscas no existe o no tienes los permisos necesarios para acceder a ella.
            </p>
            <button 
                onClick={() => navigate('/dashboard')}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
            >
                Volver al Dashboard
            </button>
        </div>
    );
};

export default NotFound;
