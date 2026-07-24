import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  saveRoute,
  loadRoutes,
  searchRoutes,
  deleteRoute,
} from "../controllers/routeController.js";

const router = Router();

// 1. MUST match frontend API_URL/api/routes/my-routes
router.get("/my-routes", authMiddleware, loadRoutes);

// 2. MUST match frontend API_URL/api/routes/save
router.post("/save", authMiddleware, saveRoute);

// 3. MUST match frontend API_URL/api/routes/search
router.get("/search", authMiddleware, searchRoutes);

// 4. MUST match frontend API_URL/api/routes/:id
router.delete("/:id", authMiddleware, deleteRoute);

export default router;
