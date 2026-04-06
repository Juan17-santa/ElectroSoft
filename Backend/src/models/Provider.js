import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    tipoDoc: { type: String, default: "" },
    documento: { type: String, required: true, trim: true, unique: true },
    nombreProveedor: { type: String, required: true, trim: true },
    nombreContacto: { type: String, default: "" },
    telefonoContacto: { type: String, default: "" },
    categoriasAsociadas: { type: [Number], default: [] },
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

export default mongoose.model("Provider", providerSchema);
