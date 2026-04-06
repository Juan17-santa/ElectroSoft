import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateNumericId } from "./generateNumericId.js";

export async function ensureDefaultAdmin() {
  const totalUsers = await User.countDocuments();

  if (totalUsers > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || "123456", 10);

  await User.create({
    id: await generateNumericId(User),
    nombre: process.env.DEFAULT_ADMIN_NAME || "Administrador Global",
    email: process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com",
    password: passwordHash,
    rol: process.env.DEFAULT_ADMIN_ROLE || "Administrador",
    estado: true,
    documento: "000000000",
    telefono: "0000000000",
    tipoDoc: "CC",
  });
}
