import type { Request, Response } from "express";
import User from "../models/User.js";

export const getMe = async (req: Request, res: Response) => {
  try {
    const cognitoSub = req.user?.sub;
    const email = req.user?.email;

    if (!cognitoSub || !email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ cognitoSub });

    if (!user) {
      user = await User.create({
        cognitoSub,
        email,
        name: "",
        username: "",
      });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
