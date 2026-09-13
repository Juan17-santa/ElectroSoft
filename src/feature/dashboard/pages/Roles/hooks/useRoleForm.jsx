import { useState, useEffect, useRef } from "react";
import { Validations } from "../../../../../utils/validations";
import { RolesService } from "../services/RolesService";

export function useRoleForm({ initialData = null, onSubmit }) {

    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        descripcion: "",
        estado: true,
        fechaCreacion: new Date().toLocaleDateString("es-CO"),
        permisos: [],
    });

    const debounceRef = useRef(null);
    const nameCheckSequence = useRef(0);
    const [tocado, setTocado] = useState({ nombre: false });
    const [formError, setFormError] = useState(null);
    const [estadoNombre, setEstadoNombre] = useState(null);

    const tocar = (campo) => setTocado(prev => ({ ...prev, [campo]: true }));

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id || "",
                nombre: initialData.nombre || "",
                descripcion: initialData.descripcion || "",
                estado: initialData.estado ?? true,
                fechaCreacion: initialData.fechaCreacion || new Date().toLocaleDateString("es-CO"),
                permisos: initialData.permisos || [],
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);

        if (name !== "nombre") return;

        if (!value.trim()) {
            setEstadoNombre({ valido: false, mensaje: "El nombre del rol es requerido." });
            return;
        }

        const syncValidation = Validations.validarNombreRol(value);
        if (!syncValidation.valido) {
            setEstadoNombre({ valido: false, mensaje: syncValidation.mensaje });
            return;
        }

        const currentCheck = nameCheckSequence.current + 1;
        nameCheckSequence.current = currentCheck;
        setEstadoNombre({ valido: true, mensaje: "Listo" });

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const exists = await RolesService.checkNameExists(value, formData.id || initialData?.id);
                if (currentCheck !== nameCheckSequence.current) return;

                if (exists) {
                    setEstadoNombre({ valido: false, mensaje: "Este nombre de rol ya está registrado." });
                } else {
                    setEstadoNombre({ valido: true, mensaje: "Listo" });
                }
            } catch {
                if (currentCheck === nameCheckSequence.current) {
                    setEstadoNombre({ valido: true, mensaje: "Listo" });
                }
            }
        }, 250);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handlePermissionChange = (scopeName, action) => {
        if (action === "acceso") return;

        const permission = `${scopeName}:${action}`;
        const accessPermission = `${scopeName}:acceso`;

        setFormData(prev => {
            let permisos = prev.permisos.includes(permission)
                ? prev.permisos.filter(p => p !== permission)
                : [...prev.permisos, permission];

            const otherActions = permisos.filter(
                p => p.startsWith(`${scopeName}:`) && p !== accessPermission
            );

            if (otherActions.length > 0) {
                if (!permisos.includes(accessPermission)) {
                    permisos = [...permisos, accessPermission];
                }
            } else {
                permisos = permisos.filter(p => p !== accessPermission);
            }

            return { ...prev, permisos };
        });
        setFormError(null);
    };

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
        setTocado({ nombre: true });

        let hasNameError = false;
        let hasPermissionError = false;

        const vNombre = Validations.validarNombreRol(formData.nombre);
        if (!vNombre.valido) {
            setEstadoNombre({ valido: false, mensaje: vNombre.mensaje });
            hasNameError = true;
        } else if (estadoNombre && !estadoNombre.valido) {
            setEstadoNombre({ valido: false, mensaje: estadoNombre.mensaje || "El nombre del rol ya está registrado." });
            hasNameError = true;
        }

        if (formData.permisos.length === 0) {
            setFormError("Debe elegir al menos un permiso para crear/editar este rol.");
            hasPermissionError = true;
        }

        if (hasNameError || hasPermissionError) {
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