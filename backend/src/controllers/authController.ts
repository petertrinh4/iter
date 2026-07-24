import type { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createToken } from "../utils/createJWT.js";

export const register = async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user with a mock verification code
    const verificationCode = "123456"; // Mock code so your frontend flow still works

    await User.create({
      email,
      password: hashedPassword,
      name,
      username,
      verificationCode,
    });

    return res.status(201).json({
      message: "Verification code sent.",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed." });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Mark as verified and remove the code
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during verification." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // PROFESSOR'S JWT GENERATION:
    // Split the name into first and last to match the expected format
    const nameParts = (user.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    const tokenResult = createToken(firstName, lastName, user._id.toString());

    if (tokenResult.error) {
       return res.status(500).json({ message: "Token generation failed", error: tokenResult.error });
    }

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokenResult.accessToken,
      idToken: tokenResult.accessToken, // Keep for mobile compatibility
      error: "" // Professor's code expects an empty error string on success
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.verificationCode = "123456"; // Mock reset code
      await user.save();
    }
    // Always return 200 for security (don't reveal if email exists)
    return res.status(200).json({ message: "Reset code sent to your email." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to send reset code." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid code or email." });
    }

    // Hash new password and clear code
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.verificationCode = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during password reset." });
  }
};