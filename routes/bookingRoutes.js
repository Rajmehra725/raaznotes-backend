import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getMyBookings,
  getReceivedBookings
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/received", protect, getReceivedBookings);

export default router;
