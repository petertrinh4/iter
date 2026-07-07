import type { Request, Response } from "express";
import mongoose from "mongoose";

import Route from "../models/Route.js";
import User from "../models/User.js";

/*
 * POST /api/routes/save
 */
export const saveRoute = async (req: Request, res: Response) => {
  try {
    const { routeName, distanceMiles, waypoints } = req.body;

    if (!routeName || !distanceMiles || !waypoints || waypoints.length < 2) {
      return res.status(400).json({
        message: "Invalid route data",
      });
    }

    if (!req.user?.sub) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
   console.log("Authenticated user:", req.user);
console.log("Cognito sub:", req.user.sub); 
    // Find the MongoDB user using the Cognito sub
    const user = await User.findOne({
      cognitoSub: req.user.sub,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const route = await Route.create({
      user: user._id,
      routeName,
      distanceMiles,
      waypoints,
    });

    return res.status(201).json({
      message: "Route saved successfully",
      route,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/*
 * GET /api/routes/my-routes
 */
export const loadRoutes = async (req: Request, res: Response) => {
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

    const routes = await Route.find({
      user: user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(routes);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/*
 * DELETE /api/routes/:id
 */
export const deleteRoute = async (req: Request, res: Response) => {
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

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid route id",
      });
    }

    const route = await Route.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    return res.status(200).json({
      message: "Route deleted",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
