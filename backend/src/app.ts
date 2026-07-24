import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

const app = express();

// 1. BULLETPROOF FIX: Automatically remove double slashes from incoming URLs!
// This fixes the issue where the frontend accidentally sends http://localhost:3000//api/...
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

// 2. CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Bypass-Tunnel-Reminder", "User-Agent"],
  })
);

app.use(express.json());

// 3. MOUNT ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/user", userRoutes);

console.log("✅ All Express Routes Loaded");

// 4. Debug 404 Handler
app.use((req, res, next) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

export default app;