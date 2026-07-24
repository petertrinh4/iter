import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  username: string;
  name: string;
  password?: string; // Required for local auth
  isVerified?: boolean;
  verificationCode?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  // cognitoSub has been completely removed!
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);