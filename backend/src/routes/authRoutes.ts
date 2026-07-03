import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  completeProfile,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/verify", verifyEmail);
router.post("/login", login);
router.post("/complete-profile", completeProfile);

export default router;