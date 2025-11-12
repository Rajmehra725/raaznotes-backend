import express from "express";
import {
  sendMessage,
  getMessages,
  markAsSeen,
  reactToMessage,
  deleteMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// 📨 Send new message (text / media / voice)
router.post(
  "/send",
  protect,
  upload.fields([
    { name: "media", maxCount: 10 },
    { name: "voiceNote", maxCount: 1 },
  ]),
  sendMessage
);

// 💬 Get all messages between two users
router.get("/:userId", protect, getMessages);

// 👁️ Mark messages as seen
router.put("/seen/:conversationId", protect, markAsSeen);

// ❤️ React to a message
router.put("/react/:messageId", protect, reactToMessage);

// 🗑️ Delete message
router.delete("/delete/:messageId", protect, deleteMessage);

export default router;
