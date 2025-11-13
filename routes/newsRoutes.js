import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // multer middleware
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  toggleLike,
  addComment,
  shareNews
} from "../controllers/newsController.js";

const router = express.Router();

// ---------------- CRUD ----------------
// Get all news
router.get("/", getAllNews);

// Create news (with optional image)
router.post("/", protect, upload.single("image"), createNews);

// Update news (with optional image)
router.put("/:id", protect, upload.single("image"), updateNews);

// Delete news
router.delete("/:id", protect, deleteNews);

// ---------------- Interactions ----------------
// Like / Unlike
router.put("/:id/like", protect, toggleLike);

// Comment
router.post("/:id/comment", protect, addComment);

// Share
router.put("/:id/share", protect, shareNews);

export default router;
