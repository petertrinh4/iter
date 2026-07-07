import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  saveRoute,
  loadRoutes,
  deleteRoute,
} from "../controllers/routeController.js";

const router = Router();

/*
 * POST /api/routes/save
 */
router.post(
  "/save",
  authMiddleware,
  saveRoute
);

/*
 * GET /api/routes/my-routes
 */
router.get(
  "/my-routes",
  authMiddleware,
  loadRoutes
);

/*
 * DELETE /api/routes/:id
 */
router.delete(
  "/:id",
  authMiddleware,
  deleteRoute
);

export default router;