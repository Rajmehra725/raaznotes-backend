import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import {
  createPost,
  getFeed,
  getPostsByUser,
  updatePost,
  deletePost,
  likePost,
  addComment,
} from "../controllers/postController.js";

const router = express.Router();

// create, read, update, delete (existing)
router.post("/", protect, upload.single("file"), createPost);
router.get("/", protect, getFeed);
router.get("/user/:userId", protect, getPostsByUser);
router.put("/:id", protect, upload.single("file"), updatePost);
router.delete("/:id", protect, deletePost);

// NEW: like toggle
router.put("/:id/like", protect, likePost);

// NEW: add comment
router.post("/:id/comments", protect, addComment);

export default router;
