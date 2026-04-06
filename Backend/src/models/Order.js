import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    documento: { type: String, default: "" },
    clienteId: { type: Number, default: null },
    fechaPedido: { type: String, default: "" },
    fechaVencimiento: { type: String, default: "" },
    productos: { type: [mongoose.Schema.Types.Mixed], default: [] },
    formaPago: { type: String, default: "Contado" },
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    estado: { type: String, default: "Pendiente" },
    fechaCreacion: { type: String, default: () => new Date().toISOString() },
    cancelInfo: { type: mongoose.Schema.Types.Mixed, default: null },
    abonos: { type: [mongoose.Schema.Types.Mixed], default: [] },
    montoPagado: { type: Number, default: 0 },
    montoPorPagar: { type: Number, default: 0 },
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

export default mongoose.model("Order", orderSchema);
