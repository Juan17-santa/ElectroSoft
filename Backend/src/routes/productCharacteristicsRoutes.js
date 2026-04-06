import { Router } from "express";
import {
  createProductCharacteristic,
  deleteProductCharacteristic,
  listProductCharacteristics,
} from "../controllers/productCharacteristicsController.js";

const router = Router();

router.get("/", listProductCharacteristics);
router.post("/", createProductCharacteristic);
router.delete("/:id", deleteProductCharacteristic);

export default router;
