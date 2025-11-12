import express from "express";
import {
  getAllUsers,
  deleteUser,
  changeUserRole,
  toggleBlockUser,
  getProfile,
  updateProfile,
  updatePassword,
  toggleFollow,
  getUserByUsername,
  toggleVerified,
  getSuggestedUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// 🔹 Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ADMIN ROUTES
router.get("/", protect, requireAdmin, getAllUsers);
router.delete("/:id", protect, requireAdmin, deleteUser);
router.put("/:id/role", protect, requireAdmin, changeUserRole);
router.put("/:id/block", protect, requireAdmin, toggleBlockUser);
router.put("/:id/verify", protect, requireAdmin, toggleVerified);

// USER ROUTES
router.get("/me", protect, getProfile);
router.put(
  "/me",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  updateProfile
);
router.put("/me/password", protect, updatePassword);

// FOLLOW SYSTEM
router.put("/:id/follow", protect, toggleFollow);

// SUGGESTIONS + PUBLIC PROFILE
router.get("/suggestions", protect, getSuggestedUsers);
router.get("/username/:username", getUserByUsername);

export default router; // ✅ This line is required!
