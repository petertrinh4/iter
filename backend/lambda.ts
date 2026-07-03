import serverless from "serverless-http";
import app from "./app.js";
import { connectDB } from "./utils/db.js";

await connectDB();

export const handler = serverless(app);