import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMultiple } from "../config/cloudinary.js";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  adminDeleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// CREATE
router.post("/create", protect, uploadMultiple, createProduct);

// GET ALL (must be first)
router.get("/", getAllProducts);

// GET SINGLE
router.get("/:id", getSingleProduct);

// ADMIN DELETE (must be before normal delete)
router.delete("/admin/permanent/:id", protect, adminDeleteProduct);

// UPDATE
router.put("/:id", protect, uploadMultiple, updateProduct);

// DELETE (soft)
router.delete("/:id", protect, deleteProduct);

export default router;
