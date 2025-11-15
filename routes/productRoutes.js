import express from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  adminDeleteProduct,
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js"; // multer + cloudinary

const router = express.Router();

// =====================================
// 🔹 USER / SELLER ROUTES
// =====================================

// Create product with multiple images
router.post("/create", protect, upload.array("images", 10), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get single product
router.get("/:id", getSingleProduct);

// Update product (seller only) with optional image upload
router.put("/:id", protect, upload.array("images", 10), updateProduct);

// Soft delete (seller)
router.delete("/:id", protect, deleteProduct);

// =====================================
// 🔥 ADMIN ROUTES
// =====================================

// Permanent delete
router.delete("/admin/permanent/:id", protect, admin, adminDeleteProduct);

export default router;
