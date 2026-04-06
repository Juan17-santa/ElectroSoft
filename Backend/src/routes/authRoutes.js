import { Router } from "express";
import {
  changePassword,
  getProfile,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  verifyResetCode,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/change-password", requireAuth, changePassword);

export default router;
