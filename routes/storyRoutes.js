import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createStory, getStories } from "../controllers/storyController.js";

const router = express.Router();

router.get("/", protect, getStories);
router.post("/", protect, createStory);

export default router;
