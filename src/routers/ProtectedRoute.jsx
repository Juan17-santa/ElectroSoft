import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import NotFound from '../feature/dashboard/components/ui/NotFound';

export const ProtectedRoute = ({ scope, action = "Ver", element }) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(scope, action)) {
        return <NotFound />;
    }

    return element;
};
