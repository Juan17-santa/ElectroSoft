// src/routers/ProtectedRoute.jsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import NotFound from '../feature/dashboard/components/ui/NotFound';

export const ProtectedRoute = ({ scope, action, element }) => {
    const { hasPermission, hasAccessToScope } = usePermissions();

    // Si se pide una acción específica (Crear, Editar...), verificar esa acción
    // Si no se pide acción (ruta principal del módulo), verificar que tenga
    // AL MENOS UN permiso en ese módulo
    const allowed = action
        ? hasPermission(scope, action)
        : hasAccessToScope(scope);

    if (!allowed) {
        return <NotFound />;
    }

    return element;
};