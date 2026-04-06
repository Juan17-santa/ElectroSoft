import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRoleById,
  listRoles,
  toggleRoleStatus,
  updateRole,
} from "../controllers/rolesController.js";

const router = Router();

router.get("/", listRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.patch("/:id", updateRole);
router.delete("/:id", deleteRole);
router.patch("/:id/toggle-status", toggleRoleStatus);

export default router;
