import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  saveRun,
  loadRuns,
} from "../controllers/runController.js";

const router = Router();

/*
 * POST /api/runs/save
 */
router.post(
  "/save",
  authMiddleware,
  saveRun
);

/*
 * GET /api/runs/my-runs
 */
router.get(
  "/my-runs",
  authMiddleware,
  loadRuns
);

export default router;
