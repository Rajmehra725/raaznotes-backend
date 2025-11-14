import express from "express";
import {
  addOrUpdateReview,
  deleteReview,
  getReviewsOfProduct
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add or edit review
router.post("/", protect, addOrUpdateReview);

// Delete review
router.delete("/:id", protect, deleteReview);

// Get all reviews of a product
router.get("/product/:id", getReviewsOfProduct);

export default router;
