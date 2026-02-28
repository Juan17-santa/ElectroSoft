export function useProviderForm({ initialData = {}, onSuccess, mode }) {

    const [formData, setFormData] = useState({
        tipoDoc: "",
        documento: "",
        nombreProveedor: "",
        nombreContacto: "",
        telefonoContacto: "",
        categoriasAsociadas: [],
        ...initialData
    });

    // TODAS tus validaciones aquí

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === "create") {
            ServicesProviders.create(formData);
        }

        if (mode === "update") {
            ServicesProviders.update(formData);
        }

        onSuccess();
    };

    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        categorias,
        open,
        setOpen,
        handleToggleCategoria
    };
}