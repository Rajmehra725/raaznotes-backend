import express from "express";
import {
  createBooking,
  getMyBookings,
  getReceivedBookings
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create booking
router.post("/create", protect, createBooking);

// My orders / bookings by buyer
router.get("/my", protect, getMyBookings);

// Bookings received by seller
router.get("/received", protect, getReceivedBookings);

export default router;
