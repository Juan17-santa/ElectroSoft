import { User, FileText, X, IdCard, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicesProviders } from "./services/ServicesProviders";

export default function CreateProvider() {
    const navigate = useNavigate();

    // TRAER CATEGORIAS PARA MAPEAR AL MOMENTO DE CREAR EL PROVEEDOR EN CATEGORIAS ASOCIADAS 
    const [categorias, setCategorias] = useState([]);

    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombreProveedor: "",
        nombreContacto: "",
        telefonoContacto: "",
        categoriasAsociadas: []
    })

    // CARGAR LAS CATEGORIAS
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("productCategory")) || [];
        setCategorias(data);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    // FUNCION PARA AGREGAR O QUITAR CATEGORIAS
    const handleAddCategoria = (e) => {
        const value = Number(e.target.value);

        if (!value) return;

        setFormData(prev => {
            if (prev.categoriasAsociadas.includes(value)) return prev;

            return {
                ...prev,
                categoriasAsociadas: [...prev.categoriasAsociadas, value]
            };
        });
    };

    const handleRemoveCategoria = (id) => {
        setFormData(prev => ({
            ...prev,
            categoriasAsociadas: prev.categoriasAsociadas.filter(cat => cat !== id)
        }));
    };

    const handleForm = (e) => {
        e.preventDefault();

        try {

            if (formData.documento.length < 8 || formData.documento.length > 12) {
                alert("El documento debe tener entre 8 y 12 caracteres");
                return;
            }

            if (formData.telefonoContacto.length < 8 || formData.telefonoContacto.length > 14) {
                alert("El telefono debe tener entre 8 y 14 caracteres");
                return;
            }

            ServicesProviders.create(formData);

            alert("Proveedor creado correctamente!");

            setFormData({ tipoDoc: "", documento: "", nombreProveedor: "", nombreContacto: "", telefonoContacto: "", CategoriasAsociadas: [] });

            navigate("/dashboard/providers");

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 shadow-inner">
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xl font-semibold mb-4">Crear nuevo proveedor <span className="text-yellow-400">de productos</span></p>
                        <p className="text-sm text-gray-600">Complete todos los campos del formulario</p>
                    </div>

                    <button
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                        onClick={() => navigate("/dashboard/providers")}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleForm}>
                    <div className="flex flex-col items-center gap-12 mt-6 justify-around mx-28">

                        <div className="flex gap-20">
                            {/* TIPO DOCUMENTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <IdCard size={16} />
                                    <span>Tipo de documento *</span>
                                </div>
                                <select
                                    name="tipoDoc"
                                    value={formData.tipoDoc}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="" hidden>Seleccione un tipo</option>
                                    <option value="NIT">NIT</option>
                                    <option value="CC">C.C</option>
                                    <option value="CE">C.E</option>
                                </select>
                            </div>

                            {/* DOCUMENTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <FileText size={16} />
                                    <span>Documento *</span>
                                </div>
                                <input
                                    type="text"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingrese su documento"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>


                        <div className="flex gap-20">
                            {/* NOMBRE PROVEEDOR */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Nombre Proveedor *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombreProveedor"
                                    value={formData.nombreProveedor}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingrese el nombre del proveedor"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* CATEGORIAS ASOCIADAS */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Categorias Asociadas</span>
                                </div>
                                <select
                                    onChange={handleAddCategoria}
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="">Seleccione una categoria</option>

                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.categoriasAsociadas.map(id => {
                                const cat = categorias.find(c => c.id === id);
                                return (
                                    <div
                                        key={id}
                                        className="bg-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {cat?.nombre}

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCategoria(id)}
                                            className="text-black font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>


                        <div className="flex gap-20">
                            {/* NOMBRE CONTACTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Nombre Contacto *</span>
                                </div>
                                <input
                                    type="text"
                                    name="nombreContacto"
                                    value={formData.nombreContacto}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingrese el nombre de contacto"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                            {/* TELEFONO CONTACTO */}
                            <div className="flex flex-col gap-3 w-80">
                                <div className="flex items-center text-yellow-400 gap-2 text-md font-medium">
                                    <User size={16} />
                                    <span>Telefono Contacto*</span>
                                </div>
                                <input
                                    type="text"
                                    name="telefonoContacto"
                                    value={formData.telefonoContacto}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingrese el telefono"
                                    className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>

                        </div>
                    </div>


                    {/* BOTON */}
                    <div className="flex justify-end mt-10 w-full">
                        <button
                            type="submit"
                            className="items-center bg-linear-to-r from-white to-yellow-300 text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer font-medium"
                        >
                            Registrar Proveedor
                        </button>
                    </div>

                </form >
            </div >
        </>
    );
}