import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  followUser,
  unfollowUser,
  getFollowersFollowing,
} from "../controllers/followController.js";

const router = express.Router();

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.get("/:id/connections", protect, getFollowersFollowing);

export default router;
