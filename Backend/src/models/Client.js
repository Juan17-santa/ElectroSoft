import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    tipoDocumento: { type: String, default: "" },
    documento: { type: String, required: true, trim: true, unique: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    telefono: { type: String, default: "" },
    totalCompras: { type: Number, default: 0 },
    fechaCreacion: { type: String, default: () => new Date().toISOString().split("T")[0] },
    estado: { type: Boolean, default: true },
    cupoActivo: { type: Boolean, default: false },
    cupoTotal: { type: Number, default: 0 },
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

export default mongoose.model("Client", clientSchema);
