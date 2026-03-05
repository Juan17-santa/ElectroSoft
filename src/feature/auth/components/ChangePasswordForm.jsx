import { useState } from "react";
import { changePassword } from "../services/authService";

export default function ChangePasswordForm({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = changePassword(currentPassword, newPassword);
    if (result.ok) {
      alert("Contraseña cambiada correctamente");
      onClose(); // cerrar modal
    } else {
      alert(result.message || "Error al cambiar contraseña");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        placeholder="Contraseña actual"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-yellow-500 py-2 rounded text-white hover:bg-yellow-600">
        Cambiar Contraseña
      </button>
    </form>
  );
}