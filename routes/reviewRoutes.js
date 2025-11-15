import express from "express";
import {
  addOrUpdateReview,
  deleteReview,
  getReviewsOfProduct
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*  
===========================================
 ⭐ ROUTE STRUCTURE (BEST PRACTICE)
-------------------------------------------
 POST   /api/reviews/:productId       → Add or Update Review
 GET    /api/reviews/product/:id      → Get all reviews of a product
 DELETE /api/reviews/:id              → Delete review (only owner)
===========================================
*/

// ⭐ Add or update review for a product
router.post("/:productId", protect, addOrUpdateReview);

// ⭐ Delete a review
router.delete("/:id", protect, deleteReview);

// ⭐ Get reviews of a product
router.get("/product/:id", getReviewsOfProduct);

export default router;
