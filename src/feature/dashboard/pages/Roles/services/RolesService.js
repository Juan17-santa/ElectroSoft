import api from "../../../../../utils/api.js";

// Permisos en el mismo formato que el backend
export const PERMISSION_SCOPES = [
  { name: "dashboard", label: "Dashboard", actions: ["acceso"] },
  { name: "categorias", label: "Categoria de productos", actions: ["acceso", "crear", "editar", "estado", "eliminar"] },
  { name: "productos", label: "Productos", actions: ["acceso", "ver", "crear", "editar", "estado", "eliminar", "reporte"] },
  { name: "proveedores", label: "Proveedores", actions: ["acceso", "ver", "crear", "editar", "estado", "eliminar"] },
  { name: "compras", label: "Compras", actions: ["acceso", "ver", "crear", "anular", "reporte"] },
  { name: "clientes", label: "Clientes", actions: ["acceso", "ver", "crear", "editar", "cupo", "eliminar", "reporte"] },
  { name: "pedidos", label: "Pedidos", actions: ["acceso", "ver", "crear", "procesar", "anular", "reporte"] },
  { name: "ventas", label: "Ventas", actions: ["acceso", "ver", "crear", "anular", "devolver", "abonar", "reporte"] },
  { name: "pagos", label: "Pagos y abonos", actions: ["acceso", "ver", "abonar", "editar-cupo"] },
  { name: "devoluciones", label: "Devoluciones", actions: ["acceso", "ver", "editar", "anular", "reporte"] },
  { name: "usuarios", label: "Usuarios", actions: ["acceso", "ver", "crear", "editar", "estado", "eliminar"] },
  { name: "roles", label: "Roles", actions: ["acceso", "ver", "crear", "editar", "estado", "eliminar"] },
];

export const RolesService = {

  async get() {
    const response = await api.get("/roles");
    return response.data.data
      .map(r => ({
        id: r._id,
        nombre: r.name,
        descripcion: r.description,
        estado: r.isActive,
        fechaCreacion: new Date(r.createdAt).toLocaleDateString("es-CO"),
        permisos: r.permissions,
      }))
      .reverse(); // ← más reciente primero
  },

  async getById(id) {
    const response = await api.get(`/roles/${id}`);
    const r = response.data.data;
    return {
      id: r._id,
      nombre: r.name,
      descripcion: r.description,
      estado: r.isActive,
      fechaCreacion: new Date(r.createdAt).toLocaleDateString("es-CO"),
      permisos: r.permissions,
    };
  },

  async create({ nombre, descripcion, permisos = [] }) {
    const response = await api.post("/roles", {
      name: nombre,
      description: descripcion,
      permissions: permisos,
    });
    return response.data.data;
  },

  async update({ id, nombre, descripcion, permisos }) {
    const response = await api.put(`/roles/${id}`, {
      name: nombre,
      description: descripcion,
      permissions: permisos,
    });
    return response.data.data;
  },

  async delete(id) {
    await api.delete(`/roles/${id}`);
  },

  async toggleEstado(id) {
    const response = await api.patch(`/roles/${id}/toggle-status`);
    return response.data.data;
  },
};