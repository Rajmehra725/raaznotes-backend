import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, addReview);

export default router;
