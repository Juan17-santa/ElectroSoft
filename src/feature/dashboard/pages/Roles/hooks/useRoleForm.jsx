import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";

export function useRoleForm({ initialData = null, onSubmit }) {

    const [formData, setFormData] = useState({
        id:            "",
        nombre:        "",
        descripcion:   "",
        estado:        true,
        fechaCreacion: new Date().toLocaleDateString("es-CO"),
        permisos:      [], // array plano: ["ventas:ver", "ventas:crear"]
    });

    const [tocado,    setTocado]    = useState({ nombre: false });
    const [formError, setFormError] = useState(null);

    const tocar       = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));
    const estadoNombre = tocado.nombre ? Validations.validarNombreRol(formData.nombre) : null;

    useEffect(() => {
        if (initialData) {
            setFormData({
                id:            initialData.id            || "",
                nombre:        initialData.nombre        || "",
                descripcion:   initialData.descripcion   || "",
                estado:        initialData.estado        ?? true,
                fechaCreacion: initialData.fechaCreacion || new Date().toLocaleDateString("es-CO"),
                permisos:      initialData.permisos      || [],
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    // Agrega o quita un permiso individual: "ventas:crear"
    const handlePermissionChange = (scopeName, action) => {
        const permission = `${scopeName}:${action}`;
        setFormData(prev => {
            const permisos = prev.permisos.includes(permission)
                ? prev.permisos.filter(p => p !== permission)
                : [...prev.permisos, permission];
            return { ...prev, permisos };
        });
        setFormError(null);
    };

    // Marca o desmarca todos los permisos de un módulo
    const handleScopeToggle = (scopeName, allActions) => {
        const scopePermissions = allActions.map(a => `${scopeName}:${a}`);
        setFormData(prev => {
            const allSelected = scopePermissions.every(p => prev.permisos.includes(p));
            const permisos = allSelected
                ? prev.permisos.filter(p => !scopePermissions.includes(p))
                : [...new Set([...prev.permisos, ...scopePermissions])];
            return { ...prev, permisos };
        });
        setFormError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);
        setTocado({ nombre: true });

        const vNombre = Validations.validarNombreRol(formData.nombre);
        if (!vNombre.valido) return;

        if (formData.permisos.length === 0) {
            setFormError("Debe elegir al menos un permiso para crear/editar este rol.");
            return;
        }

        onSubmit(formData);
    };

    return {
        formData,
        tocado,
        tocar,
        estadoNombre,
        formError,
        setFormError,
        handleChange,
        handleSelectChange,
        handlePermissionChange,
        handleScopeToggle,
        handleSubmit,
        setFormData,
    };
}