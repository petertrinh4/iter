import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  cognitoSub: string;
  email: string;
  username: string;
  name: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  cognitoSub: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  name: { type: String, required: true }, // ✅ ADD THIS
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);