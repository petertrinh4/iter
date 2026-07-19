import mongoose from "mongoose";

export interface IRun extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  path: mongoose.Types.ObjectId;
  pathName: string;
  distanceMiles: number;
  durationSeconds: number;
  targetPaceSeconds: number;
  waypoints: number[][];
  createdAt: Date;
}

const runSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  path: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },

  pathName: {
    type: String,
    required: true,
  },

  distanceMiles: {
    type: Number,
    required: true,
  },

  durationSeconds: {
    type: Number,
    required: true,
  },

  targetPaceSeconds: {
    type: Number,
    required: true,
  },

  waypoints: {
    type: [[Number]],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IRun>("Run", runSchema);
