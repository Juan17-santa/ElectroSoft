import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';

export default function SalesManagement (){
    const navigate = useNavigate();

    return(
        <>
        <div className ="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner">
            {/*HEADER*/}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xl font-semibold mb-4"> Gestión de Ventas</p>
                    
                </div>

                <button
                className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                onClick={() => navigate("/dashboard/salesmanagement")}
                >
                    <X size={20}/>
                </button>
            </div>
        </div>
        </>
    )
}