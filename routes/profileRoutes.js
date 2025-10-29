import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, uploadProfilePhoto } from "../controllers/profileController.js";

const router = express.Router();

// Configure multer (for temporary local upload before Cloudinary)
const upload = multer({ dest: "uploads/" });

// Routes
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.post("/photo", protect, upload.single("image"), uploadProfilePhoto);

export default router;
