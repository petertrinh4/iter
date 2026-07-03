import type { Request, Response } from "express";
import {
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { cognito } from "../utils/cognito.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body;

  await cognito.send(new SignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID!,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email }
    ],
  }));

  // store temp user in DB (optional but clean)
  await User.create({
    cognitoSub: "pending",
    email,
    name,
    username,
  });

  return res.status(201).json({
    message: "Verification code sent."
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code,
      })
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

  try {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      })
    );

    const authResult = result.AuthenticationResult;

    res.status(200).json({
      message: "Login successful",
      accessToken: authResult?.AccessToken,
      idToken: authResult?.IdToken,
      refreshToken: authResult?.RefreshToken,
    });
  } catch (error) {
    console.error(error);

    res.status(401).json({
      message: "Invalid credentials or user not confirmed",
    });
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  try {
    const { idToken, name, username } = req.body;

    if (!idToken || !name || !username) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // decode Cognito token (no verification needed if already trusted after login)
    const decoded: any = jwt.decode(idToken);

    const cognitoSub = decoded.sub;
    const email = decoded.email;

    // prevent duplicates
    const existing = await User.findOne({ cognitoSub });
    if (existing) {
      return res.status(200).json({ message: "Profile already exists" });
    }

    const user = await User.create({
      cognitoSub,
      email,
      name,
      username,
    });

    res.status(201).json({
      message: "Profile created",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};