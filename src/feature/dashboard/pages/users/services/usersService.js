import api from "../../../../../utils/api.js";

export const usersService = {

  async get() {
    const response = await api.get("/users");
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async create(user) {
    const response = await api.post("/users", {
      fullName:       user.nombre,
      email:          user.email,
      phone:          user.telefono,
      documentType:   user.tipoDoc,
      documentNumber: user.documento,
      role:           user.rol,
    });
    return response.data.data;
  },

  async update(user) {
    const response = await api.put(`/users/${user.id}`, {
      fullName:       user.nombre,
      email:          user.email,
      phone:          user.telefono,
      documentType:   user.tipoDoc,
      documentNumber: user.documento,
      role:           user.rol,
    });
    return response.data.data;
  },

  async delete(id) {
    await api.delete(`/users/${id}`);
  },

  async toggleEstado(id) {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data.data;
  },
};