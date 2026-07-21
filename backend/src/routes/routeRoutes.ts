import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  saveRoute,
  loadRoutes,
  deleteRoute,
  searchRoutes,
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
 * GET /api/routes/search?q=query
 */
router.get(
  "/search",
  authMiddleware,
  searchRoutes
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