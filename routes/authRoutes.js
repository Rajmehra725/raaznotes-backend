import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserProfile,
  followUser,
  unfollowUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected (requires token)
router.get("/users", protect, getAllUsers);
router.put("/users/:id", protect, updateUser);
router.delete("/users/:id", protect, deleteUser);
router.get("/users/:id/profile", protect, getUserProfile);
router.post("/users/:id/follow", protect, followUser);
router.post("/users/:id/unfollow", protect, unfollowUser);
export default router;
