import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("🏃‍♂️ Running App API is up and running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

export default app;