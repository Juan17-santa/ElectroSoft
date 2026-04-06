import { Router } from "express";
import {
  addSalePayment,
  annulSale,
  createSale,
  deleteSale,
  getSaleById,
  listSales,
  returnSale,
  toggleSaleStatus,
  updateSale,
  voidSalePayment,
} from "../controllers/salesController.js";

const router = Router();

router.get("/", listSales);
router.get("/:id", getSaleById);
router.post("/", createSale);
router.patch("/:id", updateSale);
router.delete("/:id", deleteSale);
router.post("/:id/payments", addSalePayment);
router.patch("/:id/payments/:paymentId/void", voidSalePayment);
router.patch("/:id/toggle-status", toggleSaleStatus);
router.patch("/:id/annul", annulSale);
router.patch("/:id/return", returnSale);

export default router;
