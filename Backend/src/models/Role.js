import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    nombre: { type: String, required: true, trim: true, unique: true },
    descripcion: { type: String, default: "" },
    permisos: { type: mongoose.Schema.Types.Mixed, default: {} },
    fechaCreacion: { type: String, default: () => new Date().toISOString().split("T")[0] },
    estado: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export default mongoose.model("Role", roleSchema);
