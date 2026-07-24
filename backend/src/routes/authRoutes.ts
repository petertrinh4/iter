import { Router } from "express";
import { register, verifyEmail, login, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = Router();

// Ensure all these exactly match what the frontend is calling
router.post("/register", register);
router.post("/verify", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;