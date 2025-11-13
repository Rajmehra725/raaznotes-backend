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
import followRoutes from "./routes/followRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";
import chatRoutes from "./routes/chatRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
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
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/follow", followRoutes);
app.use("/api/auth/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("LYF Backend API is Running...");
});

// ✅ Create HTTP server & Socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*" }
});

// make io available in req.app
app.set("io", io);

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // 📍 User joins with userId
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // ✍️ Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", { senderId });
    }
  });

  // 📨 Send message instantly
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", { senderId, message });
    }
  });

  // 👁️ Message seen
  socket.on("seenMessage", ({ senderId, receiverId, messageId }) => {
    const senderSocket = onlineUsers.get(senderId);
    if (senderSocket) {
      io.to(senderSocket).emit("messageSeen", { receiverId, messageId });
    }
  });

  // 🚪 Disconnect
  socket.on("disconnect", () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
