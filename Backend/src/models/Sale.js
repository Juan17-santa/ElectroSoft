import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    numeroVenta: { type: Number, default: 1 },
    numeroDocumento: { type: String, default: "" },
    cliente: { type: String, default: "" },
    tipoVenta: { type: String, default: "Contado" },
    diasPlazo: { type: Number, default: null },
    fecha: { type: String, default: "" },
    estado: { type: String, default: "Finalizado" },
    productos: { type: [mongoose.Schema.Types.Mixed], default: [] },
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    montoPagado: { type: Number, default: 0 },
    montoPorPagar: { type: Number, default: 0 },
    abonos: { type: [mongoose.Schema.Types.Mixed], default: [] },
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

export default mongoose.model("Sale", saleSchema);
