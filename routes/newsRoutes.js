import express from "express";
import { protect } from "../middleware/authMiddleware.js";
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

// CRUD
router.get("/", getAllNews);
router.post("/", protect, createNews);     // ✅ use protect
router.put("/:id", protect, updateNews);
router.delete("/:id", protect, deleteNews);

// Interactions
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.put("/:id/share", protect, shareNews);

export default router;
