import { Router } from "express";
import {
  createShopping,
  deleteShopping,
  getShoppingById,
  listShopping,
  replaceAllShopping,
  updateShopping,
} from "../controllers/shoppingController.js";

const router = Router();

router.get("/", listShopping);
router.get("/:id", getShoppingById);
router.post("/", createShopping);
router.patch("/:id", updateShopping);
router.delete("/:id", deleteShopping);
router.put("/bulk", replaceAllShopping);

export default router;
