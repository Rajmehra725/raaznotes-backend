import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPost,
  getFeed,
  getPostsByUser,
  updatePost,
  deletePost
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protect, getFeed); // feed
router.post("/", protect, createPost); // create
router.get("/user/:userId", protect, getPostsByUser); // user's posts
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
