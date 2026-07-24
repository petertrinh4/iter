import jwt from "jsonwebtoken";
import "dotenv/config";

// The exact environment variable your professor requires
const SECRET =
  process.env.ACCESS_TOKEN_SECRET || "super_secret_key_change_me_in_production";

export function createToken(firstName: string, lastName: string, id: string) {
  try {
    const user = { userId: id, firstName, lastName };
    // Set to expire in 30 minutes per instructions
    const accessToken = jwt.sign(user, SECRET, { expiresIn: "30m" });
    return { accessToken: accessToken };
  } catch (e: any) {
    return { error: e.message };
  }
}

export function isExpired(token: string): boolean {
  try {
    jwt.verify(token, SECRET);
    return false; // Not expired
  } catch (err) {
    return true; // Expired or invalid
  }
}

export function refresh(token: string) {
  try {
    const ud = jwt.decode(token, { complete: true }) as any;
    if (!ud || !ud.payload) return null;

    const userId = ud.payload.userId;
    const firstName = ud.payload.firstName || "";
    const lastName = ud.payload.lastName || "";

    return createToken(firstName, lastName, userId);
  } catch (err) {
    return null;
  }
}
