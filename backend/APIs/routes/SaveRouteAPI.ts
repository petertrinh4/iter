// written by: Elijah Johnson
// Will be used to save a route to the database. This will be used in the future to allow users to save their favorite routes and view them later.

// ==========================================
// Import Dependencies
// ==========================================
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// ==========================================
// 1. Mongoose Schema & Interface
// ==========================================
// This defines the structure of a Route in our MongoDB database
interface IRoute extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  routeName: string;
  distanceMiles: number;
  startPoint: number[]; // Array containing [Longitude, Latitude]
  endPoint: number[];   // Array containing [Longitude, Latitude]
  createdAt: Date;
}

const routeSchema = new mongoose.Schema<IRoute>({
  // ref: 'User' links this to your User database collection!
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  routeName: { type: String, required: true },
  distanceMiles: { type: Number, required: true },
  startPoint: { type: [Number], required: true }, 
  endPoint: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compile the model (or use existing if it's already compiled to avoid overwrite errors)
const Route = (mongoose.models.Route as mongoose.Model<IRoute>) || mongoose.model<IRoute>('Route', routeSchema);

// ==========================================
// 2. Save Route API Endpoint
// ==========================================
// The frontend hits http://localhost:3000/APIs/routes/saveRoute
router.post('/saveRoute', async (req: Request, res: Response) => {
  try {
    // Extract the data sent from the React frontend
    const { userId, routeName, distanceMiles, startPoint, endPoint } = req.body;

    // Basic validation to ensure we aren't saving empty data
    if (!userId || !startPoint || !endPoint) {
      return res.status(400).json({ error: "Missing required route data." });
    }

    // Create a new database entry using the Mongoose model
    const newRoute = new Route({
      userId,
      routeName,
      distanceMiles,
      startPoint,
      endPoint
    });

    // Save it to MongoDB
    const savedRoute = await newRoute.save();
    console.log("✅ New route saved successfully for user:", userId);

    // Send a success message back to the frontend
    res.status(201).json({
      message: "Route saved successfully!",
      route: savedRoute
    });

  } catch (error) {
    console.error("Route Save Error:", error);
    res.status(500).json({ error: "Server error while saving route." });
  }
});

export default router;