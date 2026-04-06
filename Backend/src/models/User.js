import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    tipoDoc: { type: String, default: "" },
    documento: { type: String, default: "" },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    telefono: { type: String, default: "" },
    rol: { type: String, default: "Administrador" },
    estado: { type: Boolean, default: true },
    password: { type: String, required: true, select: false },
    ultimoAcceso: { type: String, default: "" },
    resetCode: { type: String, default: null, select: false },
    resetCodeExpiresAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.resetCode;
        delete ret.resetCodeExpiresAt;
        return ret;
      },
    },
  },
);

export default mongoose.model("User", userSchema);
