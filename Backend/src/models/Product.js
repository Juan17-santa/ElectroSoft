import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    nombre: { type: String, required: true, trim: true },
    categoriaId: { type: Number, default: null },
    precio: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    serial: { type: String, default: "" },
    garantia: { type: String, default: "" },
    costoPromedio: { type: Number, default: 0 },
    caracteristicas: { type: [mongoose.Schema.Types.Mixed], default: [] },
    estado: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
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

export default mongoose.model("Product", productSchema);
