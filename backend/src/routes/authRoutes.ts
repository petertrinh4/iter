import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendCode,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/verify", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Add the new resend-code route here
router.post("/resend-code", resendCode);

export default router;
