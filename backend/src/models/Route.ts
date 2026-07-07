import mongoose from "mongoose";

export interface IRoute extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  routeName: string;
  distanceMiles: number;
  waypoints: number[][];
  createdAt: Date;
}

const routeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  routeName: {
    type: String,
    required: true,
  },

  distanceMiles: {
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

export default mongoose.model<IRoute>("Route", routeSchema);