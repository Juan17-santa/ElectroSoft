const STORAGE_KEY = "users";

// Datos iniciales
// const defaultUsers = [
//   {
//     id: 1,
//     documento: "C.C 1203084765",
//     nombre: "Juan Manuel Santa",
//     email: "juan.santa@gmail.com",
//     telefono: "3123456723",
//     rol: "Admin",
//     estado: true,
//   },
//   {
//     id: 2,
//     documento: "C.C 1035498525",
//     nombre: "Manuel Esteban Sanchez",
//     email: "manuelE@gmail.com",
//     telefono: "3217645657",
//     rol: "Empleado",
//     estado: true,
//   },
// ];

// // Inicializa localStorage si está vacío
// export function initUsers() {
//   const data = localStorage.getItem(STORAGE_KEY);
//   if (!data) {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
//   }
// }


//para cargar los datos iniciales solo la primera vez 

// Obtener usuarios
export function getUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Guardar usuarios
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// ➕ Crear usuario
export function addUser(user) {
  const users = getUsers();

  const newUser = {
    ...user,
    id: Date.now(),
    password: "123456",
  };

  const updated = [...users, newUser];

  saveUsers(updated);

  return updated;
}



// ✏️ Actualizar usuario
export function updateUser(id, updatedData) {
  const users = getUsers();

  const updated = users.map((u) =>
    u.id === Number(id) ? { ...u, ...updatedData } : u
  );

  saveUsers(updated);
  return updated;
}

// 🔎 Obtener usuario por ID
export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === Number(id));
}

// 🔄 Cambiar estado activo/inactivo
export function toggleUserStatus(id) {
  const users = getUsers();
  const updated = users.map((u) =>
    u.id === Number(id) ? { ...u, estado: !u.estado } : u
  );
  saveUsers(updated);
  return updated;
}

// 🗑️ Eliminar usuario
export function deleteUser(id) {
  const users = getUsers();
  const updated = users.filter((u) => u.id !== Number(id));
  saveUsers(updated);
  return updated;
}
