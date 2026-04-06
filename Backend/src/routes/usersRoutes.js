import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  toggleUserStatus,
  updateUser,
} from "../controllers/usersController.js";

const router = Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/toggle-status", toggleUserStatus);

export default router;
