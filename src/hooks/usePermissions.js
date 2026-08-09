import { authStorage } from "../utils/authStorage";

export const usePermissions = () => {
    const user = authStorage.getUser();
    const permissions = user?.permissions || [];

    const scopeMap = {
        "Categoria de productos": "categorias",
        "Productos":              "productos",
        "Ficha tecnica":          "fichatecnica",
        "Compras":                "compras",
        "Proveedores":            "proveedores",
        "Ventas":                 "ventas",
        "Clientes":               "clientes",
        "Pedidos":                "pedidos",
        "Pagos y abonos":         "pagos",
        "Devoluciones":           "devoluciones",
        "Usuarios":               "usuarios",
        "Roles":                  "roles",
        "Dashboard":              "dashboard",
    };

    const actionMap = {
        "acceso":   "acceso",
        "Ver":      "ver",
        "Crear":    "crear",
        "Editar":   "editar",
        "Eliminar": "eliminar",
        "Estado":   "estado",
        "Procesar": "procesar",
        "Anular":   "anular",
        "Reporte":  "reporte",
        "Cupo":     "cupo",
        "Devolver": "devolver",
        "Abonar":   "abonar",
    };

    const hasPermission = (scope, action = "acceso") => {
        if (!user) return false;
        if (user.role === "Administrador") return true;

        const mappedScope  = scopeMap[scope]  || scope.toLowerCase();
        const mappedAction = actionMap[action] || action.toLowerCase();
        const permission   = `${mappedScope}:${mappedAction}`;

        return permissions.includes(permission);
    };

    const hasAccessToScope = (scope) => {
        if (!user) return false;
        if (user.role === "Administrador") return true;

        const mappedScope = scopeMap[scope] || scope.toLowerCase();

        // Tiene acceso si tiene el permiso :acceso O cualquier otro permiso del módulo
        return permissions.some(p => p.startsWith(`${mappedScope}:`));
    };

    return { hasPermission, hasAccessToScope };
};