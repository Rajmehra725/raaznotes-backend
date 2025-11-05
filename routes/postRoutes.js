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
  deleteComment,
} from "../controllers/postController.js";

const router = express.Router();

// CRUD
router.post("/", protect, upload.single("file"), createPost);
router.get("/", protect, getFeed);
router.get("/user/:userId", protect, getPostsByUser);
router.put("/:id", protect, upload.single("file"), updatePost);
router.delete("/:id", protect, deletePost);

// Like & Comment
router.put("/:id/like", protect, likePost);
router.post("/:id/comments", protect, addComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

export default router;
