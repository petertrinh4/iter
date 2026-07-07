import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/user", userRoutes);

console.log("AUTH ROUTES LOADED");
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.path);
  next();
});

export default app;
