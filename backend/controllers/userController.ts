import type { Request, Response } from "express";
import User from "../models/User.js";

export const getMe = async (req: Request, res: Response) => {
  try {
    const sub = req.user?.sub;
    const email = req.user?.email;

    if (!sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ cognitoSub: sub });

if (!user) {
  user = await User.create({
    cognitoSub: sub,
    email: email ?? "unknown@example.com",
    username: email?.split("@")[0] ?? "user",
  });
}

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};