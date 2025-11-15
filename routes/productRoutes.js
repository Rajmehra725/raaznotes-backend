import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  uploadMultiple   // <-- Yahi sahi wala middleware
} from "../config/cloudinary.js";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  adminDeleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/create", protect, uploadMultiple, createProduct);

// GET ALL
router.get("/", getAllProducts);

// GET SINGLE
router.get("/:id", getSingleProduct);

// UPDATE
router.put("/:id", protect, uploadMultiple, updateProduct);

// DELETE
router.delete("/:id", protect, deleteProduct);

router.delete("/admin/permanent/:id", protect, adminDeleteProduct);

export default router;
