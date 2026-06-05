export const authStorage = {
  saveSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};