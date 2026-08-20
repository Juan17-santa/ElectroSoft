import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import NotFound from '../feature/dashboard/components/ui/NotFound';

export const ProtectedRoute = ({ scope, action, actions, element }) => {
    const { hasPermission, hasAccessToScope } = usePermissions();

    let allowed;

    if (actions) {
        // Múltiples permisos — tiene acceso si tiene AL MENOS UNO
        allowed = actions.some(({ scope: s, action: a }) => hasPermission(s, a));
    } else if (action) {
        allowed = hasPermission(scope, action);
    } else {
        allowed = hasAccessToScope(scope);
    }

    if (!allowed) {
        return <NotFound />;
    }

    return element;
};