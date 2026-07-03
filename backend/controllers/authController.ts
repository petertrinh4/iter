import type { Request, Response } from "express";
import {
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { cognito } from "../utils/cognito.js";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
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
        ],
      })
    );

    res.status(201).json({
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Registration failed.",
    });
  }
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

    res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.status(400).json({
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

export const completeProfile = async (
  req: Request,
  res: Response
) => {
  // later
};