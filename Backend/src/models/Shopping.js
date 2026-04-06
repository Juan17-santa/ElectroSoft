import mongoose from "mongoose";

const shoppingSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    numeroFactura: { type: String, default: "" },
    fechaCompra: { type: String, default: "" },
    proveedor: { type: String, default: "" },
    proveedorId: { type: Number, default: null },
    iva: { type: mongoose.Schema.Types.Mixed, default: 0 },
    total: { type: mongoose.Schema.Types.Mixed, default: 0 },
    estado: { type: String, default: "Activo" },
    productos: { type: [mongoose.Schema.Types.Mixed], default: [] },
    fechaCreacion: { type: String, default: () => new Date().toISOString() },
    movimientosInventario: { type: [mongoose.Schema.Types.Mixed], default: [] },
    infoAnulacion: { type: mongoose.Schema.Types.Mixed, default: null },
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

export default mongoose.model("Shopping", shoppingSchema);
