import { Router } from "express";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  listProductCategories,
  toggleProductCategoryStatus,
  updateProductCategory,
} from "../controllers/productCategoriesController.js";

const router = Router();

router.get("/", listProductCategories);
router.get("/:id", getProductCategoryById);
router.post("/", createProductCategory);
router.patch("/:id", updateProductCategory);
router.delete("/:id", deleteProductCategory);
router.patch("/:id/toggle-status", toggleProductCategoryStatus);

export default router;
