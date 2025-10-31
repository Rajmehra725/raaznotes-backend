import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import {
  createPost,
  getFeed,
  getPostsByUser,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), createPost);
router.get("/", protect, getFeed);
router.get("/user/:userId", protect, getPostsByUser);
router.put("/:id", protect, upload.single("file"), updatePost);
router.delete("/:id", protect, deletePost);

export default router;
