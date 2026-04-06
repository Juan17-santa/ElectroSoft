import { Router } from "express";
import {
  createProvider,
  deleteProvider,
  getProviderById,
  listProviders,
  toggleProviderStatus,
  updateProvider,
} from "../controllers/providersController.js";

const router = Router();

router.get("/", listProviders);
router.get("/:id", getProviderById);
router.post("/", createProvider);
router.patch("/:id", updateProvider);
router.delete("/:id", deleteProvider);
router.patch("/:id/toggle-status", toggleProviderStatus);

export default router;
