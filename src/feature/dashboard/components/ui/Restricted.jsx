import React from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';

export const Restricted = ({ scope, action, children }) => {
    const { hasPermission } = usePermissions();
    
    if (hasPermission(scope, action)) {
        return <>{children}</>;
    }

    return null;
};
