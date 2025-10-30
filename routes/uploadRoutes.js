import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Single file upload -> returns secure_url
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // multer-storage-cloudinary sets req.file.path to secure_url sometimes, or req.file?.path / req.file?.filename
    const url = req.file.path || req.file?.secure_url || req.file?.url || null;
    res.json({ url, raw: req.file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
