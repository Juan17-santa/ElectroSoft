// import { getAuthUser } from "../feature/auth/services/authService";
// import { RolesService } from "../feature/dashboard/pages/Roles/services/RolesService";

// export const usePermissions = () => {

//     const hasPermission = (scope, action) => {
//         const authUser = getAuthUser();

//         if (!authUser) return false;

//         const userRoleName = authUser.role || authUser.rol || "Empleado";

//         // Dejar que el Admin tenga acceso total por defecto, como lo pidieron
//         if (userRoleName.toLowerCase() === "administrador" || userRoleName.toLowerCase() === "admin") {
//             return true;
//         }

//         const roles = RolesService.get();
//         // Buscamos el rol del usuario actual
//         // Aquí asumimos que el rol del usuario coincide con el 'nombre' del rol guardado
//         // Si tienes el id guardado en `authUser.rol` en el futuro, se cambiaría a `r.id === Number(userRoleName)`
//         const roleData = roles.find(r => r.nombre.toLowerCase() === userRoleName.toLowerCase());

//         if (!roleData || !roleData.estado || !roleData.permisos) {
//             return false;
//         }

//         const scopePermissions = roleData.permisos[scope];

//         if (!scopePermissions) {
//             return false;
//         }

//         // Si la acción es "Ver" y no está explícitamente en los permisos, 
//         // pero el usuario tiene otras acciones (ej. "Crear"), permitimos ver.
//         if (action === "Ver" && !scopePermissions.includes("Ver") && scopePermissions.length > 0) {
//             return true;
//         }

//         return scopePermissions.includes(action);
//     };

//     const hasAccessToScope = (scope) => {
//         const authUser = getAuthUser();
//         if (!authUser) return false;

//         const userRoleName = authUser.role || authUser.rol || "Empleado";

//         if (userRoleName.toLowerCase() === "administrador" || userRoleName.toLowerCase() === "admin") {
//             return true;
//         }

//         const roles = RolesService.get();
//         const roleData = roles.find(r => r.nombre.toLowerCase() === userRoleName.toLowerCase());

//         if (!roleData || !roleData.estado || !roleData.permisos) {
//             return false;
//         }

//         return roleData.permisos[scope] && roleData.permisos[scope].length > 0;
//     };

//     return { hasPermission, hasAccessToScope };
// };



import { authStorage } from "../utils/authStorage";

export const usePermissions = () => {

  const user = authStorage.getUser();
  const permissions = user?.permissions || [];

  // Mapeo de nombres del frontend al formato del backend
  const scopeMap = {
    "Categoria de productos": "categorias",
    "Productos": "productos",
    "Ficha tecnica": "fichatecnica",
    "Compras": "compras",
    "Proveedores": "proveedores",
    "Ventas": "ventas",
    "Clientes": "clientes",
    "Pedidos": "pedidos",
    "Pagos y abonos": "pagos",
    "Devoluciones": "devoluciones",
    "Usuarios": "usuarios",
    "Roles": "roles",
    "Dashboard": "dashboard",
  };

  const actionMap = {
    "Ver": "ver",
    "Crear": "crear",
    "Editar": "editar",
    "Eliminar": "eliminar",
    "Estado": "estado",
  };

  // src/hooks/usePermissions.js  — solo el bloque hasPermission cambia

  const hasPermission = (scope, action = "ver") => {
    if (!user) return false;
    if (user.role === "Administrador") return true;

    const mappedScope = scopeMap[scope] || scope.toLowerCase();
    const mappedAction = actionMap[action] || action.toLowerCase();

    // Si piden "ver" pero no tiene "ver" explícito,
    // permitir si tiene cualquier otro permiso en ese módulo
    if (mappedAction === "ver") {
      const hasVer = permissions.includes(`${mappedScope}:ver`);
      if (!hasVer) {
        return permissions.some((p) => p.startsWith(`${mappedScope}:`));
      }
      return hasVer;
    }

    return permissions.includes(`${mappedScope}:${mappedAction}`);
  };

  const hasAccessToScope = (scope) => {
    if (!user) return false;
    if (user.role === "Administrador") return true;

    const mappedScope = scopeMap[scope] || scope.toLowerCase();

    // Tiene acceso al módulo si tiene al menos un permiso de ese módulo
    return permissions.some((p) => p.startsWith(`${mappedScope}:`));
  };

  return { hasPermission, hasAccessToScope };
};