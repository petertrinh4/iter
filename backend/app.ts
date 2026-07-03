import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://www.teamtitan.net"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (_, res) => {
  res.send("🏃‍♂️ Running App API is up and running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

export default app;