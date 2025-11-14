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

const router = express.Router();


// =====================================
// 🔹 USER / SELLER ROUTES
// =====================================

// Create product
router.post("/create", protect, createProduct);

// Get all products
router.get("/", getAllProducts);

// Get single product
router.get("/:id", getSingleProduct);

// Update product (seller only)
router.put("/:id", protect, updateProduct);

// Soft delete (seller)
router.delete("/:id", protect, deleteProduct);


// =====================================
// 🔥 ADMIN ROUTES
// =====================================

// Permanent delete
router.delete("/admin/permanent/:id", protect, admin, adminDeleteProduct);


export default router;
