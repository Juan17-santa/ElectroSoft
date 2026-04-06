import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrderById,
  listOrders,
  processOrderToSale,
  updateOrder,
} from "../controllers/ordersController.js";

const router = Router();

router.get("/", listOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/:id/cancel", cancelOrder);
router.post("/:id/process-to-sale", processOrderToSale);

export default router;
