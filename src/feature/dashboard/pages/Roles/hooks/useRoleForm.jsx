import { useState, useEffect } from "react";
import { Validations } from "../../../../../utils/validations";

export function useRoleForm({ initialData = null, onSubmit }) {
    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        estado: true,
        fechaCreacion: new Date().toLocaleDateString('es-CO'),
        permisos: {}
    });

    const [tocado, setTocado] = useState({ nombre: false, descripcion: false });
    const [formError, setFormError] = useState(null);

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));
    const estadoNombre = tocado.nombre ? Validations.validarNombreRol(formData.nombre) : null;

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                permisos: initialData.permisos || {},
                fechaCreacion: initialData.fechaCreacion || initialData.fecha || new Date().toLocaleDateString('es-CO')
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

    const handlePermissionChange = (scopeName, action) => {
        setFormData(prev => {
            const currentActions = prev.permisos[scopeName] || [];
            let newActions = currentActions.includes(action)
                ? currentActions.filter(a => a !== action)
                : [...currentActions, action];

            return {
                ...prev,
                permisos: { ...prev.permisos, [scopeName]: newActions }
            };
        });
        setFormError(null);
    };

    const handleScopeToggle = (scopeName, allActions) => {
        setFormData(prev => {
            const currentActions = prev.permisos[scopeName] || [];
            const isAllSelected = currentActions.length === allActions.length;
            return {
                ...prev,
                permisos: {
                    ...prev.permisos,
                    [scopeName]: isAllSelected ? [] : [...allActions]
                }
            };
        });
        setFormError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        const vNombre = Validations.validarNombreRol(formData.nombre);

        setTocado({ nombre: true });

        if (!vNombre.valido) {
            return;
        }

        const totalPermissions = Object.values(formData.permisos)
            .reduce((acc, curr) => acc + curr.length, 0);

        if (totalPermissions === 0) {
            setFormError("Debe elegir al menos un permiso o privilegio para crear/editar este rol.");
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
        setFormData
    };
}