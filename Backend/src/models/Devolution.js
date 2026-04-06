import mongoose from "mongoose";

const devolutionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    idVenta: { type: Number, default: null },
    motivo: { type: String, default: "" },
    submotivo: { type: String, default: "" },
    producto: { type: String, default: "" },
    cantidad: { type: Number, default: 0 },
    condicionProducto: { type: String, default: "" },
    gestion: { type: String, default: "" },
    responsable: { type: String, default: "" },
    garantiaProveedor: { type: Boolean, default: false },
    descripcion: { type: String, default: "" },
    observaciones: { type: String, default: "" },
    fechaDevolucion: { type: String, default: "" },
    fechaEstado: { type: String, default: "" },
    estadoResolucion: { type: String, default: "CREADA" },
    creadoEn: { type: String, default: () => new Date().toISOString() },
    actualizadoEn: { type: String, default: () => new Date().toISOString() },
    historialEstados: { type: [mongoose.Schema.Types.Mixed], default: [] },
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

export default mongoose.model("Devolution", devolutionSchema);
