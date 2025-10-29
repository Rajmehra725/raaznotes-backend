import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import feelingRoutes from "./routes/feelingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import safetyRoutes from "./routes/safetyRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"; // ✅ Added line

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feelings", feelingRoutes); // ✅ Feelings integrated
app.use("/api/upload", uploadRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/profile", profileRoutes); // ✅ Added line (Profile API integrated)

// Test Route
app.get("/", (req, res) => {
  res.send("LYF Backend API is Running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
