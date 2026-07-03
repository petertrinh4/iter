import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { Request, Response, NextFunction } from "express";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing authorization token",
      });
    }

    const token = authHeader.split(" ")[1];

if (!token) {
  return res.status(401).json({
    message: "Missing token",
  });
}

const payload = await verifier.verify(token);

const user: Express.Request["user"] = {
  sub: payload.sub,
};

if (typeof payload.email === "string") {
  user.email = payload.email;
}

req.user = user;

next();
  } catch (error) {
    console.error(error);

    res.status(401).json({
      message: "Invalid token",
    });
  }
}