import type { Request, Response } from "express";
import mongoose from "mongoose";

import Run from "../models/Run.js";
import Route from "../models/Route.js";
import User from "../models/User.js";

/*
 * POST /api/runs/save
 */
export const saveRun = async (req: Request, res: Response) => {
  try {
    const {
      pathId,
      pathName,
      distanceMiles,
      durationSeconds,
      targetPaceSeconds,
      waypoints,
    } = req.body;

    if (
      !pathId ||
      !pathName ||
      !distanceMiles ||
      !durationSeconds ||
      targetPaceSeconds === undefined ||
      !waypoints ||
      waypoints.length < 2
    ) {
      return res.status(400).json({
        message: "Invalid run data",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({
        message: "Invalid path id",
      });
    }

    if (!req.user?.sub) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({
      cognitoSub: req.user.sub,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const path = await Route.findOne({
      _id: pathId,
      user: user._id,
    });

    if (!path) {
      return res.status(404).json({
        message: "Path not found",
      });
    }

    const run = await Run.create({
      user: user._id,
      path: path._id,
      pathName,
      distanceMiles,
      durationSeconds,
      targetPaceSeconds,
      waypoints,
    });

    return res.status(201).json({
      message: "Run saved successfully",
      run,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/*
 * GET /api/runs/my-runs
 */
export const loadRuns = async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({
      cognitoSub: req.user.sub,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const runs = await Run.find({
      user: user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(runs);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
