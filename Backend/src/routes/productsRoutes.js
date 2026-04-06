import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  toggleProductStatus,
  updateProduct,
} from "../controllers/productsController.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/toggle-status", toggleProductStatus);

export default router;
