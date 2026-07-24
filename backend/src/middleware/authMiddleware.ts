import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isExpired } from "../utils/createJWT.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    let token = "";

    // Support both Mobile (Bearer header) and Web (req.body.jwtToken from prof's guide)
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.body.jwtToken) {
      token = req.body.jwtToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Missing token", jwtToken: "" });
    }

    // PROFESSOR'S EXPIRATION CHECK:
    if (isExpired(token)) {
      return res
        .status(401)
        .json({ error: "The JWT is no longer valid", jwtToken: "" });
    }

    // Decode to attach user info to request
    const decoded = jwt.decode(token) as any;
    req.user = {
      sub: decoded.userId || decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token", jwtToken: "" });
  }
}
