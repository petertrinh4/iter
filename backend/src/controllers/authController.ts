import type { Request, Response } from "express";
import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { cognito } from "../utils/cognito.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  console.log("REGISTER HIT");

  const { email, password, name, username } = req.body;

  console.log("Request body:", {
    email,
    name,
    username,
  });

  try {
    console.log("Calling Cognito...");

    await cognito.send(
      new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          {
            Name: "name",
            Value: name,
          },
          {
            Name: "preferred_username",
            Value: username,
          },
        ],
      }),
    );

    console.log("Cognito signup complete");

    return res.status(201).json({
      message: "Verification code sent.",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(400).json({
      message: "Registration failed.",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: "Missing fields",
    });
  }

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code,
      }),
    );

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Invalid or expired code.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Missing fields",
    });
  }

  try {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );

    const authResult = result.AuthenticationResult;

    const idToken = authResult?.IdToken;

    if (!idToken) {
      return res.status(401).json({
        message: "Missing ID token",
      });
    }

    const decoded = jwt.decode(idToken) as any;

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const cognitoSub = decoded.sub;
    const cognitoEmail = decoded.email;
    const cognitoName = decoded.name;
    const cognitoUsername = decoded.preferred_username;

    // Create MongoDB user if first login
    const existingUser = await User.findOne({
      cognitoSub,
    });

    if (!existingUser) {
      await User.create({
        cognitoSub,
        email: cognitoEmail,
        name: cognitoName,
        username: cognitoUsername,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      accessToken: authResult?.AccessToken,
      idToken: authResult?.IdToken,
      refreshToken: authResult?.RefreshToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid credentials or user not confirmed",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    await cognito.send(
      new ForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,
      }),
    );

    return res.status(200).json({
      message: "Reset code sent to your email.",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Unable to send reset code.",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      message: "Missing fields",
    });
  }

  try {
    await cognito.send(
      new ConfirmForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      }),
    );

    return res.status(200).json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Invalid code or password.",
    });
  }
};
