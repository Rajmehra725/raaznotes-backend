import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import feelingRoutes from "./routes/feelingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import safetyRoutes from "./routes/safetyRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feelings", feelingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
// newly added route groups
app.use("/api/posts", postRoutes);     // posts/feelings CRUD + real-time
app.use("/api/stories", storyRoutes); // stories
app.use("/api/users", userRoutes);     // admin users (GET/DELETE)

// Keep old auth-users compatibility (optional)
app.use("/api/auth/users", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("LYF Backend API is Running...");
});

// Create HTTP server & Socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*" }
});

// make io available in req.app
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port raaz ${PORT}`));
