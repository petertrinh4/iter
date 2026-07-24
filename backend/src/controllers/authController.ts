import type { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createToken } from "../utils/createJWT.js";
import { sendEmail } from "../utils/sendEmail.js";

// Helper function to generate a random 6-digit code
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate a real 6-digit code
    const verificationCode = generateCode();

    // 4. Create the user
    await User.create({
      email,
      password: hashedPassword,
      name,
      username,
      verificationCode,
    });

    // 5. Send the email via SendGrid
    await sendEmail(
      email,
      "Welcome to Iter - Verify your account",
      `Your verification code is: ${verificationCode}`,
      `<p>Welcome to Iter!</p><p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    );

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
    return res
      .status(500)
      .json({ message: "Server error during verification." });
  }
};

// NEW: Resend Code Endpoint
export const resendCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Generate a fresh code and save it
    const newCode = generateCode();
    user.verificationCode = newCode;
    await user.save();

    // Send the new code
    await sendEmail(
      email,
      "Iter - Your new verification code",
      `Your new verification code is: ${newCode}`,
      `<p>Your new verification code is: <strong>${newCode}</strong></p>`,
    );

    return res.status(200).json({ message: "New verification code sent." });
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);
    return res.status(500).json({ message: "Failed to resend code." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const nameParts = (user.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const tokenResult = createToken(firstName, lastName, user._id.toString());

    if (tokenResult.error) {
      return res
        .status(500)
        .json({ message: "Token generation failed", error: tokenResult.error });
    }

    return res.status(200).json({
      message: "Login successful",
      accessToken: tokenResult.accessToken,
      idToken: tokenResult.accessToken,
      error: "",
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
      const resetCode = generateCode();
      user.verificationCode = resetCode;
      await user.save();

      await sendEmail(
        email,
        "Iter - Password Reset",
        `Your password reset code is: ${resetCode}`,
        `<p>You requested a password reset.</p><p>Your code is: <strong>${resetCode}</strong></p>`,
      );
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
    return res
      .status(500)
      .json({ message: "Server error during password reset." });
  }
};
