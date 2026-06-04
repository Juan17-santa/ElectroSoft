import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Info, X } from "lucide-react";
import { ServicesProducts } from "../services/ServicesProducts";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";
import PrimaryButton from "../../../components/ui/PrimaryButton";

export default function ProductDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [product, setProduct] = useState(location.state?.product || null);
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                let p = product;
                
                // Si no tenemos el producto de location.state, obtenerlo de la API
                if (!p && id) {
                    p = await ServicesProducts.getById(id);
                    setProduct(p);
                }

                // cargar nombre de categoría si existe
                if (p) {
                    const cats = await ServiceProductCategory.get();
                    const cat = cats.find(c => c.id === p.categoriaId);
                    if (cat) setCategoryName(cat.name);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        
        cargarDatos();
    }, [id, product]);

    if (!product) {
        return (
            <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-center h-full shadow-inner">
                <p className="text-gray-500 text-sm">No hay información para mostrar.</p>
            </div>
        );
    }

    const handleBack = () => navigate("/dashboard/products");

    return (
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 w-full h-full shadow-inner overflow-y-auto">

            <div
                className="relative bg-white rounded-3xl p-8 shadow-lg overflow-hidden h-full"
                style={{
                    backgroundImage: 'url("/background-details.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6">

                    <div className="flex items-center gap-2">
                        <Info size={22} />
                        <h2 className="text-xl font-semibold">Ver información de producto</h2>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6 shadow-md max-w-3xl w-full mx-auto">

                        <div className="flex flex-col gap-6">

                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold uppercase text-gray-500 py-2">Información general</h3>
                                <div className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md ${product.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {product.estado ? "Activo" : "Inactivo"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Nombre</p>
                                    <p className="text-sm font-semibold text-gray-800">{product.nombre}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Precio</p>
                                    <p className="text-sm font-semibold text-gray-800">${product.precio?.toLocaleString()}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Stock</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {product.stock} {product.tipoStock === "metros" ? "MTRS" : "UND"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Serial</p>
                                    <p className="text-sm font-semibold text-gray-800">{product.serial}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Garantía</p>
                                    <p className="text-sm font-semibold text-gray-800">{product.garantia}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-yellow-400 mb-1">Categoría</p>
                                    <p className="text-sm font-semibold text-gray-800">{categoryName || 'Sin categoría'}</p>
                                </div>
                            </div>

                            <div >
                                <p className="text-sm text-yellow-400 mb-1">Características</p>
                                {product.caracteristicas && product.caracteristicas.filter(c => c.visible !== false).length > 0 ? (
                                    <div className="bg-white rounded-xl shadow pt-3 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500">
                                                    <th className="px-3 py-2">Característica</th>
                                                    <th className="px-3 py-2">Medida</th>
                                                    <th className="px-3 py-2">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.caracteristicas.filter(c => c.visible !== false).map(c => (
                                                    <tr key={c.id} className="border-t border-gray-300">
                                                        <td className="px-3 py-2">{c.nombre}</td>
                                                        <td className="px-3 py-2">{c.medida}</td>
                                                        <td className="px-3 py-2">{c.valor}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Sin características</p>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <PrimaryButton type="button" onClick={handleBack}>
                    <X size={18} className="inline-block mr-2" /> Volver
                </PrimaryButton>
            </div>

        </div>
    );
}
