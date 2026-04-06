import { Router } from "express";
import {
  annulDevolution,
  annulDevolutionsBySale,
  createDevolution,
  deleteDevolution,
  getDevolutionById,
  listDevolutions,
  updateDevolution,
} from "../controllers/devolutionsController.js";

const router = Router();

router.get("/", listDevolutions);
router.get("/:id", getDevolutionById);
router.post("/", createDevolution);
router.patch("/:id", updateDevolution);
router.delete("/:id", deleteDevolution);
router.patch("/:id/annul", annulDevolution);
router.patch("/sale/:saleId/annul", annulDevolutionsBySale);

export default router;
