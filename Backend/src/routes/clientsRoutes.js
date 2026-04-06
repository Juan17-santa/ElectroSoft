import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  toggleClientStatus,
  updateClient,
} from "../controllers/clientsController.js";

const router = Router();

router.get("/", listClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);
router.patch("/:id/toggle-status", toggleClientStatus);

export default router;
