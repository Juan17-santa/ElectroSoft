import { Router } from "express";
import {
  createProductMeasure,
  deleteProductMeasure,
  listProductMeasures,
} from "../controllers/productMeasuresController.js";

const router = Router();

router.get("/", listProductMeasures);
router.post("/", createProductMeasure);
router.delete("/:id", deleteProductMeasure);

export default router;
