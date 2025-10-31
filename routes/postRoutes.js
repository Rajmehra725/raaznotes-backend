import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createPost,
  getFeed,
  getPostsByUser,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protect, getFeed);
router.post("/", protect, upload.single("media"), createPost); // ✅ Updated
router.get("/user/:userId", protect, getPostsByUser);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
